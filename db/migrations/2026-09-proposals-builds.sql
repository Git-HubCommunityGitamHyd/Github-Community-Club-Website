-- Phase 27: project proposals and the build showcase. CREATE ... IF NOT
-- EXISTS only, so this is safe to rerun. Run once per database:
--
--   npm run db:patch:local  -- db/migrations/2026-09-proposals-builds.sql
--   npm run db:patch:remote -- db/migrations/2026-09-proposals-builds.sql
-- Project ideas students send the club, from /proposals/new. Everything
-- arrives as status 'pending' and stays private until an admin moves it to a
-- public status (PROPOSAL_STATUSES in features/v2/proposals/keys.ts). reg_no
-- and phone are never shown publicly; public_name is what the public page
-- prints (their first name by default, editable in the CMS). audience, format,
-- help and year are keys, like every other fixed choice in this schema.
CREATE TABLE IF NOT EXISTS proposals (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  idea           TEXT NOT NULL,
  audience       TEXT NOT NULL,
  format         TEXT NOT NULL,
  help           TEXT NOT NULL,
  name           TEXT NOT NULL,
  public_name    TEXT NOT NULL,
  year           TEXT NOT NULL,
  branch         TEXT NOT NULL,
  reg_no         TEXT NOT NULL,
  phone          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  admin_note     TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at    TEXT
);
CREATE INDEX IF NOT EXISTS proposals_status ON proposals(status);

-- Projects students built and sent in, from /builds/submit. Pending until an
-- admin accepts one into a month (month = 'YYYY-MM') and optionally marks it
-- one of a week's builds (week_of = that week's Monday, 'YYYY-MM-DD').
-- images is a JSON array of Cloudinary URLs, like events.images.
CREATE TABLE IF NOT EXISTS builds (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  tagline        TEXT NOT NULL,
  description    TEXT NOT NULL,
  built_with     TEXT NOT NULL DEFAULT '',
  live_url       TEXT,
  repo_url       TEXT,
  images         TEXT NOT NULL DEFAULT '[]',
  name           TEXT NOT NULL,
  teammates      TEXT NOT NULL DEFAULT '',
  year           TEXT NOT NULL,
  branch         TEXT NOT NULL,
  reg_no         TEXT NOT NULL,
  phone          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  month          TEXT,
  week_of        TEXT,
  admin_note     TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at    TEXT
);
CREATE INDEX IF NOT EXISTS builds_status ON builds(status);
