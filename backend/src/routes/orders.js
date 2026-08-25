const express = require('express');
const path = require('path');
const router = express.Router();
const Order = require('../models/Order');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     description: Create a new order from cart items with shipping address
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - totalPrice
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Order items
 *               shippingAddress:
 *                 type: object
 *                 description: Shipping address details
 *               totalPrice:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item',
      });
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item.product_id ?? item.id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid product_id and quantity between 1 and 99',
        });
      }
      const combinedQuantity = (quantities.get(productId) || 0) + quantity;
      if (combinedQuantity > 99) {
        return res.status(400).json({
          success: false,
          error: 'Combined quantity for a product cannot exceed 99',
        });
      }
      quantities.set(productId, combinedQuantity);
    }

    const productIds = [...quantities.keys()];
    const productsResult = await pool.query(
      `SELECT id, price, discount, available
       FROM products
       WHERE id = ANY($1::int[])`,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length || productsResult.rows.some(product => !product.available)) {
      return res.status(400).json({
        success: false,
        error: 'One or more products are unavailable',
      });
    }

    const pricedItems = productsResult.rows.map(product => {
      const price = Number(product.price) * (1 - Number(product.discount || 0) / 100);
      return {
        product_id: product.id,
        quantity: quantities.get(product.id),
        price: Number(price.toFixed(2)),
      };
    });
    const totalPrice = Number(pricedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ).toFixed(2));

    const order = await Order.create(req.user.id, {
      items: pricedItems,
      totalPrice,
      status: 'pending_payment',
    });

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
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List user orders
 *     description: Get all orders for the authenticated user with pagination
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of orders per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of orders to skip
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
    }

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        success: false,
        error: 'Offset must be a non-negative integer',
      });
    }

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
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     description: Get details of a specific order (user can only view their own, admins can view all)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - cannot view other user's orders
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id/items/:itemId/download', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.user_id, o.status, p.download_path, p.title
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1 AND oi.id = $2`,
      [req.params.id, req.params.itemId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Download not found' });
    }

    const item = result.rows[0];
    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to download this item' });
    }
    if (item.status !== 'paid') {
      return res.status(403).json({ success: false, error: 'Payment must be approved before download' });
    }
    if (!item.download_path) {
      return res.status(404).json({ success: false, error: 'Product file is not configured' });
    }

    const downloadsRoot = path.resolve(__dirname, '../../private/downloads');
    const filePath = path.resolve(downloadsRoot, item.download_path);
    if (!filePath.startsWith(`${downloadsRoot}${path.sep}`)) {
      return res.status(400).json({ success: false, error: 'Invalid product file' });
    }

    const extension = path.extname(filePath);
    const safeTitle = item.title.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');
    return res.download(filePath, `${safeTitle || 'produto'}${extension}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'Product file not found' });
    }
    console.error('Error downloading order item:', error);
    return res.status(500).json({ success: false, error: 'Failed to download product' });
  }
});

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
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update order status (admin only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    const validStatuses = ['pending_payment', 'paid', 'payment_failed', 'refunded', 'cancelled'];
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
 * @swagger
 * /api/orders/admin/list:
 *   get:
 *     summary: List all orders (admin)
 *     description: Get all orders in the system with optional filtering by status
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of orders per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of orders to skip
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       500:
 *         description: Server error
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
