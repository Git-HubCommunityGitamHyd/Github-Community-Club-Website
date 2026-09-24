import {
  BUILD_IMAGES_MAX,
  BUILD_ROLES,
  RESERVED_BUILD_SLUGS,
  BUILD_STATUSES,
  type Credit,
  BUILD_UPLOAD_FOLDER,
  mondayOf,
} from "@/features/v2/builds/keys"
import type { BuildReview, BuildSubmission } from "@/lib/db/builds"
import { validateStudent } from "./student"

export const BUILD_TITLE_MAX = 60
export const BUILD_TAGLINE_MAX = 100
export const BUILD_DESCRIPTION_MIN = 40
export const BUILD_DESCRIPTION_MAX = 1500
const BUILT_WITH_MAX = 200
const TEAMMATES_MAX = 200
const NOTE_MAX = 1000
export const DEV_NOTES_MAX = 3000
const CREDITS_MAX = 12
const CONTRIBUTION_MAX = 400
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Who made it, for the People section. At least one person; roles are keys;
 * the same name twice is almost certainly a slip.
 */
function validateCredits(
  raw: unknown,
  errors: Record<string, string>,
): Credit[] {
  const list = Array.isArray(raw) ? raw : []
  const credits: Credit[] = list.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>
    return {
      name: String(item.name ?? "")
        .trim()
        .replace(/\s+/g, " "),
      role: String(item.role ?? ""),
      contribution: String(item.contribution ?? "").trim(),
    }
  })
  if (credits.length === 0) errors.credits = "Credit at least one person"
  else if (credits.length > CREDITS_MAX) {
    errors.credits = `Up to ${CREDITS_MAX} people`
  } else if (credits.some((c) => !c.name || c.name.length > 80)) {
    errors.credits = "Every person needs a name (under 80 characters)"
  } else if (credits.some((c) => !(c.role in BUILD_ROLES))) {
    errors.credits = "Pick a role for everyone"
  } else if (credits.some((c) => c.contribution.length > CONTRIBUTION_MAX)) {
    errors.credits = `Keep each contribution under ${CONTRIBUTION_MAX} characters`
  } else if (
    new Set(credits.map((c) => c.name.toLowerCase())).size !== credits.length
  ) {
    errors.credits = "Someone is listed twice"
  }
  return credits
}

type Result<T> =
  { ok: true; data: T } | { ok: false; errors: Record<string, string> }

function text(
  input: Record<string, unknown>,
  field: string,
  errors: Record<string, string>,
  { min = 0, max, required }: { min?: number; max: number; required?: string },
): string {
  const value = String(input[field] ?? "").trim()
  if (required && !value) errors[field] = required
  else if (value && value.length < min) {
    errors[field] = `A little more, at least ${min} characters`
  } else if (value.length > max) {
    errors[field] = `Keep it under ${max} characters`
  }
  return value
}

/** http(s) only, for the same reason as project links: no `javascript:`. */
function url(
  input: Record<string, unknown>,
  field: string,
  errors: Record<string, string>,
): string | null {
  const raw = String(input[field] ?? "").trim()
  if (!raw) return null
  try {
    const parsed = new URL(raw)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString()
    }
    errors[field] = "Only http and https links"
  } catch {
    errors[field] = "Paste the full link, starting with https://"
  }
  return null
}

/**
 * Images must be Cloudinary uploads. A public form that accepted any URL
 * would let anyone put any image, from anywhere, on a page the club's name is
 * on. For public submissions they must also sit in the folder the public
 * upload signature is restricted to.
 */
export function isAllowedImage(raw: string, publicUpload: boolean): boolean {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== "https:") return false
    if (parsed.hostname !== "res.cloudinary.com") return false
    if (!parsed.pathname.includes("/image/upload/")) return false
    return !publicUpload || parsed.pathname.includes(`/${BUILD_UPLOAD_FOLDER}/`)
  } catch {
    return false
  }
}

function images(
  input: Record<string, unknown>,
  errors: Record<string, string>,
  publicUpload: boolean,
): string[] {
  const list = Array.isArray(input.images) ? input.images.map(String) : []
  if (list.length === 0) errors.images = "Add at least one screenshot"
  else if (list.length > BUILD_IMAGES_MAX) {
    errors.images = `Up to ${BUILD_IMAGES_MAX} images`
  } else if (list.some((src) => !isAllowedImage(src, publicUpload))) {
    errors.images = "Upload the images here rather than linking them"
  }
  return [...new Set(list)]
}

function buildFields(
  input: Record<string, unknown>,
  errors: Record<string, string>,
  publicUpload: boolean,
) {
  return {
    title: text(input, "title", errors, {
      max: BUILD_TITLE_MAX,
      required: "What's it called?",
    }),
    tagline: text(input, "tagline", errors, {
      max: BUILD_TAGLINE_MAX,
      required: "One line on what it does",
    }),
    description: text(input, "description", errors, {
      min: BUILD_DESCRIPTION_MIN,
      max: BUILD_DESCRIPTION_MAX,
      required: "Tell us about it",
    }),
    builtWith: text(input, "builtWith", errors, { max: BUILT_WITH_MAX }),
    liveUrl: url(input, "liveUrl", errors),
    repoUrl: url(input, "repoUrl", errors),
    images: images(input, errors, publicUpload),
    devNotes: text(input, "devNotes", errors, { max: DEV_NOTES_MAX }),
  }
}

/** The public form. */
export function validateBuildSubmission(
  input: Record<string, unknown>,
): Result<BuildSubmission> {
  const errors: Record<string, string> = {}
  const fields = buildFields(input, errors, true)
  const teammates = text(input, "teammates", errors, { max: TEAMMATES_MAX })
  const student = validateStudent(input, errors)
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { ...fields, teammates, ...student } }
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** The CMS review form. */
export function validateBuildReview(
  input: Record<string, unknown>,
): Result<BuildReview> {
  const errors: Record<string, string> = {}
  const fields = buildFields(input, errors, false)

  const slug = String(input.slug ?? "").trim()
  if (!slug) errors.slug = "Needed for the page's address"
  else if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    errors.slug = "Lowercase letters, numbers and single hyphens"
  } else if (RESERVED_BUILD_SLUGS.includes(slug)) {
    errors.slug = "That address is taken by another page"
  }

  const credits = validateCredits(input.credits, errors)

  const status = String(input.status ?? "")
  if (!(status in BUILD_STATUSES)) errors.status = "Pick a status"

  const monthRaw = String(input.month ?? "").trim()
  let month: string | null = null
  if (monthRaw) {
    if (MONTH_PATTERN.test(monthRaw)) month = monthRaw
    else errors.month = "Pick a month"
  } else if (status === "accepted") {
    errors.month = "Accepted builds go in a month"
  }

  // Any date in the week works; it is stored as that week's Monday so every
  // build in a week shares one value to group by.
  const weekRaw = String(input.weekOf ?? "").trim()
  let weekOf: string | null = null
  if (weekRaw) {
    const date = new Date(`${weekRaw}T00:00:00Z`)
    if (DATE_PATTERN.test(weekRaw) && !Number.isNaN(date.getTime())) {
      weekOf = mondayOf(date)
    } else errors.weekOf = "Pick a date"
  }
  if (weekOf && status !== "accepted") {
    errors.weekOf = "Only accepted builds can be one of the week's"
  }

  const sortRaw = String(input.sortOrder ?? "0").trim()
  const sortOrder = Number(sortRaw || 0)
  if (!Number.isInteger(sortOrder)) errors.sortOrder = "A whole number"

  const adminNote = text(input, "adminNote", errors, { max: NOTE_MAX })

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: {
      ...fields,
      slug,
      credits,
      status,
      month,
      weekOf,
      sortOrder,
      adminNote,
    },
  }
}
