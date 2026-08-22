const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const Product = require('../models/Product');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user cart
 *     description: Get all items in the user's shopping cart with product details
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items retrieved
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     total:
 *                       type: number
 *                       format: float
 *                       description: Total cart value
 *                     count:
 *                       type: integer
 *                       description: Number of items
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ci.id, ci.product_id, ci.quantity,
        p.id as product_id, p.title, p.price, p.thumbnail
      FROM cart ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: {
        id: row.product_id,
        title: row.title,
        price: parseFloat(row.price),
        thumbnail: row.thumbnail,
      },
    }));

    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        items,
        total: parseFloat(total.toFixed(2)),
        count: items.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add product to cart
 *     description: Add or update product quantity in user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Product added to cart
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
 *                     id:
 *                       type: integer
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product not available
 *       500:
 *         description: Server error
 */
router.post('/add', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    const { product_id, quantity = 1 } = req.body;

    // Validation
    if (!product_id || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid product_id and quantity are required',
      });
    }

    // Verify product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (!product.available) {
      return res.status(409).json({
        success: false,
        error: 'Product is not available',
      });
    }

    await client.query('BEGIN');

    // Check if item already in cart
    const existingResult = await client.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    let cartItem;
    if (existingResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingResult.rows[0].quantity + quantity;
      const updateResult = await client.query(
        `UPDATE cart
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, product_id, quantity`,
        [newQuantity, existingResult.rows[0].id]
      );
      cartItem = updateResult.rows[0];
    } else {
      // Insert new item
      const insertResult = await client.query(
        `INSERT INTO cart (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING id, product_id, quantity`,
        [req.user.id, product_id, quantity]
      );
      cartItem = insertResult.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: cartItem.id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to cart',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   patch:
 *     summary: Update cart item quantity
 *     description: Update the quantity of an item in user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.patch('/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validation
    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    // Verify ownership
    const cartItemResult = await pool.query(
      'SELECT id FROM cart WHERE id = $1 AND user_id = $2',
      [itemId, req.user.id]
    );

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    // Update quantity
    const result = await pool.query(
      `UPDATE cart
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, product_id, quantity`,
      [quantity, itemId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Delete a specific item from user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
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
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete('/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify ownership and delete
    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [itemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    res.json({
      success: true,
      data: { message: 'Item removed from cart' },
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from cart',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     description: Remove all items from user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
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
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    res.json({
      success: true,
      data: { message: 'Cart cleared' },
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      message: error.message,
    });
  }
});

module.exports = router;
