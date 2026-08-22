-- Add stock tracking column and a uniqueness guard on title.
-- The previous seed script relied on `ON CONFLICT DO NOTHING` with no
-- conflict target, which is a no-op without a unique constraint -- every
-- seed run silently duplicated rows. This migration fixes both.

ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

ALTER TABLE products ADD CONSTRAINT products_title_unique UNIQUE (title);
