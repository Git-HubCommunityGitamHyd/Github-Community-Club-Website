export type ApplicationFormInput = {
  fullName: string
  email: string
  phone: string
  branch: string
  year: string
  githubUsername: string
  whyJoin: string
}

const YEARS = ["1", "2", "3", "4"]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s]{7,15}$/
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9-]{1,39}$/

export type ValidationResult =
  | { ok: true; data: ApplicationFormInput }
  | { ok: false; errors: Record<string, string> }

export function validateApplication(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const fullName = String(input.fullName ?? "").trim()
  if (!fullName) errors.fullName = "Full name is required"

  const email = String(input.email ?? "").trim()
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email"

  const phone = String(input.phone ?? "").trim()
  if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid phone number"

  const branch = String(input.branch ?? "").trim()
  if (!branch) errors.branch = "Branch is required"

  const year = String(input.year ?? "").trim()
  if (!YEARS.includes(year)) errors.year = "Select your year of study"

  const githubUsername = String(input.githubUsername ?? "").trim()
  if (githubUsername && !GITHUB_USERNAME_RE.test(githubUsername)) {
    errors.githubUsername = "Enter a valid GitHub username"
  }

  const whyJoin = String(input.whyJoin ?? "").trim()
  if (!whyJoin) errors.whyJoin = "Tell us why you want to join"
  else if (whyJoin.length > 1000)
    errors.whyJoin = "Keep it under 1000 characters"

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: { fullName, email, phone, branch, year, githubUsername, whyJoin },
  }
}
