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
  -- Key into BOARD_ACCENTS (features/v2/board/accents.ts) — the ring around
  -- the photo in their dialog. A key, not a hex value, so the CMS cannot put
  -- an off-palette colour on the page. Existing databases get this through
  -- db/migrations/2026-09-board-member-accent.sql.
  accent       TEXT NOT NULL DEFAULT 'green',
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

-- The homepage timeline. It used to be a hardcoded JOURNEY_ITEMS array in
-- features/home/content.ts, which meant a club milestone needed a developer,
-- a commit and a deploy. `icon` is a key into JOURNEY_ICONS
-- (features/v2/journey/icons.ts) rather than a class name or an SVG, so the
-- CMS never stores markup and an unknown key falls back instead of breaking
-- the page.
CREATE TABLE IF NOT EXISTS journey_entries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_date   TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT 'commit',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
