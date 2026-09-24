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

-- Club projects, shown as a short list on the homepage and in full at
-- /projects. `status` is a key into PROJECT_STATUSES
-- (features/v2/projects/statuses.ts) rather than a label or a colour, for the
-- same reason events.category and journey_entries.icon are: a free-text field
-- here means a typo renders the fallback badge forever, and a free colour
-- field means a hue that belongs to no palette ends up on the site.
--
-- tags is a JSON-encoded array, like events.images. SQLite has no array type;
-- the encode/decode is contained entirely in lib/db/projects.ts and every
-- caller sees a plain string[].
--
-- preview_image is what the homepage hover preview shows. It is a captured
-- image rather than an iframe of live_url on purpose: most sites refuse
-- framing outright, so an iframe preview is blank for a large share of real
-- links. A row with no live_url gets no hover preview at all.
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
  dev_notes      TEXT NOT NULL DEFAULT '',
  -- Commits on the repo's default branch, read from the GitHub API and cached
  -- here so a page view never waits on GitHub. NULL means never synced or no
  -- repo, and the page hides the counter rather than showing a zero.
  commit_count      INTEGER,
  commits_synced_at TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- The club's teams (for example web, design, events). A table rather than a
-- fixed key set because the club names and renames its own teams, and that is
-- content an admin changes, not a list the code should own.
CREATE TABLE IF NOT EXISTS teams (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- People who build club projects. The coming members page lists this table,
-- and its profile popup is the same one a project page opens. Columns mirror
-- board_members on purpose (role is a one-line headline, description the
-- longer bio, github a username, accent a key into BOARD_ACCENTS) so both
-- kinds of person render through one dialog. image_url is an avatar the member
-- generated (docs/member-avatar-prompt.md), not a photo: members asked not to
-- show their faces.
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
  -- A one-line tagline in their own words, and the handle shown under it.
  -- The handle is free-standing (not necessarily their GitHub username);
  -- blank falls back to github on the page.
  tagline      TEXT NOT NULL DEFAULT '',
  handle       TEXT,
  -- Deleting a team leaves its members in place, teamless.
  team_id      INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Who worked on which project. role is a key into PROJECT_ROLES
-- (features/v2/projects/roles.ts): maintainer, lead or member, which is also
-- the order a project page lists them in. contribution is free text, in the
-- CMS author's words. Deleting either side removes the tag.
CREATE TABLE IF NOT EXISTS project_members (
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id     INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member',
  contribution  TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, member_id)
);
CREATE INDEX IF NOT EXISTS project_members_member ON project_members(member_id);

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
  -- SHA-256 of the private tracking link's token (lib/tracking.ts).
  track_hash     TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at    TEXT
);
CREATE INDEX IF NOT EXISTS proposals_status ON proposals(status);
CREATE UNIQUE INDEX IF NOT EXISTS proposals_track_hash ON proposals(track_hash);

-- Projects students built and sent in, from /builds/submit. Pending until an
-- admin accepts one into a month (month = 'YYYY-MM') and optionally marks it
-- one of a week's builds (week_of = that week's Monday, 'YYYY-MM-DD').
-- images is a JSON array of Cloudinary URLs, like events.images.
CREATE TABLE IF NOT EXISTS builds (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  -- URL segment of /builds/<slug>. Set on submission, editable in the CMS.
  slug           TEXT,
  tagline        TEXT NOT NULL,
  description    TEXT NOT NULL,
  built_with     TEXT NOT NULL DEFAULT '',
  live_url       TEXT,
  repo_url       TEXT,
  images         TEXT NOT NULL DEFAULT '[]',
  dev_notes      TEXT NOT NULL DEFAULT '',
  -- JSON [{name, role, contribution}], role a key of BUILD_ROLES.
  credits        TEXT NOT NULL DEFAULT '[]',
  commit_count   INTEGER,
  commits_synced_at TEXT,
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
  track_hash     TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at    TEXT
);
CREATE INDEX IF NOT EXISTS builds_status ON builds(status);
CREATE UNIQUE INDEX IF NOT EXISTS builds_track_hash ON builds(track_hash);
CREATE UNIQUE INDEX IF NOT EXISTS builds_slug ON builds(slug);
