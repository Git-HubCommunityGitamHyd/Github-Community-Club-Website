-- Private tracking links for proposals and builds. Submitters have no
-- account, so each submission gets a random token shown once on the
-- thank-you screen; only its SHA-256 is stored. Rows sent before this
-- migration have no link. Run once per database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-tracking-links.sql
--   npm run db:patch:remote -- db/migrations/2026-09-tracking-links.sql
ALTER TABLE proposals ADD COLUMN track_hash TEXT;
ALTER TABLE builds ADD COLUMN track_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS proposals_track_hash ON proposals(track_hash);
CREATE UNIQUE INDEX IF NOT EXISTS builds_track_hash ON builds(track_hash);
