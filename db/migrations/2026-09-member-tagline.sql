-- Phase 25: the tagline and handle shown on each members page card. Errors if
-- run twice, so run once per database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-member-tagline.sql
--   npm run db:patch:remote -- db/migrations/2026-09-member-tagline.sql
ALTER TABLE members ADD COLUMN tagline TEXT NOT NULL DEFAULT '';
ALTER TABLE members ADD COLUMN handle TEXT;
