const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth');
const pool = require('../config/database');

/**
 * Middleware: Verify JWT + Admin role
 * All routes in this file require admin authentication
 */
router.use(authenticate, authorize('admin'));

// ============================================================================
// PRODUTOS
// ============================================================================

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: List all products (admin)
 *     description: Get all products with filtering and pagination (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Max 100 items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       500:
 *         description: Server error
 */
router.get('/products', async (req, res) => {
  try {
    const {
      search,
      category,
      limit = 20,
      offset = 0,
    } = req.query;

    const filters = {
      limit: Math.min(parseInt(limit), 100), // Max 100 per page
      offset: Math.max(0, parseInt(offset)),
    };

    if (category) filters.category = category;
    if (search) filters.search = search;

    // Get products
    const products = await Product.findAll(filters);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countValues = [];
    let paramCount = 1;

    if (category) {
      countQuery += ` AND category = $${paramCount}`;
      countValues.push(category);
      paramCount++;
    }

    if (search) {
      countQuery += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      countValues.push(`%${search}%`);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      success: true,
      data: products,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create product (admin)
 *     description: Create a new product (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               featured:
 *                 type: boolean
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.post('/products', async (req, res) => {
  try {
    const {
      title,
      headerTitle,
      category,
      type,
      description,
      shortDescription,
      price,
      discount,
      priceOriginal,
      featured,
      available,
      themeColor,
      thumbnail,
      images,
      features,
      previews,
    } = req.body;

    // Validation
    if (!title || !category || !description || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, category, description, price',
      });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number',
      });
    }

    const product = await Product.create({
      title,
      headerTitle,
      category,
      type,
      description,
      shortDescription,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : null,
      priceOriginal: priceOriginal ? parseFloat(priceOriginal) : null,
      featured: featured || false,
      available: available !== false,
      themeColor,
      thumbnail,
      images,
      features,
      previews,
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/admin/products/{id}:
 *   patch:
 *     summary: Update product (admin)
 *     description: Update product fields (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               featured:
 *                 type: boolean
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Product not found
 */
router.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
    }

    // Validate price if provided
    if (req.body.price !== undefined) {
      const price = parseFloat(req.body.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be a positive number',
        });
      }
      req.body.price = price;
    }

    const product = await Product.update(id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product (admin)
 *     description: Delete a product (admin only)
 *     tags:
 *       - Admin - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
    }

    const deleted = await Product.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message,
    });
  }
});

// ============================================================================
// PEDIDOS
// ============================================================================

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: List all orders (admin)
 *     description: Get all orders with optional filtering by status and date (admin only)
 *     tags:
 *       - Admin - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Max 100 items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.get('/orders', async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      limit = 20,
      offset = 0,
    } = req.query;

    const pageLimit = Math.min(parseInt(limit), 100);
    const pageOffset = Math.max(0, parseInt(offset));

    let query = 'SELECT id, user_id, total_price, status, payment_method, created_at FROM orders WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      values.push(new Date(startDate));
      paramCount++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      values.push(new Date(endDate));
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE 1=1 ${
        status ? `AND status = $1` : ''
      } ${
        startDate ? `AND created_at >= $${status ? 2 : 1}` : ''
      } ${
        endDate ? `AND created_at <= $${startDate ? (status ? 3 : 2) : (status ? 2 : 1)}` : ''
      }`,
      values
    );

    const total = parseInt(countResult.rows[0].total, 10);

    // Get orders
    query += ' ORDER BY created_at DESC LIMIT $' + paramCount + ' OFFSET $' + (paramCount + 1);
    values.push(pageLimit, pageOffset);

    const ordersResult = await pool.query(query, values);
    const orders = ordersResult.rows;

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await pool.query(
          'SELECT id, product_id, quantity, price FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return {
          ...order,
          items: itemsResult.rows,
        };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (admin)
 *     description: Update order status (admin only)
 *     tags:
 *       - Admin - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Order not found
 */
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID',
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.updateStatus(id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // TODO: Send email notification to customer about status change
    // await sendOrderStatusEmail(order.user_id, order, status);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
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

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (admin)
 *     description: Get comprehensive dashboard statistics including revenue, orders, customers, and charts (admin only)
 *     tags:
 *       - Admin - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                     totalOrders:
 *                       type: integer
 *                     totalCustomers:
 *                       type: integer
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     chartData:
 *                       type: object
 *                       properties:
 *                         monthly_sales:
 *                           type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       500:
 *         description: Server error
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Total revenue
    const revenueResult = await pool.query(
      'SELECT SUM(total)::float as total_revenue FROM orders WHERE status != $1',
      ['cancelled']
    );
    const totalRevenue = revenueResult.rows[0].total_revenue || 0;

    // Total orders
    const ordersCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE status != $1',
      ['cancelled']
    );
    const totalOrders = parseInt(ordersCountResult.rows[0].count, 10);

    // Total customers
    const customersResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM orders'
    );
    const totalCustomers = parseInt(customersResult.rows[0].count, 10);

    // Recent orders (last 10)
    const recentOrdersResult = await pool.query(
      `SELECT id, user_id, total, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );
    const recentOrders = recentOrdersResult.rows;

    // Top products (most sold)
    const topProductsResult = await pool.query(
      `SELECT
        p.id, p.title, p.price, p.thumbnail,
        SUM(oi.quantity)::int as total_sold,
        SUM(oi.quantity * oi.price_at_purchase)::float as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.title, p.price, p.thumbnail
      ORDER BY total_sold DESC NULLS LAST
      LIMIT 5`
    );
    const topProducts = topProductsResult.rows.map(row => ({
      ...row,
      thumbnail: typeof row.thumbnail === 'string' ? JSON.parse(row.thumbnail) : row.thumbnail,
    }));

    // Monthly sales chart data (last 12 months)
    const chartDataResult = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*)::int as order_count,
        SUM(total)::float as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' AND status != $1
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC`,
      ['cancelled']
    );
    const chartData = {
      monthly_sales: chartDataResult.rows,
    };

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        recentOrders,
        topProducts,
        chartData,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message,
    });
  }
});

/**
 * Alias: GET /api/admin/metrics
 * Same as /dashboard — used by admin dashboard UI for fetching statistics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Total revenue
    const revenueResult = await pool.query(
      'SELECT SUM(total)::float as total_revenue FROM orders WHERE status != $1',
      ['cancelled']
    );
    const totalRevenue = revenueResult.rows[0].total_revenue || 0;

    // Total orders
    const ordersCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE status != $1',
      ['cancelled']
    );
    const totalOrders = parseInt(ordersCountResult.rows[0].count, 10);

    // Total customers
    const customersResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM orders'
    );
    const totalCustomers = parseInt(customersResult.rows[0].count, 10);

    // Recent orders (last 10)
    const recentOrdersResult = await pool.query(
      `SELECT id, user_id, total, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 10`
    );
    const recentOrders = recentOrdersResult.rows;

    // Top products (most sold)
    const topProductsResult = await pool.query(
      `SELECT
        p.id, p.title, p.price, p.thumbnail,
        SUM(oi.quantity)::int as total_sold,
        SUM(oi.quantity * oi.price_at_purchase)::float as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.title, p.price, p.thumbnail
      ORDER BY total_sold DESC NULLS LAST
      LIMIT 5`
    );
    const topProducts = topProductsResult.rows.map(row => ({
      ...row,
      thumbnail: typeof row.thumbnail === 'string' ? JSON.parse(row.thumbnail) : row.thumbnail,
    }));

    // Monthly sales chart data (last 12 months)
    const chartDataResult = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*)::int as order_count,
        SUM(total)::float as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' AND status != $1
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC`,
      ['cancelled']
    );
    const chartData = {
      monthly_sales: chartDataResult.rows,
    };

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        recentOrders,
        topProducts,
        chartData,
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message,
    });
  }
});

module.exports = router;
