const pool = require('../config/database');

class Order {
  /**
   * Create new order with items
   */
  static async create(userId, orderData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { items, totalPrice, shippingAddress, status = 'pending' } = orderData;

      // Insert order
      const orderQuery = `
        INSERT INTO orders (user_id, total_price, shipping_address, status, payment_method)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, total_price, shipping_address, status, payment_method, created_at
      `;

      const orderResult = await client.query(orderQuery, [
        userId,
        totalPrice,
        JSON.stringify(shippingAddress),
        status,
        'pending',
      ]);

      const orderId = orderResult.rows[0].id;

      // Insert order items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ${items.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
          RETURNING id, product_id, quantity, price
        `;

        const itemsValues = [];
        items.forEach(item => {
          itemsValues.push(orderId, item.product_id, item.quantity, item.price);
        });

        const itemsResult = await client.query(itemsQuery, itemsValues);
        await client.query('COMMIT');

        return {
          ...orderResult.rows[0],
          items: itemsResult.rows,
        };
      }

      await client.query('COMMIT');
      return {
        ...orderResult.rows[0],
        items: [],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find order by ID with items
   */
  static async findById(orderId) {
    try {
      const orderQuery = `
        SELECT id, user_id, total_price, shipping_address, status, payment_method, mercadopago_preference_id, mercadopago_payment_id, created_at
        FROM orders
        WHERE id = $1
      `;

      const orderResult = await pool.query(orderQuery, [orderId]);
      if (orderResult.rows.length === 0) return null;

      const order = orderResult.rows[0];

      // Get order items
      const itemsQuery = `
        SELECT id, product_id, quantity, price
        FROM order_items
        WHERE order_id = $1
      `;

      const itemsResult = await pool.query(itemsQuery, [orderId]);

      return {
        ...order,
        shipping_address: typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address,
        items: itemsResult.rows,
      };
    } catch (error) {
      console.error('Error finding order by ID:', error);
      throw error;
    }
  }

  /**
   * Find all orders for a user
   */
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT id, user_id, total_price, status, payment_method, mercadopago_payment_id, created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error finding orders by user ID:', error);
      throw error;
    }
  }

  /**
   * Get order count for a user
   */
  static async countByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId, status) {
    try {
      const query = `
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, user_id, total_price, status, payment_method, mercadopago_payment_id, created_at
      `;

      const result = await pool.query(query, [status, orderId]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

module.exports = Order;
