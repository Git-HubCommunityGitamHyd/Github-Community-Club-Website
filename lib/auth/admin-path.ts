import { ADMIN_PATH_PATTERN, toPublicAdminUrl } from "@/lib/auth/admin-url"

/**
 * The secret first path segment the CMS is served under, or null when
 * ADMIN_PATH is unset or malformed. Null fails closed: proxy.ts then serves
 * no admin route at all, rather than falling back to a guessable one.
 */
export function adminBase(): string | null {
  const value = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "")
  if (!value || !ADMIN_PATH_PATTERN.test(value)) return null
  return value
}

/** The public URL for an internal admin route, for server code. */
export function adminUrl(internal: string): string {
  const base = adminBase()
  if (!base) throw new Error("ADMIN_PATH is not set")
  return toPublicAdminUrl(base, internal)
}
