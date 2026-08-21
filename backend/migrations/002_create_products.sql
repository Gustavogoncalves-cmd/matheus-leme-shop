-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  header_title VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- 'pacote' or 'avulso'
  type VARCHAR(50) NOT NULL, -- 'combo' or 'individual'
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  discount INTEGER DEFAULT 0, -- percentage
  price_original DECIMAL(10, 2),
  sold INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  theme_color VARCHAR(255),
  thumbnail VARCHAR(500),
  images TEXT, -- JSON array of image URLs
  features TEXT, -- JSON array of features
  previews TEXT, -- JSON array of preview objects
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_featured ON products(featured);
