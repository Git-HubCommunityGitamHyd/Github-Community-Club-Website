/**
 * A submitted build is `pending` until an admin reads it, then `accepted`
 * into a month or `declined`. Only accepted builds are public.
 */
export const BUILD_STATUSES: Record<string, string> = {
  pending: "New",
  accepted: "Accepted",
  declined: "Declined",
}

export const BUILD_STATUS_KEYS = Object.keys(BUILD_STATUSES)

/** The Cloudinary folder public uploads are signed for, and checked against. */
export const BUILD_UPLOAD_FOLDER = "build-submissions"
export const BUILD_UPLOAD_FORMATS = "jpg,jpeg,png,webp"
export const BUILD_IMAGES_MAX = 6

/** "2026-09" to "September 2026". */
export function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number)
  if (!year || !m) return month
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** "YYYY-MM-DD" of the Monday on or before `date` (in UTC). */
export function mondayOf(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

/** "2026-09-21" to "21 Sep". */
export function weekLabel(weekOf: string): string {
  const d = new Date(`${weekOf}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return weekOf
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

/** "2026-09" for the month `date` falls in. */
export function monthOf(date: Date): string {
  return date.toISOString().slice(0, 7)
}

/**
 * Someone's part in a build, as a key like every other fixed choice. Two,
 * because a student build is rarely bigger than a few friends: whoever led
 * it, and everyone who built it with them.
 */
export const BUILD_ROLES: Record<string, { label: string; rank: number }> = {
  lead: { label: "Lead", rank: 0 },
  member: { label: "Teammate", rank: 1 },
}

export const BUILD_ROLE_KEYS = Object.keys(BUILD_ROLES)

export function buildRole(key: string) {
  return Object.hasOwn(BUILD_ROLES, key) ? BUILD_ROLES[key] : BUILD_ROLES.member
}

export type Credit = { name: string; role: string; contribution: string }

/** Paths under /builds that are pages of their own, so never a build's slug. */
export const RESERVED_BUILD_SLUGS = ["submit", "track"]
