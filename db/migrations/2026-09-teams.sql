-- Phase 24: teams, and which team each member is on. The ALTER errors if run
-- twice, so run once per database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-teams.sql
--   npm run db:patch:remote -- db/migrations/2026-09-teams.sql
CREATE TABLE IF NOT EXISTS teams (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

ALTER TABLE members ADD COLUMN team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL;
