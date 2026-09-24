import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { adminUrl } from "@/lib/auth/admin-path"
import { clientInfo } from "@/lib/auth/client-info"
import {
  COOKIE_NAME,
  createSessionValue,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth/session"
import {
  LOGIN_MAX_FAILURES,
  logAuthEvent,
  recentLoginFailures,
} from "@/lib/db/auth-events"

export const runtime = "nodejs"

function back(request: NextRequest, query: string) {
  return NextResponse.redirect(
    new URL(adminUrl(`/admin/login?${query}`), request.url),
    303,
  )
}

/**
 * The real login, reachable only as /<ADMIN_PATH>/api/login.
 *
 * Five wrong passwords from one IP inside 15 minutes lock that IP out until
 * the window passes. The lockout is checked before the password, so a locked
 * IP learns nothing from further guesses, right or wrong.
 */
export async function POST(request: NextRequest) {
  const who = clientInfo(request.headers)

  if ((await recentLoginFailures(who.ip)) >= LOGIN_MAX_FAILURES) {
    await logAuthEvent({ kind: "login_locked", ...who })
    return back(request, "error=locked")
  }

  const formData = await request.formData()
  const password = String(formData.get("password") ?? "")

  if (!(await verifyPassword(password))) {
    await logAuthEvent({ kind: "login_failed", ...who })
    const left = LOGIN_MAX_FAILURES - (await recentLoginFailures(who.ip))
    return back(request, left > 0 ? `error=1&left=${left}` : "error=locked")
  }

  await logAuthEvent({ kind: "login_ok", ...who })
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createSessionValue(), sessionCookieOptions())
  return NextResponse.redirect(new URL(adminUrl("/admin"), request.url), 303)
}
