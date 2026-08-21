const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const Product = require('../models/Product');

/**
 * GET /api/cart
 * Get user's cart items
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ci.id, ci.product_id, ci.quantity,
        p.id as product_id, p.title, p.price, p.thumbnail
      FROM cart_items ci
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
 * POST /api/cart/add
 * Add product to cart (authenticated)
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
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    let cartItem;
    if (existingResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingResult.rows[0].quantity + quantity;
      const updateResult = await client.query(
        `UPDATE cart_items
        SET quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, product_id, quantity`,
        [newQuantity, existingResult.rows[0].id]
      );
      cartItem = updateResult.rows[0];
    } else {
      // Insert new item
      const insertResult = await client.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
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
 * PATCH /api/cart/:itemId
 * Update cart item quantity
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
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
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
      `UPDATE cart_items
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
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
router.delete('/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify ownership and delete
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
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
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

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
