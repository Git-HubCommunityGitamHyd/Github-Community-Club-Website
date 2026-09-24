import { NextResponse, type NextRequest } from "next/server"
import { adminBase } from "@/lib/auth/admin-path"
import { toInternalAdminPath } from "@/lib/auth/admin-url"

// Rewrites here land on a route that does not exist, which renders the
// site's ordinary 404 with a 404 status: identical to any mistyped URL, so
// nothing about the response says a route is being hidden.
const NOT_FOUND = "/__not-found"

function rewrite(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.rewrite(url)
}

/** The honeypot, told which /admin URL was asked for so it can log it. */
function honeypot(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = "/honeypot"
  url.search = ""
  const headers = new Headers(request.headers)
  headers.set("x-honeypot-path", request.nextUrl.pathname.slice(0, 120))
  return NextResponse.rewrite(url, { request: { headers } })
}

function isUnder(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Hides the CMS.
 *
 * - /<ADMIN_PATH>/...      the real CMS (rewritten to app/admin)
 * - /<ADMIN_PATH>/api/...  its API (rewritten to app/api/admin)
 * - /admin/...             the honeypot
 * - /api/admin/login       the honeypot's fake login endpoint
 * - /api/admin/...         404, as are the internal honeypot routes
 *
 * With ADMIN_PATH unset nothing reaches the real CMS at all. The session is
 * still checked on every admin page and API route; this only decides which
 * URL they answer on.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const base = adminBase()

  if (base) {
    const internal = toInternalAdminPath(base, pathname)
    if (internal) return rewrite(request, internal)
  }

  if (isUnder(pathname, "/admin")) return honeypot(request)
  if (pathname === "/api/admin/login") return rewrite(request, "/api/honeypot")
  if (
    isUnder(pathname, "/api/admin") ||
    isUnder(pathname, "/honeypot") ||
    isUnder(pathname, "/api/honeypot")
  ) {
    return rewrite(request, NOT_FOUND)
  }

  return NextResponse.next()
}

export const config = {
  // Everything except build assets and files in public/ (anything with an
  // extension). The secret segment cannot be listed here, since the matcher
  // is fixed at build time and the segment is a runtime secret.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
