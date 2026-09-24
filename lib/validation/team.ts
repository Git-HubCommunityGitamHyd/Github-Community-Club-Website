import type { TeamInput } from "@/lib/db/teams"

export type TeamFormInput = {
  name: string
  description: string
  sortOrder: string
}

export type ValidationResult =
  | { ok: true; data: TeamFormInput }
  | { ok: false; errors: Record<string, string> }

const NAME_MAX = 40
const DESCRIPTION_MAX = 200

export function validateTeam(input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {}

  const name = String(input.name ?? "").trim()
  if (!name) errors.name = "Name is required"
  else if (name.length > NAME_MAX) {
    errors.name = `Keep it under ${NAME_MAX} characters`
  }

  const description = String(input.description ?? "").trim()
  if (description.length > DESCRIPTION_MAX) {
    errors.description = `Keep it under ${DESCRIPTION_MAX} characters`
  }

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && Number.isNaN(Number(sortOrder))) {
    errors.sortOrder = "Sort order must be a number"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { name, description, sortOrder } }
}

export function toTeamInput(data: TeamFormInput): TeamInput {
  return {
    name: data.name,
    description: data.description,
    sortOrder: Number(data.sortOrder || 0),
  }
}
