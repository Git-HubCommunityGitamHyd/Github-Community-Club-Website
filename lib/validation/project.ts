import { PROJECT_STATUSES } from "@/features/projects/statuses"
import { PROJECT_ROLES } from "@/features/projects/roles"
import type { ProjectInput, TeamEntry } from "@/lib/db/projects"

export type ProjectFormInput = {
  name: string
  slug: string
  summary: string
  body: string
  status: string
  liveUrl: string
  repoUrl: string
  previewImage: string
  coverImage: string
  tags: string
  devNotes: string
  sortOrder: string
}

export type ValidationResult =
  | { ok: true; data: ProjectFormInput & { team: TeamEntry[] } }
  | { ok: false; errors: Record<string, string> }

/**
 * Turns a name into a URL segment. Exported because the admin form offers it
 * as a convenience when the slug field is untouched, and the two must agree on
 * what a valid slug looks like.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Only http and https. A `javascript:` URL in a CMS field becomes a script
 * that runs when a visitor clicks the project's link, and the CMS is only as
 * trusted as the shared admin password.
 */
function checkUrl(raw: string, field: string, errors: Record<string, string>) {
  if (!raw) return
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    errors[field] = "Must be a full URL, including https://"
    return
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    errors[field] = "Only http and https links are allowed"
  }
}

export function validateProject(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const name = String(input.name ?? "").trim()
  if (!name) errors.name = "Name is required"

  const slug = String(input.slug ?? "").trim()
  if (!slug) errors.slug = "Slug is required"
  else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Lowercase letters, numbers and single hyphens only"
  }

  const summary = String(input.summary ?? "").trim()
  if (!summary) errors.summary = "Summary is required"

  const body = String(input.body ?? "").trim()

  // Checked against the same map the badge renders from, so the CMS cannot
  // store a key that would silently fall back to the default status.
  const status = String(input.status ?? "").trim()
  if (!status) errors.status = "Status is required"
  else if (!Object.hasOwn(PROJECT_STATUSES, status))
    errors.status = "Unknown status"

  const liveUrl = String(input.liveUrl ?? "").trim()
  checkUrl(liveUrl, "liveUrl", errors)

  const repoUrl = String(input.repoUrl ?? "").trim()
  checkUrl(repoUrl, "repoUrl", errors)

  const previewImage = String(input.previewImage ?? "").trim()
  const coverImage = String(input.coverImage ?? "").trim()

  const tags = String(input.tags ?? "").trim()

  const devNotes = String(input.devNotes ?? "").trim()

  const team = validateTeam(input.team, errors)

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && !Number.isFinite(Number(sortOrder))) {
    errors.sortOrder = "Sort order must be a number"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      name,
      slug,
      summary,
      body,
      status,
      liveUrl,
      repoUrl,
      previewImage,
      coverImage,
      tags,
      devNotes,
      sortOrder,
      team,
    },
  }
}

const CONTRIBUTION_MAX = 400

/**
 * The team arrives as a JSON array of `{ memberId, role, contribution }`.
 * Roles are checked against PROJECT_ROLES like status is against
 * PROJECT_STATUSES. Whether each member exists is the route's job, since it
 * needs the database.
 */
function validateTeam(
  raw: unknown,
  errors: Record<string, string>,
): TeamEntry[] {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) {
    errors.team = "Team must be a list"
    return []
  }
  const seen = new Set<number>()
  const team: TeamEntry[] = []
  for (const entry of raw) {
    const item = (entry ?? {}) as Record<string, unknown>
    const memberId = Number(item.memberId)
    if (!Number.isInteger(memberId) || memberId <= 0) {
      errors.team = "Pick a person for every row, or remove the row"
      continue
    }
    if (seen.has(memberId)) {
      errors.team = "Someone is listed twice"
      continue
    }
    seen.add(memberId)
    const role = String(item.role ?? "").trim()
    if (!Object.hasOwn(PROJECT_ROLES, role)) {
      errors.team = "Unknown project role"
      continue
    }
    const contribution = String(item.contribution ?? "").trim()
    if (contribution.length > CONTRIBUTION_MAX) {
      errors.team = `Keep each contribution under ${CONTRIBUTION_MAX} characters`
      continue
    }
    team.push({ memberId, role, contribution })
  }
  return team
}

/** The validated form, in the shape lib/db/projects.ts stores. */
export function toProjectInput(data: ProjectFormInput): ProjectInput {
  return {
    name: data.name,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    status: data.status,
    liveUrl: data.liveUrl || null,
    repoUrl: data.repoUrl || null,
    previewImage: data.previewImage || null,
    coverImage: data.coverImage || null,
    tags: parseTags(data.tags),
    devNotes: data.devNotes,
    sortOrder: Number(data.sortOrder || 0),
  }
}

/** Comma separated in the form, a real array in the database. */
export function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}
