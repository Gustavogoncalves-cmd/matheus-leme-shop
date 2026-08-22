const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validatePagination,
} = require('../middleware/validation');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products
 *     description: Get all products with optional filtering, search, and pagination
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured products only
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product title and description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of products per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', validatePagination, async (req, res) => {
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
      limit: Math.min(parseInt(limit) || 12, 100), // Cap at 100
      offset: Math.max(parseInt(offset) || 0, 0), // Don't allow negative
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
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product with full details by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateProductId, async (req, res) => {
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
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product (admin only)
 *     tags:
 *       - Products
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
 *               - type
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               headerTitle:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               discount:
 *                 type: number
 *                 format: float
 *               priceOriginal:
 *                 type: number
 *                 format: float
 *               featured:
 *                 type: boolean
 *               available:
 *                 type: boolean
 *               themeColor:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               previews:
 *                 type: array
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - admin role required
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, authorize('admin'), validateCreateProduct, async (req, res) => {
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
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update product
 *     description: Update product fields (admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
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
 *                 format: float
 *               discount:
 *                 type: number
 *                 format: float
 *               featured:
 *                 type: boolean
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', authenticate, authorize('admin'), validateProductId, validateUpdateProduct, async (req, res) => {
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
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Delete a product (admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorize('admin'), validateProductId, async (req, res) => {
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
    });
  }
});

module.exports = router;
