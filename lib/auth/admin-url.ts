/**
 * The CMS is not served at /admin. Its routes live under app/admin and
 * app/api/admin, but the public URL is a secret segment (ADMIN_PATH), and
 * proxy.ts rewrites that segment onto the real routes:
 *
 *   /<secret>/board      ->  /admin/board
 *   /<secret>/api/board  ->  /api/admin/board
 *
 * A request for /admin itself gets the honeypot, and /api/admin/* is a 404.
 * So code keeps naming routes by their internal path and passes each one
 * through here on the way out to the browser.
 *
 * Plain module, no env access: the server reads the secret in admin-path.ts
 * and the browser gets it from <AdminBaseProvider>.
 */

/** Only lowercase letters, digits and dashes, and long enough not to guess. */
export const ADMIN_PATH_PATTERN = /^[a-z0-9-]{16,64}$/

export function toPublicAdminUrl(base: string, internal: string): string {
  if (internal === "/api/admin" || internal.startsWith("/api/admin/")) {
    return `/${base}/api${internal.slice("/api/admin".length)}`
  }
  if (internal === "/admin" || internal.startsWith("/admin/")) {
    return `/${base}${internal.slice("/admin".length)}`
  }
  if (internal.startsWith("/admin?")) {
    return `/${base}${internal.slice("/admin".length)}`
  }
  throw new Error(`Not an admin path: ${internal}`)
}

/** The reverse, for proxy.ts: the internal route a public admin URL maps to. */
export function toInternalAdminPath(base: string, pathname: string) {
  const prefix = `/${base}`
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) return null
  const rest = pathname.slice(prefix.length)
  if (rest === "/api" || rest.startsWith("/api/")) {
    return `/api/admin${rest.slice("/api".length)}`
  }
  return `/admin${rest}`
}
