const pool = require('../config/database');

class Product {
  /**
   * Get all products with optional filtering
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.available !== undefined) {
      query += ` AND available = $${paramCount}`;
      values.push(filters.available);
      paramCount++;
    }

    if (filters.featured !== undefined) {
      query += ` AND featured = $${paramCount}`;
      values.push(filters.featured);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Sorting
    query += ' ORDER BY featured DESC, created_at DESC';

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
      paramCount++;
    }

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => this._formatRow(row));
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return this._formatRow(result.rows[0]);
    } catch (error) {
      console.error('Error finding product:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async create(productData) {
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
    } = productData;

    const query = `
      INSERT INTO products (
        title, header_title, category, type, description,
        short_description, price, discount, price_original, featured,
        available, theme_color, thumbnail, images, features, previews
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      title,
      headerTitle,
      category,
      type,
      description,
      shortDescription,
      price,
      discount,
      priceOriginal || price,
      featured || false,
      available !== false,
      themeColor,
      thumbnail,
      JSON.stringify(images || []),
      JSON.stringify(features || []),
      JSON.stringify(previews || []),
    ];

    try {
      const result = await pool.query(query, values);
      return this._formatRow(result.rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  static async update(id, updates) {
    const allowed = [
      'title',
      'header_title',
      'category',
      'description',
      'short_description',
      'price',
      'discount',
      'featured',
      'available',
      'theme_color',
      'thumbnail',
      'images',
      'features',
      'previews',
    ];

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowed.includes(key)) {
        setClauses.push(`${key} = $${paramCount}`);
        let value = updates[key];
        if (Array.isArray(value)) value = JSON.stringify(value);
        values.push(value);
        paramCount++;
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE products SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return null;
      return this._formatRow(result.rows[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Helper to parse JSON fields from database
   */
  static _formatRow(row) {
    return {
      ...row,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
      previews: typeof row.previews === 'string' ? JSON.parse(row.previews) : row.previews,
    };
  }
}

module.exports = Product;
