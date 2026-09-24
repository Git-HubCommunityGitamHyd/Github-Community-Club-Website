import { getDb } from "./client"

export type AuthEventKind =
  | "login_ok"
  | "login_failed"
  | "login_locked"
  | "honeypot_visit"
  | "honeypot_login"

export type AuthEvent = {
  id: number
  kind: AuthEventKind
  ip: string
  user_agent: string
  detail: string
  created_at: string
}

/** Failed logins from one IP that lock it out, and the window they count in. */
export const LOGIN_MAX_FAILURES = 5
export const LOGIN_WINDOW_MS = 15 * 60 * 1000

// A scanner hammering /admin should not be able to fill the table: past this
// many honeypot rows per IP in the window, further hits are not written.
const HONEYPOT_MAX_PER_WINDOW = 40
const KEEP_DAYS = 90

function since(ms: number) {
  return new Date(Date.now() - ms).toISOString()
}

export async function logAuthEvent(event: {
  kind: AuthEventKind
  ip: string
  userAgent: string
  detail?: string
}) {
  const db = await getDb()
  if (event.kind.startsWith("honeypot_")) {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM auth_events
         WHERE ip = ? AND kind LIKE 'honeypot_%' AND created_at > ?`,
      )
      .bind(event.ip, since(LOGIN_WINDOW_MS))
      .first<{ n: number }>()
    if ((row?.n ?? 0) >= HONEYPOT_MAX_PER_WINDOW) return
  }
  await db
    .prepare(
      "INSERT INTO auth_events (kind, ip, user_agent, detail) VALUES (?, ?, ?, ?)",
    )
    .bind(
      event.kind,
      event.ip.slice(0, 64),
      event.userAgent.slice(0, 300),
      (event.detail ?? "").slice(0, 120),
    )
    .run()
  // Pruning on roughly one write in fifty keeps the table bounded without a
  // cron trigger.
  if (Math.random() < 0.02) {
    await db
      .prepare("DELETE FROM auth_events WHERE created_at < ?")
      .bind(since(KEEP_DAYS * 24 * 60 * 60 * 1000))
      .run()
  }
}

/**
 * Failed logins from `ip` inside the window and since its last successful
 * login, so signing in clears the count.
 */
export async function recentLoginFailures(ip: string): Promise<number> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM auth_events
       WHERE ip = ?1 AND kind = 'login_failed' AND created_at > ?2
         AND created_at > COALESCE(
           (SELECT MAX(created_at) FROM auth_events
            WHERE ip = ?1 AND kind = 'login_ok'), '')`,
    )
    .bind(ip, since(LOGIN_WINDOW_MS))
    .first<{ n: number }>()
  return row?.n ?? 0
}

export async function listAuthEvents(limit = 200): Promise<AuthEvent[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, kind, ip, user_agent, detail, created_at FROM auth_events
       ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<AuthEvent>()
  return results
}

/** Counts per kind over the last `days` days, for the security page. */
export async function countAuthEvents(
  days: number,
): Promise<Record<AuthEventKind, number>> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT kind, COUNT(*) AS n FROM auth_events
       WHERE created_at > ? GROUP BY kind`,
    )
    .bind(since(days * 24 * 60 * 60 * 1000))
    .all<{ kind: AuthEventKind; n: number }>()
  const counts: Record<AuthEventKind, number> = {
    login_ok: 0,
    login_failed: 0,
    login_locked: 0,
    honeypot_visit: 0,
    honeypot_login: 0,
  }
  for (const r of results as { kind: AuthEventKind; n: number }[]) {
    if (r.kind in counts) counts[r.kind] = r.n
  }
  return counts
}

/** IPs currently locked out of the real login. */
export async function lockedOutIps(): Promise<{ ip: string; n: number }[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT ip, COUNT(*) AS n FROM auth_events f
       WHERE kind = 'login_failed' AND created_at > ?1
         AND created_at > COALESCE(
           (SELECT MAX(created_at) FROM auth_events o
            WHERE o.ip = f.ip AND o.kind = 'login_ok'), '')
       GROUP BY ip HAVING n >= ?2`,
    )
    .bind(since(LOGIN_WINDOW_MS), LOGIN_MAX_FAILURES)
    .all<{ ip: string; n: number }>()
  return results
}
