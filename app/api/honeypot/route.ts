import { NextRequest, NextResponse } from "next/server"
import { clientInfo } from "@/lib/auth/client-info"
import { logAuthEvent } from "@/lib/db/auth-events"

export const runtime = "nodejs"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * The decoy's login endpoint, answering as POST /api/admin/login (proxy.ts
 * sends that URL here). It logs the username and always refuses.
 *
 * It never reads a password. The decoy form does not send one, and if a
 * script posts one anyway this handler only looks at `username`.
 */
export async function POST(request: NextRequest) {
  let username = ""
  try {
    const body = (await request.json()) as { username?: unknown }
    if (typeof body.username === "string") username = body.username
  } catch {
    // A form post or garbage: still a try, just an anonymous one.
  }
  try {
    await logAuthEvent({
      kind: "honeypot_login",
      ...clientInfo(request.headers),
      detail: username.slice(0, 64),
    })
  } catch {
    // Logging is a bonus; the decoy must keep working without the database.
  }
  // Slow enough to feel like real work, and to make scripting it tedious.
  await sleep(700 + Math.random() * 500)
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
}
