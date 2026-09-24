-- Login attempts on the real CMS and hits on the /admin honeypot. Drives the
-- 5-failures-per-IP lockout and the CMS security page. Never holds a password.
CREATE TABLE IF NOT EXISTS auth_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  -- login_ok | login_failed | login_locked | honeypot_visit | honeypot_login
  kind        TEXT NOT NULL,
  ip          TEXT NOT NULL,
  user_agent  TEXT NOT NULL DEFAULT '',
  -- honeypot_login: the username typed, truncated. Otherwise the path.
  detail      TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS auth_events_ip_kind ON auth_events(ip, kind, created_at);
CREATE INDEX IF NOT EXISTS auth_events_created ON auth_events(created_at);
