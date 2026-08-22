const pool = require('../config/database');

/**
 * Site content (CMS) model.
 *
 * Rows are key/value pairs backing every editable string on the public site.
 * Reads are public; writes are restricted to admins at the route layer.
 */
class Content {
  /**
   * Get every content row, ordered for stable rendering in the admin UI.
   */
  static async getAll() {
    try {
      const result = await pool.query(
        `SELECT id, "key", value, type, section, label, updated_at
         FROM content
         ORDER BY section, "key"`
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  /**
   * Get all rows flattened into a { key: value } map for the public site.
   */
  static async getMap() {
    const rows = await Content.getAll();
    return rows.reduce((map, row) => {
      map[row.key] = row.value;
      return map;
    }, {});
  }

  static async getByKey(key) {
    try {
      const result = await pool.query(
        `SELECT id, "key", value, type, section, label, updated_at
         FROM content WHERE "key" = $1`,
        [key]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching content by key:', error);
      throw error;
    }
  }

  static async getBySection(section) {
    try {
      const result = await pool.query(
        `SELECT id, "key", value, type, section, label, updated_at
         FROM content WHERE section = $1 ORDER BY "key"`,
        [section]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching content by section:', error);
      throw error;
    }
  }

  /**
   * Update an existing key. Returns null when the key does not exist so the
   * route can answer 404 rather than silently creating an orphan field - the
   * set of keys is defined by the seed, not by whatever the client posts.
   */
  static async update(key, value, userId) {
    try {
      const result = await pool.query(
        `UPDATE content
         SET value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
         WHERE "key" = $1
         RETURNING id, "key", value, type, section, label, updated_at`,
        [key, value, userId ?? null]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  /**
   * Upsert a key. Used by the seed and by the admin "add field" flow.
   */
  static async upsert({ key, value, type = 'text', section = 'general', label = null }, userId) {
    try {
      const result = await pool.query(
        `INSERT INTO content ("key", value, type, section, label, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("key") DO UPDATE
           SET value = EXCLUDED.value,
               type = EXCLUDED.type,
               section = EXCLUDED.section,
               label = EXCLUDED.label,
               updated_by = EXCLUDED.updated_by,
               updated_at = CURRENT_TIMESTAMP
         RETURNING id, "key", value, type, section, label, updated_at`,
        [key, value, type, section, label, userId ?? null]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error upserting content:', error);
      throw error;
    }
  }

  /**
   * Insert a key only if it is absent, leaving existing edits untouched.
   * This is what makes the seed safe to re-run: it never overwrites copy the
   * owner has already customized in the admin panel.
   */
  static async insertIfMissing({ key, value, type = 'text', section = 'general', label = null }) {
    try {
      const result = await pool.query(
        `INSERT INTO content ("key", value, type, section, label)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT ("key") DO NOTHING
         RETURNING id`,
        [key, value, type, section, label]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error seeding content key:', error);
      throw error;
    }
  }

  static async remove(key) {
    try {
      const result = await pool.query(
        'DELETE FROM content WHERE "key" = $1 RETURNING id',
        [key]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }
}

module.exports = Content;
