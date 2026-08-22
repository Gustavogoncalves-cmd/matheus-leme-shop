const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Helmet security headers middleware
 * Protects against common vulnerabilities:
 * - XSS attacks
 * - Clickjacking
 * - Content sniffing
 * - MIME type sniffing
 * - etc.
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});

/**
 * General API rate limiting
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Use ipKeyGenerator helper for proper IPv6 support
    return ipKeyGenerator(req);
  },
});

/**
 * Strict rate limiting for auth endpoints (login, register)
 * 5 requests per 15 minutes per IP
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use ipKeyGenerator helper for proper IPv6 support
    return ipKeyGenerator(req);
  },
  skip: (req) => {
    // Don't rate limit GET requests
    return req.method === 'GET';
  },
});

/**
 * CORS configuration
 * Restricts access to specified frontend domain(s)
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allowed origins from environment variables
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());

    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log but allow in development for debugging
      console.warn(`CORS request from unauthorized origin: ${origin}`);
      if (process.env.NODE_ENV === 'development') {
        callback(null, true); // Allow in development
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  optionsSuccessStatus: 200,
  maxAge: 3600,
};

/**
 * Request sanitization middleware
 * Prevents NoSQL injection and other injection attacks
 */
function sanitizeInput(req, res, next) {
  // Remove $ and . from object keys (NoSQL injection prevention)
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = key.replace(/[\$.]/g, '');
        sanitized[newKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Request timeout middleware
 * Prevents slow client attacks
 */
function requestTimeout(req, res, next) {
  // Set a 30 second timeout for all requests
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
}

/**
 * Security headers middleware
 * Additional security headers beyond Helmet
 */
function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self)'
  );

  next();
}

module.exports = {
  helmetMiddleware,
  apiLimiter,
  authLimiter,
  corsOptions,
  sanitizeInput,
  requestTimeout,
  securityHeaders,
};
