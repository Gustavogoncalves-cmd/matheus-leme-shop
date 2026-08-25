#!/usr/bin/env node

/**
 * Migration runner
 * Run specific migration or all migrations
 * Usage:
 *   npm run migrate              - Run all migrations
 *   npm run migrate 1            - Run migration #1
 *   npm run migrate 001_create_users.sql  - Run specific migration by name
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const LOG_PREFIX = {
  INFO: '📋',
  SUCCESS: '✅',
  ERROR: '❌',
  WARN: '⚠️ ',
  PROGRESS: '🔄',
};

class MigrationRunner {
  constructor() {
    this.pool = null;
    this.migrationsDir = path.join(__dirname, '../migrations');
  }

  log(level, message) {
    const prefix = LOG_PREFIX[level] || '•';
    console.log(`${prefix} ${message}`);
  }

  /**
   * Connect to PostgreSQL database
   */
  async connect() {
    try {
      this.pool = new Pool(process.env.DATABASE_URL ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        statement_timeout: 30000,
      } : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        statement_timeout: 30000,
      });

      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();

      this.log('SUCCESS', `Connected to database: ${process.env.DB_NAME}`);
      return true;
    } catch (error) {
      this.log('ERROR', `Connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all migration files sorted by name
   */
  getMigrationFiles() {
    try {
      return fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      this.log('ERROR', `Failed to read migrations directory: ${error.message}`);
      return [];
    }
  }

  /**
   * Find migration file by number or name
   */
  findMigrationFile(arg) {
    const allFiles = this.getMigrationFiles();

    // If arg is a number, pad it and find matching file
    if (!isNaN(arg)) {
      const paddedNum = String(arg).padStart(3, '0');
      const found = allFiles.find(f => f.startsWith(paddedNum));
      if (found) return found;
    }

    // If arg contains underscore, treat as filename pattern
    if (arg.includes('_')) {
      const found = allFiles.find(f => f === arg || f.includes(arg));
      if (found) return found;
    }

    // Try exact match
    if (allFiles.includes(arg)) {
      return arg;
    }

    return null;
  }

  /**
   * Run a single migration file
   */
  async runMigration(filename) {
    const filepath = path.join(this.migrationsDir, filename);
    const client = await this.pool.connect();

    try {
      if (!fs.existsSync(filepath)) {
        this.log('ERROR', `File not found: ${filename}`);
        return false;
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      const applied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [filename]
      );
      if (applied.rows.length) {
        this.log('INFO', `Already applied: ${filename}`);
        return true;
      }

      this.log('PROGRESS', `Running migration: ${filename}`);
      const sql = fs.readFileSync(filepath, 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename]
      );
      await client.query('COMMIT');
      this.log('SUCCESS', `Completed: ${filename}`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      this.log('ERROR', `Failed (${filename}): ${error.message}`);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Run all migrations in order
   */
  async runAllMigrations() {
    const files = this.getMigrationFiles();

    if (files.length === 0) {
      this.log('WARN', 'No migration files found');
      return true;
    }

    this.log('INFO', `Running ${files.length} migration(s)...`);

    let count = 0;
    for (const file of files) {
      const success = await this.runMigration(file);
      if (!success) {
        this.log('ERROR', 'Migration sequence failed.');
        return false;
      }
      count++;
    }

    this.log('SUCCESS', `All ${count} migration(s) completed`);
    return true;
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (error) {
        this.log('WARN', `Error closing connection: ${error.message}`);
      }
    }
  }

  /**
   * Main execution
   */
  async execute(migrationArg = null) {
    try {
      const connected = await this.connect();
      if (!connected) {
        return 1;
      }

      let success;

      if (!migrationArg) {
        // Run all migrations
        success = await this.runAllMigrations();
      } else {
        // Run specific migration
        const filename = this.findMigrationFile(migrationArg);

        if (!filename) {
          this.log('ERROR', `Migration not found: ${migrationArg}`);
          this.log('INFO', 'Available migrations:');
          this.getMigrationFiles().forEach(f => console.log(`  • ${f}`));
          return 1;
        }

        success = await this.runMigration(filename);
      }

      await this.disconnect();
      return success ? 0 : 1;
    } catch (error) {
      this.log('ERROR', `Unexpected error: ${error.message}`);
      await this.disconnect();
      return 1;
    }
  }
}

/**
 * Run the migration runner
 */
if (require.main === module) {
  const migrationArg = process.argv[2] || null;
  const runner = new MigrationRunner();

  runner.execute(migrationArg)
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MigrationRunner;
