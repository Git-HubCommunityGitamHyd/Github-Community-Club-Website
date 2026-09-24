import { AdminNav } from "@/features/admin/admin-nav"
import { requireAdminPage } from "@/lib/auth/require-admin"
import {
  countAuthEvents,
  listAuthEvents,
  lockedOutIps,
  type AuthEventKind,
} from "@/lib/db/auth-events"

export const dynamic = "force-dynamic"

const KIND_LABELS: Record<AuthEventKind, string> = {
  login_ok: "Logged in",
  login_failed: "Wrong password",
  login_locked: "Blocked (locked out)",
  honeypot_visit: "Honeypot visit",
  honeypot_login: "Honeypot login try",
}

const KIND_TONE: Record<AuthEventKind, string> = {
  login_ok: "text-gh-accent",
  login_failed: "text-amber-400",
  login_locked: "text-red-400",
  honeypot_visit: "text-gh-muted",
  honeypot_login: "text-violet-300",
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function AdminSecurityPage() {
  await requireAdminPage()

  const [counts, events, locked] = await Promise.all([
    countAuthEvents(7),
    listAuthEvents(200),
    lockedOutIps(),
  ])

  const tiles: { label: string; value: number }[] = [
    { label: "Honeypot visits", value: counts.honeypot_visit },
    { label: "Honeypot login tries", value: counts.honeypot_login },
    { label: "Wrong passwords", value: counts.login_failed },
    { label: "Successful logins", value: counts.login_ok },
  ]

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/security" />
        <h1 className="mb-2 text-2xl font-semibold">Security</h1>
        <p className="mb-6 max-w-2xl text-sm text-gh-muted">
          Logins to this CMS and visits to the decoy at /admin. Five wrong
          passwords from one IP within 15 minutes lock that IP out until the
          window passes. Passwords are never stored, including the ones typed
          into the decoy. Rows older than 90 days are pruned.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg border border-gh-border bg-gh-surface p-4"
            >
              <p className="text-2xl font-semibold tabular-nums">
                {tile.value}
              </p>
              <p className="text-sm text-gh-muted">{tile.label}, last 7 days</p>
            </div>
          ))}
        </div>

        {locked.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
            <p className="font-medium">Locked out right now</p>
            <ul className="mt-1 text-gh-muted">
              {locked.map((row) => (
                <li key={row.ip} className="font-mono">
                  {row.ip} ({row.n} wrong passwords)
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">When (IST)</th>
                <th className="px-4 py-3 font-medium">What</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Browser</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-gh-border">
                  <td className="whitespace-nowrap px-4 py-3 text-gh-muted">
                    {when(event.created_at)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 ${KIND_TONE[event.kind] ?? ""}`}
                  >
                    {KIND_LABELS[event.kind] ?? event.kind}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{event.ip}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs">
                    {event.detail}
                  </td>
                  <td
                    className="max-w-[320px] truncate px-4 py-3 text-xs text-gh-muted"
                    title={event.user_agent}
                  >
                    {event.user_agent}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    Nothing logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
