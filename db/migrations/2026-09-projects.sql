-- Adds the projects table to a database that already exists.
--
-- db/schema.sql is all CREATE TABLE IF NOT EXISTS, so rerunning it is safe and
-- would in fact create this table too. This file exists so the change can be
-- applied deliberately and recorded, the same way the board member accent
-- column was. Run once per database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-projects.sql
--   npm run db:patch:remote -- db/migrations/2026-09-projects.sql
CREATE TABLE IF NOT EXISTS projects (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  summary        TEXT NOT NULL,
  body           TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'in-progress',
  live_url       TEXT,
  repo_url       TEXT,
  preview_image  TEXT,
  cover_image    TEXT,
  tags           TEXT NOT NULL DEFAULT '[]',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
