-- Site content table for the admin panel CMS.
--
-- Every editable string on the public site lives here as a key/value pair so
-- the owner can change copy without a redeploy. Reads are public (the site
-- renders from this table); writes go through /api/content, which is gated by
-- authenticate + authorize('admin').
--
-- `key` is quoted throughout because it is a keyword in some SQL dialects.

CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  "key" VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'color' | 'url'
  section VARCHAR(100) NOT NULL DEFAULT 'general',
  label VARCHAR(255),                       -- human-facing field name in the admin UI
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Keep the row if the editing admin is ever deleted; provenance is a nice
  -- to have, not a reason to cascade away site copy.
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
