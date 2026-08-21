/**
 * Seed initial products into the database
 * Run with: npm run seed
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const productsData = require('../../shared/products-data.json');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    for (const product of productsData) {
      const query = `
        INSERT INTO products (
          title, header_title, category, type, description,
          short_description, price, discount, price_original, sold,
          featured, available, theme_color, thumbnail, images,
          features, previews
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT DO NOTHING
      `;

      const values = [
        product.title,
        product.headerTitle,
        product.category,
        product.type,
        product.description,
        product.shortDescription,
        product.price,
        product.discount,
        product.priceOriginal || product.price,
        product.sold,
        product.featured,
        product.available,
        product.themeColor,
        product.thumbnail,
        JSON.stringify(product.images),
        JSON.stringify(product.features),
        JSON.stringify(product.previews),
      ];

      await pool.query(query, values);
      console.log(`✅ ${product.title}`);
    }

    console.log(`\n✨ Seeded ${productsData.length} products successfully!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await pool.end();
  }
}

seedProducts();
