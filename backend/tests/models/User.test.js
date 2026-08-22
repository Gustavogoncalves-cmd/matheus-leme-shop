const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs');

const pool = require('../../src/config/database');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // CREATE TESTS (3 tests)
  // ========================================================================

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New User',
      };

      const hashedPassword = '$2a$10$hashedpassword';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const mockCreatedUser = {
        id: 1,
        email: 'newuser@test.com',
        name: 'New User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedUser] });

      const result = await User.create(userData);

      expect(result.id).toBe(1);
      expect(result.email).toBe('newuser@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['newuser@test.com', hashedPassword, 'New User', 'customer'])
      );
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        email: 'NewUser@TEST.com',
        password: 'password123',
        name: 'New User',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hash');
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          email: 'newuser@test.com',
          name: 'New User',
          role: 'customer',
        }],
      });

      await User.create(userData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['newuser@test.com'])
      );
    });

    it('should set default role to customer', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'password123',
        name: 'User',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hash');
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          email: 'user@test.com',
          name: 'User',
          role: 'customer',
        }],
      });

      const result = await User.create(userData);

      expect(result.role).toBe('customer');
      expect(pool.query.mock.calls[0][1][3]).toBe('customer');
    });

    it('should throw error on duplicate email (constraint violation)', async () => {
      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        name: 'User',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hash');

      const error = new Error('Unique constraint violation');
      error.code = '23505';
      pool.query.mockRejectedValue(error);

      await expect(User.create(userData)).rejects.toThrow('Email already registered');
    });

    it('should handle database errors on create', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'password123',
        name: 'User',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hash');
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(User.create(userData)).rejects.toThrow('Database error');
    });

    it('should not return password in created user', async () => {
      const userData = {
        email: 'user@test.com',
        password: 'password123',
        name: 'User',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hash');
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          email: 'user@test.com',
          name: 'User',
          role: 'customer',
          created_at: '2024-08-21T00:00:00Z',
        }],
      });

      const result = await User.create(userData);

      expect(result.password).toBeUndefined();
    });
  });

  // ========================================================================
  // FIND BY EMAIL TESTS (2 tests)
  // ========================================================================

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        password: '$2a$10$hash',
        name: 'Test User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('user@test.com');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        expect.arrayContaining(['user@test.com'])
      );
    });

    it('should convert email to lowercase in query', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        password: '$2a$10$hash',
        name: 'User',
        role: 'customer',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      await User.findByEmail('USER@TEST.COM');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['user@test.com'])
      );
    });

    it('should return null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(User.findByEmail('user@test.com')).rejects.toThrow('Database error');
    });
  });

  // ========================================================================
  // VERIFY PASSWORD TESTS (2 tests)
  // ========================================================================

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = '$2a$10$hashedpassword';

      bcrypt.compare.mockResolvedValue(true);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'wrongpassword';
      const hashedPassword = '$2a$10$hashedpassword';

      bcrypt.compare.mockResolvedValue(false);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('should handle bcrypt errors', async () => {
      bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

      await expect(
        User.verifyPassword('password', '$2a$10$hash')
      ).rejects.toThrow('Bcrypt error');
    });
  });

  // ========================================================================
  // FIND BY ID TESTS (1 test)
  // ========================================================================

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [1]
      );
    });

    it('should not return password when finding by id', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(result.password).toBeUndefined();
    });

    it('should return null when user not found by id', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeNull();
    });
  });

  // ========================================================================
  // GET PROFILE TESTS (1 test)
  // ========================================================================

  describe('getProfile', () => {
    it('should return user profile with order count', async () => {
      const mockProfile = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'customer',
        created_at: '2024-08-21T00:00:00Z',
        total_orders: 5,
      };

      pool.query.mockResolvedValue({ rows: [mockProfile] });

      const result = await User.getProfile(1);

      expect(result).toEqual(mockProfile);
      expect(result.total_orders).toBe(5);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(o.id)'),
        [1]
      );
    });

    it('should return null when profile not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.getProfile(999);

      expect(result).toBeNull();
    });

    it('should handle database errors in profile', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(User.getProfile(1)).rejects.toThrow('Database error');
    });
  });
});
