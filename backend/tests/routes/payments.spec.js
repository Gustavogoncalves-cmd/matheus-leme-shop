const request = require('supertest');
jest.mock('../../src/config/payment', () => ({ validateWebhookSignature: jest.fn(), getPaymentStatus: jest.fn(), createPreference: jest.fn() }));
jest.mock('../../src/config/database');
jest.mock('../../src/models/Order');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const Order = require('../../src/models/Order');
const payment = require('../../src/config/payment');
const { generateToken } = require('../../src/middleware/auth');
const token = generateToken({ id: 1, email: 'user@test.com', role: 'customer' });

const mockClient = () => ({ query: jest.fn().mockResolvedValue({ rows: [{ payment_id: '123' }] }), release: jest.fn() });

describe('Mercado Pago', () => {
  beforeEach(() => jest.clearAllMocks());
  it('cria preferência exclusivamente a partir do pedido persistido', async () => {
    Order.findById.mockResolvedValue({ id: 1, user_id: 1, status: 'pending_payment', items: [{ product_id: 7, product_title: 'Pack', quantity: 2, price: '45.00' }] });
    payment.createPreference.mockResolvedValue({ id: 'pref', init_point: 'https://mercadopago.com/checkout' });
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app).post('/api/payments/create-preference').set('Authorization', `Bearer ${token}`).send({ orderId: 1, cartItems: [{ price: 0.01 }] });
    expect(res.status).toBe(201);
    expect(payment.createPreference).toHaveBeenCalledWith(expect.objectContaining({ items: [expect.objectContaining({ unit_price: 45, quantity: 2 })] }));
  });
  it('rejeita preferência de outro usuário ou pedido já pago', async () => {
    Order.findById.mockResolvedValueOnce({ id: 1, user_id: 2, status: 'pending_payment', items: [{}] });
    expect((await request(app).post('/api/payments/create-preference').set('Authorization', `Bearer ${token}`).send({ orderId: 1 })).status).toBe(403);
    Order.findById.mockResolvedValueOnce({ id: 1, user_id: 1, status: 'paid', items: [{}] });
    expect((await request(app).post('/api/payments/create-preference').set('Authorization', `Bearer ${token}`).send({ orderId: 1 })).status).toBe(409);
  });
  it('rejeita assinatura inválida', async () => {
    payment.validateWebhookSignature.mockReturnValue(false);
    expect((await request(app).post('/api/payments/webhook').send({ type: 'payment', data: { id: 123 } })).status).toBe(401);
  });
  it('processa pagamento aprovado em transação', async () => {
    payment.validateWebhookSignature.mockReturnValue(true);
    payment.getPaymentStatus.mockResolvedValue({ id: 123, status: 'approved', external_reference: 'ORDER_1', transaction_amount: 90, currency_id: 'BRL' });
    Order.findById.mockResolvedValue({ id: 1, user_id: 1, total_price: '90.00' });
    const client = mockClient(); pool.connect.mockResolvedValue(client);
    const res = await request(app).post('/api/payments/webhook').set('x-signature', 'x').set('x-request-id', 'r').send({ type: 'payment', data: { id: 123 } });
    expect(res.status).toBe(200); expect(client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE orders'), ['paid', '123', 1]); expect(client.release).toHaveBeenCalled();
  });
  it('recusa valor divergente', async () => {
    payment.validateWebhookSignature.mockReturnValue(true);
    payment.getPaymentStatus.mockResolvedValue({ status: 'approved', external_reference: 'ORDER_1', transaction_amount: 1, currency_id: 'BRL' });
    Order.findById.mockResolvedValue({ id: 1, total_price: 90 });
    const res = await request(app).post('/api/payments/webhook').set('x-signature', 'x').set('x-request-id', 'r').send({ type: 'payment', data: { id: 123 } });
    expect(res.status).toBe(422); expect(pool.connect).not.toHaveBeenCalled();
  });
  it('retorna duplicate em reentrega idempotente', async () => {
    payment.validateWebhookSignature.mockReturnValue(true);
    payment.getPaymentStatus.mockResolvedValue({ status: 'approved', external_reference: 'ORDER_1', transaction_amount: 90, currency_id: 'BRL' });
    Order.findById.mockResolvedValue({ id: 1, total_price: 90 });
    const client = mockClient(); client.query.mockResolvedValueOnce({}).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({}); pool.connect.mockResolvedValue(client);
    const res = await request(app).post('/api/payments/webhook').set('x-signature', 'x').set('x-request-id', 'r').send({ type: 'payment', data: { id: 123 } });
    expect(res.body.duplicate).toBe(true);
  });
});
