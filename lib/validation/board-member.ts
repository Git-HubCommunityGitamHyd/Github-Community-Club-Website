import { BOARD_ACCENTS } from "@/features/board/accents"
import { isCloudinaryImage } from "@/lib/validation/image"

export type BoardMemberFormInput = {
  name: string
  role: string
  imageUrl: string
  description: string
  github: string
  linkedin: string
  email: string
  accent: string
  sortOrder: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9-]{1,39}$/

export type ValidationResult =
  | { ok: true; data: BoardMemberFormInput }
  | { ok: false; errors: Record<string, string> }

export function validateBoardMember(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const name = String(input.name ?? "").trim()
  if (!name) errors.name = "Name is required"

  const role = String(input.role ?? "").trim()
  if (!role) errors.role = "Role is required"

  const imageUrl = String(input.imageUrl ?? "").trim()
  // Uploaded through the CMS, so always a Cloudinary URL. A link pasted from
  // anywhere else would 400 in next/image on the public page.
  if (imageUrl && !isCloudinaryImage(imageUrl)) {
    errors.imageUrl = "Upload the image here rather than linking to one"
  }

  const description = String(input.description ?? "").trim()
  if (!description) errors.description = "Description is required"

  const github = String(input.github ?? "").trim()
  if (github && !GITHUB_USERNAME_RE.test(github)) {
    errors.github = "Enter a valid GitHub username"
  }

  const linkedin = String(input.linkedin ?? "").trim()

  const email = String(input.email ?? "").trim()
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email"

  // Checked against the same map the dialog renders from, so the CMS cannot
  // store a key that would silently fall back to the default ring. Blank means
  // "unspecified" and takes the default rather than being an error, so rows
  // written before this column existed still validate.
  const accent = String(input.accent ?? "").trim() || "green"
  if (!Object.hasOwn(BOARD_ACCENTS, accent))
    errors.accent = "Unknown ring style"

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
      imageUrl,
      description,
      github,
      linkedin,
      email,
      accent,
      sortOrder,
    },
  }
}
