/**
 * Seed the real StreamPack catalog (6 combos + 18 avulso pieces) into the database.
 * Replaces the generic placeholder catalog from seeds/products.js.
 *
 * TRUNCATEs the products table first (idempotent, safe to re-run) -- order_items
 * and cart both had zero rows referencing products at the time this was written,
 * so this does not orphan any data. If that stops being true, switch to an
 * upsert-by-title strategy instead of truncating.
 *
 * Run with: node seeds/streampacks.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const productsData = require('../../shared/streampacks-data.json');

const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
} : {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'matheus_leme_shop',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seedStreamPacks() {
  const client = await pool.connect();
  try {
    console.log('Truncating products table (resets id sequence)...');
    await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

    console.log(`Seeding ${productsData.length} StreamPack products...`);

    for (const product of productsData) {
      const query = `
        INSERT INTO products (
          title, header_title, category, type, description,
          short_description, price, discount, price_original, stock, sold,
          featured, available, theme_color, thumbnail, images,
          features, previews
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (title) DO NOTHING
      `;

      const values = [
        product.title,
        product.headerTitle,
        product.category,
        product.type,
        product.longDescription,
        product.shortDescription,
        product.priceCurrent,
        product.discount,
        product.priceOriginal,
        product.stock,
        product.sold,
        product.featured,
        product.available,
        product.themeColor,
        product.thumbnail || null,
        JSON.stringify(product.images || []),
        JSON.stringify(product.features || []),
        JSON.stringify(product.previews || []),
      ];

      await client.query(query, values);
      console.log(`  + ${product.title}`);
    }

    console.log(`\nSeeded ${productsData.length} StreamPack products successfully.`);
  } catch (error) {
    console.error('Error seeding StreamPacks:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedStreamPacks();
