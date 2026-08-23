const request = require('supertest');

// Mock payment config before requiring app
jest.mock('../../src/config/payment', () => ({
  MercadoPago: {
    MercadoPagoClient: jest.fn(),
  },
  validateWebhookSignature: jest.fn(),
  getPaymentStatus: jest.fn(),
}));

const app = require('../../src/app');
const { generateToken } = require('../../src/middleware/auth');

// Mock modules
jest.mock('../../src/config/database');
jest.mock('../../src/models/User');

const User = require('../../src/models/User');

// Registration enforces a complexity rule (8+ chars, upper, lower, digit) in
// src/middleware/validation.js. These fixtures used to send 'password123',
// which has no uppercase, so every "valid data" case was rejected at the
// validator and never reached the route under test.
const VALID_PASSWORD = 'Password123';

// Validation failures answer with { error: 'Validation Error', details: [...] };
// the actionable text lives in details[].message, not in the top-level error.
const validationMessages = (res) =>
  (res.body.details || []).map((detail) => detail.message).join(' | ');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // REGISTRATION TESTS (5 tests)
  // ========================================================================

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: VALID_PASSWORD,
        name: 'New User',
      };

      const mockCreatedUser = {
        id: 1,
        email: 'newuser@test.com',
        name: 'New User',
        role: 'customer',
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue(mockCreatedUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@test.com');
      expect(res.body.data.token).toBeDefined();
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      }));
    });

    it('should reject registration with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: VALID_PASSWORD,
          name: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(validationMessages(res)).toContain('valid email address');
    });

    it('should reject registration with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          name: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: '123',
          name: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(validationMessages(res)).toContain('at least 8 characters');
    });

    it('should reject registration with existing email', async () => {
      User.findByEmail.mockResolvedValue({ id: 1, email: 'existing@test.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: VALID_PASSWORD,
          name: 'User',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already registered');
    });

    it('should include JWT token in registration response', async () => {
      const userData = {
        email: 'test@test.com',
        password: VALID_PASSWORD,
        name: 'Test User',
      };

      const mockUser = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        role: 'customer',
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeTruthy();
      expect(typeof res.body.data.token).toBe('string');
    });

    it('should handle database errors during registration', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: VALID_PASSWORD,
          name: 'User',
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Registration failed');
    });
  });

  // ========================================================================
  // LOGIN TESTS (5 tests)
  // ========================================================================

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'user@test.com',
        password: VALID_PASSWORD,
      };

      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        password: '$2a$10$hashedpassword',
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('user@test.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(validationMessages(res)).toContain('valid email address');
    });

    it('should reject login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent user', async () => {
      User.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid email or password');
    });

    it('should reject login with wrong password', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        password: '$2a$10$hashedpassword',
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid email or password');
    });

    it('should return JWT token on successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        password: '$2a$10$hashedpassword',
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeTruthy();
      expect(typeof res.body.data.token).toBe('string');
    });

    it('should handle database errors during login', async () => {
      User.findByEmail.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: VALID_PASSWORD,
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Login failed');
    });
  });

  // ========================================================================
  // LOGOUT TESTS (2 tests)
  // ========================================================================

  describe('POST /api/auth/logout', () => {
    it('should logout authenticated user', async () => {
      const token = generateToken({
        id: 1,
        email: 'user@test.com',
        role: 'customer',
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('Logged out');
    });

    it('should reject logout without authentication token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ========================================================================
  // PROFILE TESTS (3 tests)
  // ========================================================================

  describe('GET /api/auth/profile', () => {
    it('should return user profile with authentication', async () => {
      const token = generateToken({
        id: 1,
        email: 'user@test.com',
        role: 'customer',
      });

      const mockProfile = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
        total_orders: 5,
      };

      User.getProfile.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('user@test.com');
      expect(res.body.data.total_orders).toBe(5);
    });

    it('should reject profile request without authentication', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when user profile not found', async () => {
      const token = generateToken({
        id: 999,
        email: 'nonexistent@test.com',
        role: 'customer',
      });

      User.getProfile.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('User not found');
    });

    it('should handle database errors in profile fetch', async () => {
      const token = generateToken({
        id: 1,
        email: 'user@test.com',
        role: 'customer',
      });

      User.getProfile.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Failed to fetch profile');
    });
  });
});
