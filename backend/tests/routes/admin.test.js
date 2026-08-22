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

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

// Mock modules
jest.mock('../../src/models/Product');
jest.mock('../../src/models/Order');

const pool = require('../../src/config/database');
const Product = require('../../src/models/Product');
const Order = require('../../src/models/Order');

describe('Admin Routes', () => {
  let adminToken;
  let customerToken;

  beforeAll(() => {
    // Generate tokens for testing
    adminToken = generateToken({
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    customerToken = generateToken({
      id: 2,
      email: 'customer@test.com',
      role: 'customer',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // AUTHENTICATION & AUTHORIZATION TESTS
  // ========================================================================

  describe('Authentication & Authorization', () => {
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/admin/products');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('No authentication token provided');
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/products')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject customer accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Insufficient permissions');
    });

    it('should allow admin accessing admin routes', async () => {
      Product.findAll.mockResolvedValue([]);
      pool.query.mockResolvedValue({
        rows: [{ total: '0' }],
      });

      const res = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should not return 401 or 403
      expect([200, 500]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });
  });

  // ========================================================================
  // PRODUCTS ENDPOINTS
  // ========================================================================

  describe('GET /api/admin/products', () => {
    it('should list products with pagination', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Product 1',
          price: 99.99,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
        {
          id: 2,
          title: 'Product 2',
          price: 199.99,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      Product.findAll.mockResolvedValue(mockProducts);
      pool.query.mockResolvedValue({ rows: [{ total: '2' }] });

      const res = await request(app)
        .get('/api/admin/products?limit=20&offset=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Individual Product',
          price: 99.99,
          category: 'individual',
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      Product.findAll.mockResolvedValue(mockProducts);
      pool.query.mockResolvedValue({ rows: [{ total: '1' }] });

      const res = await request(app)
        .get('/api/admin/products?category=individual')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe('individual');
    });

    it('should search products by keyword', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Searchable Product',
          price: 99.99,
          images: JSON.stringify([]),
          features: JSON.stringify([]),
          previews: JSON.stringify([]),
        },
      ];

      Product.findAll.mockResolvedValue(mockProducts);
      pool.query.mockResolvedValue({ rows: [{ total: '1' }] });

      const res = await request(app)
        .get('/api/admin/products?search=searchable')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/admin/products', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        title: 'New Product',
        category: 'individual',
        description: 'A new product',
        price: 99.99,
        images: [],
        features: [],
      };

      const mockCreatedProduct = {
        id: 1,
        ...productData,
        images: '[]',
        features: '[]',
        previews: '[]',
      };

      Product.create.mockResolvedValue(mockCreatedProduct);

      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Product without price',
          category: 'individual',
          description: 'Missing price',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should reject invalid price', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Product',
          category: 'individual',
          description: 'Description',
          price: 'not a number',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Price must be a positive number');
    });

    it('should reject customer from creating products', async () => {
      const res = await request(app)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Product',
          category: 'individual',
          description: 'Description',
          price: 99.99,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/products/:id', () => {
    it('should update product fields', async () => {
      const updatedProduct = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        images: '[]',
        features: '[]',
        previews: '[]',
      };

      Product.update.mockResolvedValue(updatedProduct);

      const res = await request(app)
        .patch('/api/admin/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Product',
          price: 149.99,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Product');
    });

    it('should return 404 for non-existent product', async () => {
      Product.update.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/admin/products/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject customer from updating products', async () => {
      const res = await request(app)
        .patch('/api/admin/products/1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/products/:id', () => {
    it('should delete a product', async () => {
      Product.delete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/admin/products/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      Product.delete.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/admin/products/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject customer from deleting products', async () => {
      const res = await request(app)
        .delete('/api/admin/products/1')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // ORDERS ENDPOINTS
  // ========================================================================

  describe('GET /api/admin/orders', () => {
    it('should list orders with pagination', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 299.99,
        status: 'pending',
        payment_method: 'pending',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] }) // count
        .mockResolvedValueOnce({ rows: [mockOrder] }) // orders
        .mockResolvedValueOnce({ rows: [] }); // items

      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter orders by status', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 299.99,
        status: 'processing',
        payment_method: 'pending',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] }) // count
        .mockResolvedValueOnce({ rows: [mockOrder] }) // orders
        .mockResolvedValueOnce({ rows: [] }); // items

      const res = await request(app)
        .get('/api/admin/orders?status=processing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].status).toBe('processing');
    });

    it('should reject customer from listing orders', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const updatedOrder = {
        id: 1,
        user_id: 1,
        total_price: 299.99,
        status: 'processing',
      };

      Order.updateStatus.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .patch('/api/admin/orders/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('processing');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch('/api/admin/orders/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid status');
    });

    it('should return 404 for non-existent order', async () => {
      Order.updateStatus.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/admin/orders/999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject customer from updating order status', async () => {
      const res = await request(app)
        .patch('/api/admin/orders/1/status')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // DASHBOARD ENDPOINT
  // ========================================================================

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard statistics', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total_revenue: 1000.00 }] }) // revenue
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // orders count
        .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // customers count
        .mockResolvedValueOnce({ rows: [{ id: 1, total_price: 100 }] }) // recent orders
        .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Product', total_sold: 10 }] }) // top products
        .mockResolvedValueOnce({
          rows: [
            {
              month: '2024-08-01',
              order_count: 5,
              revenue: 1000.00,
            },
          ],
        }); // chart data

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRevenue).toBe(1000.00);
      expect(res.body.data.totalOrders).toBe(5);
      expect(res.body.data.totalCustomers).toBe(3);
      expect(res.body.data.recentOrders).toBeDefined();
      expect(res.body.data.topProducts).toBeDefined();
      expect(res.body.data.chartData.monthly_sales).toBeDefined();
    });

    it('should reject customer from accessing dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      Product.findAll.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Failed to fetch');
    });

    it('should return 400 for invalid product ID', async () => {
      const res = await request(app)
        .patch('/api/admin/products/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid order ID', async () => {
      const res = await request(app)
        .patch('/api/admin/orders/invalid-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
