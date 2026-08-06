export type BoardMemberFormInput = {
  name: string
  role: string
  imageUrl: string
  description: string
  github: string
  linkedin: string
  email: string
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

  const description = String(input.description ?? "").trim()
  if (!description) errors.description = "Description is required"

  const github = String(input.github ?? "").trim()
  if (github && !GITHUB_USERNAME_RE.test(github)) {
    errors.github = "Enter a valid GitHub username"
  }

  const linkedin = String(input.linkedin ?? "").trim()

  const email = String(input.email ?? "").trim()
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email"

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
      imageUrl,
      description,
      github,
      linkedin,
      email,
      sortOrder,
    },
  }
}
