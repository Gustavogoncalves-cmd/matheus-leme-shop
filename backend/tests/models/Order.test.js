const Order = require('../../src/models/Order');

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../../src/config/database');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // CREATE TESTS (2 tests)
  // ========================================================================

  describe('create', () => {
    it('should create order with items', async () => {
      const userId = 1;
      const orderData = {
        items: [
          { product_id: 1, quantity: 2, price: 99.99 },
          { product_id: 2, quantity: 1, price: 149.99 },
        ],
        shippingAddress: {
          street: 'Main St',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
        },
        totalPrice: 349.97,
        status: 'pending',
      };

      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      const mockOrderResult = {
        rows: [{
          id: 1,
          user_id: userId,
          total_price: 349.97,
          shipping_address: JSON.stringify(orderData.shippingAddress),
          status: 'pending',
          payment_method: 'pending',
          created_at: '2024-08-21T00:00:00Z',
        }],
      };

      const mockItemsResult = {
        rows: [
          { id: 1, product_id: 1, quantity: 2, price: 99.99 },
          { id: 2, product_id: 2, quantity: 1, price: 149.99 },
        ],
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce(mockOrderResult) // INSERT order
        .mockResolvedValueOnce(mockItemsResult) // INSERT items
        .mockResolvedValueOnce({}); // COMMIT

      pool.connect.mockResolvedValue(mockClient);

      const result = await Order.create(userId, orderData);

      expect(result.id).toBe(1);
      expect(result.user_id).toBe(userId);
      expect(result.items).toHaveLength(2);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should create order without items', async () => {
      const userId = 1;
      const orderData = {
        items: [],
        shippingAddress: { street: 'Main St' },
        totalPrice: 0,
        status: 'pending',
      };

      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      const mockOrderResult = {
        rows: [{
          id: 1,
          user_id: userId,
          total_price: 0,
          shipping_address: JSON.stringify(orderData.shippingAddress),
          status: 'pending',
          payment_method: 'pending',
          created_at: '2024-08-21T00:00:00Z',
        }],
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce(mockOrderResult) // INSERT order
        .mockResolvedValueOnce({}); // COMMIT

      pool.connect.mockResolvedValue(mockClient);

      const result = await Order.create(userId, orderData);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(0);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback on error during order creation', async () => {
      const userId = 1;
      const orderData = {
        items: [{ product_id: 1, quantity: 1, price: 99.99 }],
        shippingAddress: {},
        totalPrice: 99.99,
      };

      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Insert failed')); // INSERT order error

      pool.connect.mockResolvedValue(mockClient);

      await expect(Order.create(userId, orderData)).rejects.toThrow('Insert failed');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should store shipping address as JSON string', async () => {
      const userId = 1;
      const shippingAddress = {
        street: 'Main St',
        number: '123',
        city: 'São Paulo',
      };

      const orderData = {
        items: [],
        shippingAddress,
        totalPrice: 100,
      };

      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            user_id: userId,
            total_price: 100,
            shipping_address: JSON.stringify(shippingAddress),
            status: 'pending',
            payment_method: 'pending',
            created_at: '2024-08-21T00:00:00Z',
          }],
        }) // INSERT order
        .mockResolvedValueOnce({}); // COMMIT

      pool.connect.mockResolvedValue(mockClient);

      const result = await Order.create(userId, orderData);

      const insertQuery = mockClient.query.mock.calls[1][0];
      expect(insertQuery).toContain('INSERT INTO orders');
    });
  });

  // ========================================================================
  // FIND BY ID TESTS (2 tests)
  // ========================================================================

  describe('findById', () => {
    it('should find order by id with items', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 199.98,
        shipping_address: JSON.stringify({ street: 'Main St' }),
        status: 'pending',
        payment_method: 'pending',
        mercadopago_preference_id: null,
        mercadopago_payment_id: null,
        created_at: '2024-08-21T00:00:00Z',
      };

      const mockItems = {
        rows: [
          { id: 1, product_id: 1, quantity: 2, price: 99.99 },
        ],
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockOrder] }) // SELECT order
        .mockResolvedValueOnce(mockItems); // SELECT items

      const result = await Order.findById(1);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(typeof result.shipping_address).toBe('object');
    });

    it('should parse shipping address from JSON string', async () => {
      const shippingAddress = { street: 'Main St', city: 'São Paulo' };
      const mockOrder = {
        id: 1,
        user_id: 1,
        total_price: 100,
        shipping_address: JSON.stringify(shippingAddress),
        status: 'pending',
        payment_method: 'pending',
        mercadopago_preference_id: null,
        mercadopago_payment_id: null,
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await Order.findById(1);

      expect(result.shipping_address).toEqual(shippingAddress);
    });

    it('should return null when order not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Order.findById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(Order.findById(1)).rejects.toThrow('Database error');
    });
  });

  // ========================================================================
  // FIND BY USER ID TESTS (1 test)
  // ========================================================================

  describe('findByUserId', () => {
    it('should find orders by user id with pagination', async () => {
      const mockOrders = [
        {
          id: 1,
          user_id: 1,
          total_price: 199.98,
          status: 'pending',
          payment_method: 'pending',
          mercadopago_payment_id: null,
          created_at: '2024-08-21T00:00:00Z',
        },
      ];

      pool.query.mockResolvedValue({ rows: mockOrders });

      const result = await Order.findByUserId(1, 20, 0);

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        [1, 20, 0]
      );
    });
  });

  // ========================================================================
  // COUNT BY USER ID TESTS (1 test)
  // ========================================================================

  describe('countByUserId', () => {
    it('should count orders by user id', async () => {
      pool.query.mockResolvedValue({ rows: [{ count: '5' }] });

      const result = await Order.countByUserId(1);

      expect(result).toBe(5);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*)'),
        [1]
      );
    });

    it('should return 0 when no orders found', async () => {
      pool.query.mockResolvedValue({ rows: [{ count: '0' }] });

      const result = await Order.countByUserId(1);

      expect(result).toBe(0);
    });
  });

  // ========================================================================
  // UPDATE STATUS TESTS (2 tests)
  // ========================================================================

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockUpdatedOrder = {
        id: 1,
        user_id: 1,
        total_price: 199.98,
        status: 'processing',
        payment_method: 'pending',
        mercadopago_payment_id: null,
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedOrder] });

      const result = await Order.updateStatus(1, 'processing');

      expect(result.id).toBe(1);
      expect(result.status).toBe('processing');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders'),
        ['processing', 1]
      );
    });

    it('should return null when order not found for update', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await Order.updateStatus(999, 'processing');

      expect(result).toBeNull();
    });

    it('should set updated_at timestamp', async () => {
      const mockUpdatedOrder = {
        id: 1,
        user_id: 1,
        total_price: 100,
        status: 'paid',
        payment_method: 'mercadopago',
        mercadopago_payment_id: 'pay_123',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedOrder] });

      await Order.updateStatus(1, 'paid');

      const query = pool.query.mock.calls[0][0];
      expect(query).toContain('updated_at = CURRENT_TIMESTAMP');
    });

    it('should handle database errors during status update', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(Order.updateStatus(1, 'paid')).rejects.toThrow('Database error');
    });
  });
});
