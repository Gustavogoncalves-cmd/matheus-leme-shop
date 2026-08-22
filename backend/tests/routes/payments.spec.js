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
const { MercadoPago, validateWebhookSignature } = require('../../src/config/payment');

describe('Payments Routes', () => {
  let userToken;

  beforeAll(() => {
    userToken = generateToken({
      id: 1,
      email: 'user@test.com',
      role: 'customer',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // CREATE PREFERENCE TESTS (5 tests)
  // ========================================================================

  describe('POST /api/payments/create-preference', () => {
    it('should create payment preference with valid data', async () => {
      const preferenceData = {
        orderId: 1,
        cartItems: [
          {
            product_id: 1,
            name: 'Product 1',
            description: 'Desc',
            image_url: 'img.jpg',
            quantity: 1,
            price: 99.99,
          },
        ],
        customerInfo: {
          firstName: 'John',
          email: 'john@test.com',
          areaCode: '11',
          phone: '999999999',
          street: 'Street',
          streetNumber: '123',
          zipCode: '12345',
        },
      };

      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 99.99,
        status: 'pending',
      };

      const mockPreference = {
        id: 'preference_123',
        init_point: 'https://mercadopago.com/checkout/preference_123',
      };

      Order.findById.mockResolvedValue(mockOrder);
      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        preference: { create: jest.fn().mockResolvedValue(mockPreference) },
      }));
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send(preferenceData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.init_point).toBe(mockPreference.init_point);
      expect(res.body.data.preference_id).toBe('preference_123');
    });

    it('should reject request without orderId', async () => {
      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cartItems: [],
          customerInfo: {},
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('orderId');
    });

    it('should reject request without cartItems', async () => {
      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          customerInfo: {},
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('cartItems');
    });

    it('should reject request without customerInfo', async () => {
      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cartItems: [{ product_id: 1, quantity: 1, price: 99.99 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('customerInfo');
    });

    it('should reject if order does not belong to user', async () => {
      const mockOrder = {
        id: 1,
        user_id: 999,
        total_price: 99.99,
      };

      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cartItems: [{ product_id: 1, quantity: 1, price: 99.99 }],
          customerInfo: { email: 'test@test.com' },
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('should return init_point URL in response', async () => {
      const mockOrder = { id: 1, user_id: 1, total_price: 99.99 };
      const mockPreference = {
        id: 'pref_123',
        init_point: 'https://mercadopago.com.br/checkout/pref_123',
      };

      Order.findById.mockResolvedValue(mockOrder);
      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        preference: { create: jest.fn().mockResolvedValue(mockPreference) },
      }));
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/payments/create-preference')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cartItems: [{ product_id: 1, quantity: 1, price: 99.99 }],
          customerInfo: { email: 'test@test.com' },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.init_point).toContain('mercadopago');
    });
  });

  // ========================================================================
  // WEBHOOK TESTS (4 tests)
  // ========================================================================

  describe('POST /api/payments/webhook', () => {
    it('should accept webhook with valid signature', async () => {
      const webhookData = {
        type: 'payment',
        data: { id: 'payment_123' },
      };

      validateWebhookSignature.mockReturnValue(true);

      const mockOrder = { id: 1, user_id: 1, status: 'pending' };
      const mockPayment = {
        id: 'payment_123',
        status: 'approved',
        external_reference: 'ORDER_1',
      };

      Order.findById.mockResolvedValue(mockOrder);
      Order.updateStatus.mockResolvedValue({ id: 1, status: 'paid' });
      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        payment: { get: jest.fn().mockResolvedValue(mockPayment) },
      }));
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-signature', 'valid_signature')
        .set('x-request-id', 'request_123')
        .send(webhookData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
      validateWebhookSignature.mockReturnValue(false);

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-signature', 'invalid_signature')
        .set('x-request-id', 'request_123')
        .send({
          type: 'payment',
          data: { id: 'payment_123' },
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid webhook signature');
    });

    it('should update order status to paid on approved payment', async () => {
      validateWebhookSignature.mockReturnValue(true);

      const mockOrder = { id: 1, user_id: 1 };
      const mockPayment = {
        id: 'payment_123',
        status: 'approved',
        external_reference: 'ORDER_1',
      };

      Order.findById.mockResolvedValue(mockOrder);
      Order.updateStatus.mockResolvedValue({ id: 1, status: 'paid' });
      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        payment: { get: jest.fn().mockResolvedValue(mockPayment) },
      }));
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-signature', 'valid_signature')
        .set('x-request-id', 'request_123')
        .send({
          type: 'payment',
          data: { id: 'payment_123' },
        });

      expect(res.status).toBe(200);
      expect(Order.updateStatus).toHaveBeenCalledWith('1', 'paid');
    });

    it('should update order status to payment_failed on rejected payment', async () => {
      validateWebhookSignature.mockReturnValue(true);

      const mockOrder = { id: 1, user_id: 1 };
      const mockPayment = {
        id: 'payment_123',
        status: 'rejected',
        external_reference: 'ORDER_1',
      };

      Order.findById.mockResolvedValue(mockOrder);
      Order.updateStatus.mockResolvedValue({ id: 1, status: 'payment_failed' });
      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        payment: { get: jest.fn().mockResolvedValue(mockPayment) },
      }));
      pool.query.mockResolvedValue({});

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-signature', 'valid_signature')
        .set('x-request-id', 'request_123')
        .send({
          type: 'payment',
          data: { id: 'payment_123' },
        });

      expect(res.status).toBe(200);
      expect(Order.updateStatus).toHaveBeenCalledWith('1', 'payment_failed');
    });

    it('should return 200 for non-payment webhook type', async () => {
      validateWebhookSignature.mockReturnValue(true);

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('x-signature', 'valid_signature')
        .set('x-request-id', 'request_123')
        .send({
          type: 'merchant_order',
          data: { id: 'order_123' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ========================================================================
  // PAYMENT STATUS TESTS (3 tests)
  // ========================================================================

  describe('GET /api/payments/status/:payment_id', () => {
    it('should return payment status', async () => {
      const mockPayment = {
        id: 'payment_123',
        status: 'approved',
        status_detail: 'accredited',
        external_reference: 'ORDER_1',
        transaction_amount: 99.99,
        installments: 1,
        payment_method_id: 'credit_card',
        date_created: '2024-08-21T00:00:00Z',
      };

      MercadoPago.MercadoPagoClient.mockImplementation(() => ({
        payment: { get: jest.fn().mockResolvedValue(mockPayment) },
      }));

      const res = await request(app)
        .get('/api/payments/status/payment_123')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.transaction_amount).toBe(99.99);
    });

    it('should reject request without payment_id', async () => {
      const res = await request(app)
        .get('/api/payments/status/')
        .set('Authorization', `Bearer ${userToken}`);

      expect([404, 400]).toContain(res.status);
    });

    it('should require authentication to check payment status', async () => {
      const res = await request(app)
        .get('/api/payments/status/payment_123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
