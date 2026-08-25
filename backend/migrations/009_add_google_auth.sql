-- Migration 009: Add Google OAuth support
-- Allows users to sign in with Google

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Users created via Google won't have a password_hash,
-- so the column needs to be nullable (already is by default)