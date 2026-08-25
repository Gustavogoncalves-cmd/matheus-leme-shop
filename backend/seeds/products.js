/**
 * Seed initial products into the database
 * Run with: npm run seed
 */

const { Pool } = require('pg');
require('dotenv').config();

const productsData = require('../../shared/products-data.json');

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
        ON CONFLICT (title) DO UPDATE SET
          header_title = EXCLUDED.header_title,
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          description = EXCLUDED.description,
          short_description = EXCLUDED.short_description,
          price = EXCLUDED.price,
          discount = EXCLUDED.discount,
          price_original = EXCLUDED.price_original,
          featured = EXCLUDED.featured,
          available = EXCLUDED.available,
          theme_color = EXCLUDED.theme_color,
          thumbnail = EXCLUDED.thumbnail,
          images = EXCLUDED.images,
          features = EXCLUDED.features,
          previews = EXCLUDED.previews
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
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedProducts().catch(error => {
    console.error('❌ Error seeding products:', error);
    process.exitCode = 1;
  });
}

module.exports = seedProducts;
