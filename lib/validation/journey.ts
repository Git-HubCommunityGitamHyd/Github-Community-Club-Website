import { JOURNEY_ICONS } from "@/features/journey/icons"

export type JourneyFormInput = {
  entryDate: string
  title: string
  description: string
  icon: string
  sortOrder: string
}

export type ValidationResult =
  | { ok: true; data: JourneyFormInput }
  | { ok: false; errors: Record<string, string> }

export function validateJourneyEntry(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const entryDate = String(input.entryDate ?? "").trim()
  if (!entryDate) errors.entryDate = "Date is required"

  const title = String(input.title ?? "").trim()
  if (!title) errors.title = "Title is required"

  const description = String(input.description ?? "").trim()
  if (!description) errors.description = "Description is required"

  // Checked against the same map the timeline renders from, so the CMS cannot
  // store a key that would silently fall back to the default glyph.
  const icon = String(input.icon ?? "").trim()
  if (!icon) errors.icon = "Icon is required"
  else if (!(icon in JOURNEY_ICONS)) errors.icon = "Unknown icon"

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && Number.isNaN(Number(sortOrder))) {
    errors.sortOrder = "Sort order must be a number"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return { ok: true, data: { entryDate, title, description, icon, sortOrder } }
}
