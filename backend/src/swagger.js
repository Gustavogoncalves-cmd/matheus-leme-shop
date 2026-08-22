const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Matheus Leme Shop API',
      version: '1.0.0',
      description: 'API documentation for Matheus Leme Shop e-commerce platform with authentication, products, cart, orders, and payments',
      contact: {
        name: 'API Support',
        email: 'support@matheusleme.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: process.env.API_URL || 'https://api.matheusleme.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from login/register endpoint',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
          },
          required: ['id', 'email', 'name', 'role'],
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID',
            },
            title: {
              type: 'string',
              description: 'Product title',
            },
            headerTitle: {
              type: 'string',
              description: 'Product header title',
            },
            category: {
              type: 'string',
              description: 'Product category',
            },
            type: {
              type: 'string',
              description: 'Product type',
            },
            description: {
              type: 'string',
              description: 'Detailed product description',
            },
            shortDescription: {
              type: 'string',
              description: 'Short product description',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Current price',
            },
            discount: {
              type: 'number',
              format: 'float',
              description: 'Discount percentage',
            },
            priceOriginal: {
              type: 'number',
              format: 'float',
              description: 'Original price before discount',
            },
            featured: {
              type: 'boolean',
              description: 'Is product featured',
            },
            available: {
              type: 'boolean',
              description: 'Is product available',
            },
            themeColor: {
              type: 'string',
              description: 'Product theme color',
            },
            thumbnail: {
              type: 'string',
              description: 'Product thumbnail image URL',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of product image URLs',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              description: 'Product features',
            },
          },
          required: ['id', 'title', 'category', 'price', 'description'],
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Cart item ID',
            },
            product_id: {
              type: 'integer',
              description: 'Product ID',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of items',
            },
            product: {
              $ref: '#/components/schemas/Product',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID',
            },
            user_id: {
              type: 'integer',
              description: 'User ID',
            },
            total_price: {
              type: 'number',
              format: 'float',
              description: 'Total order price',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid', 'pending_payment', 'payment_failed'],
              description: 'Order status',
            },
            payment_method: {
              type: 'string',
              description: 'Payment method used',
            },
            shippingAddress: {
              type: 'object',
              description: 'Shipping address details',
            },
            items: {
              type: 'array',
              items: { type: 'object' },
              description: 'Order items',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [],
  },
  apis: [
    './src/routes/auth.js',
    './src/routes/products.js',
    './src/routes/cart.js',
    './src/routes/orders.js',
    './src/routes/payments.js',
    './src/routes/admin.js',
    './src/app.js',
  ],
};

const swaggerDocs = swaggerJsdoc(options);
module.exports = swaggerDocs;
