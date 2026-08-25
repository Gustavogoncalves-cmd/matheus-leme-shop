const request = require('supertest');
jest.mock('../../src/config/payment', () => ({ validateWebhookSignature: jest.fn(), getPaymentStatus: jest.fn(), createPreference: jest.fn() }));
jest.mock('../../src/config/database');
jest.mock('../../src/models/Order');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const Order = require('../../src/models/Order');
const { generateToken } = require('../../src/middleware/auth');
const userToken = generateToken({ id: 1, email: 'user@test.com', role: 'customer' });
const adminToken = generateToken({ id: 2, email: 'admin@test.com', role: 'admin' });

describe('Pedidos digitais', () => {
  beforeEach(() => jest.clearAllMocks());
  it('recalcula preços e ignora total enviado pelo cliente', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, price: '100.00', discount: 10, available: true }] });
    Order.create.mockImplementation(async (userId, data) => ({ id: 3, user_id: userId, total_price: data.totalPrice, items: data.items }));
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send({ items: [{ product_id: 1, quantity: 2, price: 1 }], totalPrice: 1 });
    expect(res.status).toBe(201);
    expect(Order.create).toHaveBeenCalledWith(1, expect.objectContaining({ totalPrice: 180, status: 'pending_payment' }));
  });
  it('rejeita item indisponível ou inexistente', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send({ items: [{ product_id: 9, quantity: 1 }] });
    expect(res.status).toBe(400);
  });
  it('rejeita quantidade inválida e exige login', async () => {
    expect((await request(app).post('/api/orders').send({ items: [{ product_id: 1, quantity: 1 }] })).status).toBe(401);
    expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send({ items: [{ product_id: 1, quantity: 0 }] })).status).toBe(400);
  });
  it('lista apenas pedidos do usuário', async () => {
    Order.findByUserId.mockResolvedValue([{ id: 1 }]); Order.countByUserId.mockResolvedValue(1);
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200); expect(Order.findByUserId).toHaveBeenCalledWith(1, 20, 0);
  });
  it('protege detalhes por ownership e permite admin', async () => {
    Order.findById.mockResolvedValue({ id: 1, user_id: 99, items: [] });
    expect((await request(app).get('/api/orders/1').set('Authorization', `Bearer ${userToken}`)).status).toBe(403);
    expect((await request(app).get('/api/orders/1').set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
  });
  it('admin atualiza status digital válido', async () => {
    Order.findById.mockResolvedValue({ id: 1 }); Order.updateStatus.mockResolvedValue({ id: 1, status: 'paid' });
    const res = await request(app).patch('/api/orders/1/status').set('Authorization', `Bearer ${adminToken}`).send({ status: 'paid' });
    expect(res.status).toBe(200);
  });
});
