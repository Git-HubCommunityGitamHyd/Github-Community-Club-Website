import { STUDENT_YEAR_KEYS } from "@/features/forms/student"

export type StudentDetails = {
  name: string
  year: string
  branch: string
  regNo: string
  phone: string
}

const NAME_MAX = 80
const BRANCH_MAX = 60

/**
 * Normalises an Indian mobile number to its 10 digits (dropping spaces,
 * dashes, a leading 0 or +91), so the CMS shows every number the same way.
 * Anything else that looks like an international number with a + is kept
 * as typed.
 */
export function normalisePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, "")
  const indian = compact.match(/^(?:\+91|91|0)?([6-9]\d{9})$/)
  if (indian) return indian[1]
  if (/^\+\d{8,15}$/.test(compact)) return compact
  return null
}

/**
 * Registration numbers differ by campus and batch (all digits, or letters
 * and digits), so this only checks the shape: 6 to 20 letters and digits,
 * spaces dropped, upper-cased.
 */
export function normaliseRegNo(raw: string): string | null {
  const compact = raw.replace(/\s+/g, "").toUpperCase()
  return /^[A-Z0-9]{6,20}$/.test(compact) ? compact : null
}

/** Adds any problems to `errors` and returns the cleaned values. */
export function validateStudent(
  input: Record<string, unknown>,
  errors: Record<string, string>,
): StudentDetails {
  const name = String(input.name ?? "")
    .trim()
    .replace(/\s+/g, " ")
  if (!name) errors.name = "Tell us your name"
  else if (name.length > NAME_MAX) {
    errors.name = `Keep it under ${NAME_MAX} characters`
  }

  const year = String(input.year ?? "").trim()
  if (!STUDENT_YEAR_KEYS.includes(year)) errors.year = "Pick your year"

  const branch = String(input.branch ?? "").trim()
  if (!branch) errors.branch = "Tell us your branch"
  else if (branch.length > BRANCH_MAX) {
    errors.branch = `Keep it under ${BRANCH_MAX} characters`
  }

  const regNo = normaliseRegNo(String(input.regNo ?? ""))
  if (!regNo) errors.regNo = "That doesn't look like a registration number"

  const phone = normalisePhone(String(input.phone ?? ""))
  if (!phone) errors.phone = "Enter a 10 digit mobile number"

  return { name, year, branch, regNo: regNo ?? "", phone: phone ?? "" }
}

/** What the public pages print: the first name only. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ""
}
