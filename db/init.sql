CREATE TABLE IF NOT EXISTS applications (
  id               SERIAL PRIMARY KEY,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  branch           TEXT NOT NULL,
  year             TEXT NOT NULL,
  github_username  TEXT,
  why_join         TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_members (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  image_url    TEXT,
  description  TEXT NOT NULL,
  github       TEXT,
  linkedin     TEXT,
  email        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  event_date   TEXT NOT NULL,
  location     TEXT,
  attendees    INTEGER,
  category     TEXT NOT NULL,
  duration     TEXT,
  description  TEXT NOT NULL,
  images       TEXT[] NOT NULL DEFAULT '{}',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
