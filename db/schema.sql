CREATE TABLE IF NOT EXISTS applications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  branch           TEXT NOT NULL,
  year             TEXT NOT NULL,
  github_username  TEXT,
  why_join         TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS board_members (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  image_url    TEXT,
  description  TEXT NOT NULL,
  github       TEXT,
  linkedin     TEXT,
  email        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- images: JSON-encoded array (SQLite has no native array type — Postgres
-- had TEXT[]). Encode/decode lives in lib/db.ts only, callers still see a
-- plain string[].
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  event_date   TEXT NOT NULL,
  location     TEXT,
  attendees    INTEGER,
  category     TEXT NOT NULL,
  duration     TEXT,
  description  TEXT NOT NULL,
  images       TEXT NOT NULL DEFAULT '[]',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
