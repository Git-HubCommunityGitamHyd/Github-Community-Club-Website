-- Builds get their own pages, like projects: a slug for the URL, dev notes,
-- credits (who did what) and a cached GitHub commit count. Run once per
-- database, after 2026-09-proposals-builds.sql:
--
--   npm run db:patch:local  -- db/migrations/2026-09-build-pages.sql
--   npm run db:patch:remote -- db/migrations/2026-09-build-pages.sql
ALTER TABLE builds ADD COLUMN slug TEXT;
ALTER TABLE builds ADD COLUMN dev_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE builds ADD COLUMN credits TEXT NOT NULL DEFAULT '[]';
ALTER TABLE builds ADD COLUMN commit_count INTEGER;
ALTER TABLE builds ADD COLUMN commits_synced_at TEXT;
-- Rows sent before this get "build-<id>"; rename them in /admin/builds.
UPDATE builds SET slug = 'build-' || id WHERE slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS builds_slug ON builds(slug);
