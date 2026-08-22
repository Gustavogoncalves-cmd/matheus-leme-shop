const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Should be used after validation rules
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

// ===== Authentication Validation =====

const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  handleValidationErrors,
];

// ===== Product Validation =====

const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  handleValidationErrors,
];

const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  handleValidationErrors,
];

const validateProductId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  handleValidationErrors,
];

// ===== Cart Validation =====

const validateAddToCart = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  handleValidationErrors,
];

const validateUpdateCartItem = [
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  handleValidationErrors,
];

const validateRemoveCartItem = [
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  handleValidationErrors,
];

// ===== Order Validation =====

const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('phone')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number format is invalid'),
  handleValidationErrors,
];

const validateOrderId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  handleValidationErrors,
];

// ===== Payment Validation =====

const validatePayment = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'mercadopago', 'pix'])
    .withMessage('Invalid payment method'),
  handleValidationErrors,
];

// ===== Admin Validation =====

const validateAdminUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  handleValidationErrors,
];

// ===== Content (CMS) Validation =====

// Keys are used verbatim in SQL parameters and as object keys on the frontend,
// so restrict them to a safe slug shape rather than accepting arbitrary text.
const CONTENT_KEY_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const validateContentKey = [
  param('key')
    .trim()
    .matches(CONTENT_KEY_PATTERN)
    .withMessage('Key must be lowercase alphanumeric words separated by underscores'),
  handleValidationErrors,
];

const validateContentSection = [
  param('section')
    .trim()
    .matches(CONTENT_KEY_PATTERN)
    .withMessage('Section must be lowercase alphanumeric words separated by underscores'),
  handleValidationErrors,
];

const validateContentUpdate = [
  param('key')
    .trim()
    .matches(CONTENT_KEY_PATTERN)
    .withMessage('Key must be lowercase alphanumeric words separated by underscores'),
  body('value')
    .exists()
    .withMessage('Value is required')
    .isString()
    .withMessage('Value must be a string')
    .isLength({ max: 5000 })
    .withMessage('Value must be at most 5000 characters'),
  handleValidationErrors,
];

const validateContentCreate = [
  body('key')
    .trim()
    .matches(CONTENT_KEY_PATTERN)
    .withMessage('Key must be lowercase alphanumeric words separated by underscores'),
  body('value')
    .optional()
    .isString()
    .withMessage('Value must be a string')
    .isLength({ max: 5000 })
    .withMessage('Value must be at most 5000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'color', 'url'])
    .withMessage('Type must be one of: text, image, color, url'),
  body('section')
    .optional()
    .trim()
    .matches(CONTENT_KEY_PATTERN)
    .withMessage('Section must be lowercase alphanumeric words separated by underscores'),
  body('label')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Label must be at most 255 characters'),
  handleValidationErrors,
];

// ===== Pagination Validation =====

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
  validateCreateOrder,
  validateOrderId,
  validatePayment,
  validateAdminUserId,
  validatePagination,
  validateContentKey,
  validateContentSection,
  validateContentUpdate,
  validateContentCreate,
};
