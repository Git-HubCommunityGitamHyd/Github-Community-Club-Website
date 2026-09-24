import { BOARD_ACCENTS } from "@/features/v2/board/accents"
import type { MemberInput } from "@/lib/db/members"

export type MemberFormInput = {
  name: string
  role: string
  description: string
  imageUrl: string
  github: string
  linkedin: string
  email: string
  accent: string
  sortOrder: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9-]{1,39}$/

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
  if (!(accent in BOARD_ACCENTS)) errors.accent = "Unknown ring style"

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && Number.isNaN(Number(sortOrder))) {
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
    sortOrder: Number(data.sortOrder || 0),
  }
}
