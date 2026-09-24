-- Phase 23: project dev notes and commit count, plus the members and
-- project_members tables. The ALTERs error if run twice, so run once per
-- database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-project-team.sql
--   npm run db:patch:remote -- db/migrations/2026-09-project-team.sql
ALTER TABLE projects ADD COLUMN dev_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN commit_count INTEGER;
ALTER TABLE projects ADD COLUMN commits_synced_at TEXT;

CREATE TABLE IF NOT EXISTS members (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  image_url    TEXT,
  github       TEXT,
  linkedin     TEXT,
  email        TEXT,
  accent       TEXT NOT NULL DEFAULT 'green',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id     INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',
  contribution  TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, member_id)
);
CREATE INDEX IF NOT EXISTS project_members_member ON project_members(member_id);
