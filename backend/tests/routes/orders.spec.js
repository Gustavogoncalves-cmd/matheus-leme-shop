const request = require('supertest');

// Mock payment config before requiring app
jest.mock('../../src/config/payment', () => ({
  MercadoPago: {
    MercadoPagoClient: jest.fn(),
  },
  validateWebhookSignature: jest.fn(),
  getPaymentStatus: jest.fn(),
}));

const app = require('../../src/app');
const { generateToken } = require('../../src/middleware/auth');

// Mock modules
jest.mock('../../src/config/database');
jest.mock('../../src/models/Order');

const pool = require('../../src/config/database');
const Order = require('../../src/models/Order');

describe('Orders Routes', () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = generateToken({
      id: 1,
      email: 'user@test.com',
      role: 'customer',
    });

    adminToken = generateToken({
      id: 2,
      email: 'admin@test.com',
      role: 'admin',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // CREATE ORDER TESTS (2 tests)
  // ========================================================================

  describe('POST /api/orders', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        items: [
          { product_id: 1, quantity: 2, price: 99.99 },
        ],
        shippingAddress: {
          street: 'Main St',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        totalPrice: 199.98,
      };

      const mockCreatedOrder = {
        id: 1,
        user_id: 1,
        ...orderData,
        status: 'pending',
        created_at: '2024-08-21T00:00:00Z',
        items: orderData.items,
      };

      Order.create.mockResolvedValue(mockCreatedOrder);
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.user_id).toBe(1);
    });

    it('should reject order without items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [],
          shippingAddress: { street: 'St' },
          totalPrice: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('at least one item');
    });

    it('should reject order without shippingAddress', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1, price: 99.99 }],
          totalPrice: 99.99,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Shipping address');
    });

    it('should reject order with invalid totalPrice', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1, price: 99.99 }],
          shippingAddress: { street: 'St' },
          totalPrice: -50,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Valid total price');
    });

    it('should require authentication to create order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ product_id: 1 }],
          shippingAddress: {},
          totalPrice: 100,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // GET ORDERS TESTS (2 tests)
  // ========================================================================

  describe('GET /api/orders', () => {
    it('should list user orders with pagination', async () => {
      const mockOrders = [
        {
          id: 1,
          user_id: 1,
          total_price: 199.98,
          status: 'pending',
          created_at: '2024-08-21T00:00:00Z',
        },
      ];

      Order.findByUserId.mockResolvedValue(mockOrders);
      Order.countByUserId.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/orders?limit=20&offset=0')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('should reject invalid limit value', async () => {
      const res = await request(app)
        .get('/api/orders?limit=150')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('between 1 and 100');
    });

    it('should require authentication to list orders', async () => {
      const res = await request(app)
        .get('/api/orders');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // GET ORDER BY ID TESTS (2 tests)
  // ========================================================================

  describe('GET /api/orders/:id', () => {
    it('should return order details for user own order', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 199.98,
        status: 'pending',
        shipping_address: { street: 'Main St' },
        items: [{ product_id: 1, quantity: 2, price: 99.99 }],
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('should reject if order does not belong to user', async () => {
      const mockOrder = {
        id: 1,
        user_id: 999,
        total_price: 199.98,
        status: 'pending',
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should allow admin to view any order', async () => {
      const mockOrder = {
        id: 1,
        user_id: 999,
        total_price: 199.98,
        status: 'pending',
        items: [],
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      Order.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/orders/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Order not found');
    });
  });

  // ========================================================================
  // UPDATE ORDER STATUS TESTS (2 tests)
  // ========================================================================

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status as admin', async () => {
      const mockOrder = { id: 1, user_id: 1, status: 'pending' };
      const updatedOrder = { id: 1, user_id: 1, status: 'processing' };

      Order.findById.mockResolvedValue(mockOrder);
      Order.updateStatus.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .patch('/api/orders/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('processing');
    });

    it('should reject invalid order status', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Status must be one of');
    });

    it('should reject customer from updating order status', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should require admin role to update status', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'processing' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
