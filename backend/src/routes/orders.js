const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/orders
 * Create new order (authenticated)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, totalPrice } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required',
      });
    }

    if (!totalPrice || totalPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total price is required',
      });
    }

    // Create order
    const order = await Order.create(req.user.id, {
      items,
      shippingAddress,
      totalPrice,
      status: 'pending',
    });

    // Clear user's cart after order creation
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message,
    });
  }
});

/**
 * GET /api/orders
 * Get user's orders with pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedOffset = parseInt(offset, 10) || 0;

    if (parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
    }

    // Get orders
    const orders = await Order.findByUserId(req.user.id, parsedLimit, parsedOffset);

    // Get total count
    const total = await Order.countByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message,
    });
  }
});

/**
 * GET /api/orders/:id
 * Get specific order with details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Verify ownership (user can only view their own orders)
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message,
    });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status (admin only)
 */
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Get current order to verify it exists
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Update status
    const updatedOrder = await Order.updateStatus(id, status);

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error.message,
    });
  }
});

/**
 * GET /api/orders/admin/list
 * Get all orders for admin panel
 */
router.get('/admin/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedOffset = parseInt(offset, 10) || 0;

    let query = 'SELECT id, user_id, total_price, status, created_at FROM orders';
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` WHERE status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + paramCount + ' OFFSET $' + (paramCount + 1);
    values.push(parsedLimit, parsedOffset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM orders';
    const countValues = [];
    if (status) {
      countQuery += ' WHERE status = $1';
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        orders: result.rows,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message,
    });
  }
});

module.exports = router;
