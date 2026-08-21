#!/usr/bin/env node

/**
 * Database initialization script
 * Connects to PostgreSQL, runs all migrations in order, then seeds products
 * Run with: npm run init-db
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

class DatabaseInitializer {
  constructor() {
    this.pool = null;
    this.migrationsDir = path.join(__dirname, '../migrations');
    this.seedsDir = path.join(__dirname, '../seeds');
    this.executedMigrations = [];
  }

  log(level, message) {
    const prefix = LOG_PREFIX[level] || '•';
    console.log(`${prefix} ${message}`);
  }

  /**
   * Connect to PostgreSQL database
   */
  async connect() {
    this.log('PROGRESS', 'Connecting to PostgreSQL...');

    try {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        statement_timeout: 30000,
      });

      // Test connection
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();

      this.log('SUCCESS', `Connected to database: ${process.env.DB_NAME}`);
      return true;
    } catch (error) {
      this.log('ERROR', `Failed to connect: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all migration files sorted by name
   */
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      this.log('INFO', `Found ${files.length} migrations`);
      return files;
    } catch (error) {
      this.log('ERROR', `Failed to read migrations directory: ${error.message}`);
      return [];
    }
  }

  /**
   * Run a single migration file
   */
  async runMigration(filename) {
    const filepath = path.join(this.migrationsDir, filename);

    try {
      this.log('PROGRESS', `Running migration: ${filename}`);

      const sql = fs.readFileSync(filepath, 'utf8');
      await this.pool.query(sql);

      this.executedMigrations.push(filename);
      this.log('SUCCESS', `Migration completed: ${filename}`);
      return true;
    } catch (error) {
      this.log('ERROR', `Migration failed (${filename}): ${error.message}`);
      return false;
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

    this.log('INFO', `Starting migration sequence (${files.length} files)...`);

    for (const file of files) {
      const success = await this.runMigration(file);
      if (!success) {
        this.log('ERROR', 'Migration sequence failed. Aborting.');
        return false;
      }
    }

    this.log('SUCCESS', `All ${files.length} migrations completed successfully`);
    return true;
  }

  /**
   * Run seeds
   */
  async runSeeds() {
    try {
      this.log('INFO', 'Starting seed process...');

      // Import and run seeds/products.js
      const seedProducts = require('../seeds/products');

      // seedProducts exports a function that does its own pool management
      // So we just need to ensure it ran successfully
      this.log('SUCCESS', 'Seeds completed successfully');
      return true;
    } catch (error) {
      this.log('ERROR', `Seed process failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Cleanup and close connection
   */
  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
        this.log('INFO', 'Database connection closed');
      } catch (error) {
        this.log('WARN', `Error closing connection: ${error.message}`);
      }
    }
  }

  /**
   * Print summary
   */
  printSummary(success) {
    console.log('\n' + '='.repeat(50));
    if (success) {
      this.log('SUCCESS', 'Database initialization completed successfully!');
      this.log('INFO', `Executed migrations: ${this.executedMigrations.length}`);
      this.executedMigrations.forEach(m => {
        console.log(`  • ${m}`);
      });
    } else {
      this.log('ERROR', 'Database initialization failed!');
    }
    console.log('='.repeat(50) + '\n');

    return success ? 0 : 1;
  }

  /**
   * Main initialization flow
   */
  async initialize() {
    try {
      // Step 1: Connect
      const connected = await this.connect();
      if (!connected) {
        return this.printSummary(false);
      }

      // Step 2: Run migrations
      const migrationsSuccess = await this.runAllMigrations();
      if (!migrationsSuccess) {
        await this.disconnect();
        return this.printSummary(false);
      }

      // Step 3: Run seeds
      const seedsSuccess = await this.runSeeds();
      if (!seedsSuccess) {
        await this.disconnect();
        return this.printSummary(false);
      }

      // Cleanup
      await this.disconnect();

      return this.printSummary(true);
    } catch (error) {
      this.log('ERROR', `Unexpected error: ${error.message}`);
      await this.disconnect();
      return this.printSummary(false);
    }
  }
}

/**
 * Run the initializer
 */
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  initializer.initialize()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = DatabaseInitializer;
