#!/usr/bin/env node
/**
 * Create or promote an admin user.
 *
 * Usage:
 *   node scripts/create-admin.js <email> <password> [name]
 *
 * If the email already exists, its password and role are updated instead of
 * inserting a duplicate. User.create() hardcodes role='customer', so admin
 * accounts have to be provisioned here rather than through /api/auth/register.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function main() {
  const [email, password, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(' ') || 'Admin';

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = 'admin',
           updated_at = CURRENT_TIMESTAMP
     RETURNING id, email, name, role`,
    [email.toLowerCase(), hash, name]
  );

  console.log('Admin ready:', result.rows[0]);
}

main()
  .catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
