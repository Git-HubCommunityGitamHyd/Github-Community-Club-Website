import type { Metadata } from "next"
import { headers } from "next/headers"
import { Honeypot } from "@/features/honeypot/honeypot"
import { describeUserAgent } from "@/features/honeypot/user-agent"
import { clientInfo } from "@/lib/auth/client-info"
import { logAuthEvent } from "@/lib/db/auth-events"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign in · Admin console",
  robots: { index: false, follow: false },
}

/**
 * What /admin serves: a decoy. proxy.ts rewrites every /admin URL here, and
 * a direct request for /honeypot is a 404. The real CMS lives under the
 * secret ADMIN_PATH segment.
 */
export default async function HoneypotPage() {
  const h = await headers()
  const who = clientInfo(h)
  try {
    await logAuthEvent({
      kind: "honeypot_visit",
      ...who,
      detail: h.get("x-honeypot-path") ?? "/admin",
    })
  } catch {
    // The decoy must render even when the database is unavailable.
  }
  return (
    <Honeypot
      ip={who.ip === "unknown" ? null : who.ip}
      browser={describeUserAgent(who.userAgent)}
      path={h.get("x-honeypot-path") ?? "/admin"}
    />
  )
}
