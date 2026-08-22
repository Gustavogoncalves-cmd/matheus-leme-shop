const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const {
  helmetMiddleware,
  apiLimiter,
  corsOptions,
  sanitizeInput,
  requestTimeout,
  securityHeaders,
} = require('./middleware/security');
require('dotenv').config();

const app = express();

// Trust proxy - important when behind a reverse proxy (nginx, load balancer)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmetMiddleware); // Set security HTTP headers
app.use(securityHeaders); // Additional security headers
app.use(requestTimeout); // Request timeout protection
app.use(cors(corsOptions)); // CORS with restricted origins
app.use(sanitizeInput); // Input sanitization (NoSQL injection prevention)
app.use(apiLimiter); // Rate limiting for general API

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit JSON payload
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded payload

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Verify backend is running
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Backend is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Backend is running
 */

// Import auth limiter here to apply to auth routes
const { authLimiter } = require('./middleware/security');

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const message = isDevelopment ? err.message : 'Internal Server Error';

  // Rate limiter errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later.',
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Policy Violation',
      message: isDevelopment ? err.message : 'Request not allowed',
    });
  }

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: isDevelopment ? err.message : 'Invalid request format',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isDevelopment ? message : 'An error occurred. Please try again later.',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource does not exist.',
  });
});

module.exports = app;
