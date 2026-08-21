const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT id, email, password, name, role, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new user with hashed password
   */
  static async create(userData) {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, created_at
    `;

    try {
      const result = await pool.query(query, [
        email.toLowerCase(),
        hashedPassword,
        name,
        'customer', // default role
      ]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Email already registered');
      }
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Verify password against hashed password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  /**
   * Get user profile with order count
   */
  static async getProfile(userId) {
    try {
      const result = await pool.query(
        `SELECT
          u.id, u.email, u.name, u.role, u.created_at,
          COUNT(o.id)::int as total_orders
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.id = $1
        GROUP BY u.id`,
        [userId]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

module.exports = User;
