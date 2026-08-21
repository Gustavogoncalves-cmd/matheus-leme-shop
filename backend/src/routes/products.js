const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/products
 * List all products with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      available,
      featured,
      search,
      limit = 12,
      offset = 0,
    } = req.query;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (category) filters.category = category;
    if (available !== undefined) filters.available = available === 'true';
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search;

    const products = await Product.findAll(filters);
    res.json({
      success: true,
      data: products,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message,
    });
  }
});

/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
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
    if (!title || !category || !type || !description || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const product = await Product.create({
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
 * PATCH /api/products/:id
 * Update a product (admin only)
 */
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);

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
 * DELETE /api/products/:id
 * Delete a product (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
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

module.exports = router;
