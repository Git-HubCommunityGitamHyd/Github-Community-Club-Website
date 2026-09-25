import { BOARD_ACCENTS } from "@/features/board/accents"
import type { MemberInput } from "@/lib/db/members"
import { isCloudinaryImage } from "@/lib/validation/image"

export type MemberFormInput = {
  name: string
  role: string
  description: string
  imageUrl: string
  github: string
  linkedin: string
  email: string
  accent: string
  tagline: string
  handle: string
  /** Blank for no team. Whether the team exists is the route's check. */
  teamId: string
  sortOrder: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9-]{1,39}$/
const HANDLE_RE = /^[a-zA-Z0-9._-]{1,39}$/

/** Long enough for a line, short enough to stay one line on a card. */
const TAGLINE_MAX = 80

export type ValidationResult =
  | { ok: true; data: MemberFormInput }
  | { ok: false; errors: Record<string, string> }

/**
 * Same rules as a board member, except the headline and bio are optional: a
 * contributor is tagged on a project first and may never write a bio.
 */
export function validateMember(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const name = String(input.name ?? "").trim()
  if (!name) errors.name = "Name is required"

  const role = String(input.role ?? "").trim()
  const description = String(input.description ?? "").trim()
  const imageUrl = String(input.imageUrl ?? "").trim()
  // Uploaded through the CMS, so always a Cloudinary URL. A link pasted from
  // anywhere else would 400 in next/image on the public page.
  if (imageUrl && !isCloudinaryImage(imageUrl)) {
    errors.imageUrl = "Upload the image here rather than linking to one"
  }

  // A pasted profile URL is the common mistake; take the username out of it
  // rather than rejecting it.
  const github = String(input.github ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
  if (github && !GITHUB_USERNAME_RE.test(github)) {
    errors.github = "Enter a valid GitHub username"
  }

  const linkedin = String(input.linkedin ?? "").trim()

  const email = String(input.email ?? "").trim()
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email"

  const accent = String(input.accent ?? "").trim() || "green"
  if (!Object.hasOwn(BOARD_ACCENTS, accent))
    errors.accent = "Unknown ring style"

  const tagline = String(input.tagline ?? "").trim()
  if (tagline.length > TAGLINE_MAX) {
    errors.tagline = `Keep it under ${TAGLINE_MAX} characters`
  }

  // "@name" and "name" both mean the handle "name"; the page adds the @.
  const handle = String(input.handle ?? "")
    .trim()
    .replace(/^@+/, "")
  if (handle && !HANDLE_RE.test(handle)) {
    errors.handle = "Letters, numbers, dots, dashes and underscores, up to 39"
  }

  const teamId = String(input.teamId ?? "").trim()
  if (teamId && !/^[1-9]\d*$/.test(teamId)) errors.teamId = "Unknown team"

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && !Number.isFinite(Number(sortOrder))) {
    errors.sortOrder = "Sort order must be a number"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      name,
      role,
      description,
      imageUrl,
      github,
      linkedin,
      email,
      accent,
      tagline,
      handle,
      teamId,
      sortOrder,
    },
  }
}

/** The validated form, in the shape lib/db/members.ts stores. */
export function toMemberInput(data: MemberFormInput): MemberInput {
  return {
    name: data.name,
    role: data.role,
    description: data.description,
    imageUrl: data.imageUrl || null,
    github: data.github || null,
    linkedin: data.linkedin || null,
    email: data.email || null,
    accent: data.accent,
    tagline: data.tagline,
    handle: data.handle || null,
    teamId: data.teamId ? Number(data.teamId) : null,
    sortOrder: Number(data.sortOrder || 0),
  }
}
