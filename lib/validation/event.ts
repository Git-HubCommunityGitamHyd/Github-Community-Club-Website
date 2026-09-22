export type EventFormInput = {
  title: string
  eventDate: string
  location: string
  attendees: string
  category: string
  duration: string
  description: string
  images: string[]
  sortOrder: string
}

export type ValidationResult =
  | { ok: true; data: EventFormInput }
  | { ok: false; errors: Record<string, string> }

export function validateEvent(
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {}

  const title = String(input.title ?? "").trim()
  if (!title) errors.title = "Title is required"

  const eventDate = String(input.eventDate ?? "").trim()
  if (!eventDate) errors.eventDate = "Date is required"

  const location = String(input.location ?? "").trim()

  const attendees = String(input.attendees ?? "").trim()
  if (attendees && Number.isNaN(Number(attendees))) {
    errors.attendees = "Attendees must be a number"
  }

  const category = String(input.category ?? "").trim()
  if (!category) errors.category = "Category is required"

  const duration = String(input.duration ?? "").trim()

  const description = String(input.description ?? "").trim()
  if (!description) errors.description = "Description is required"

  const images = Array.isArray(input.images)
    ? input.images.filter((img): img is string => typeof img === "string")
    : []

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && Number.isNaN(Number(sortOrder))) {
    errors.sortOrder = "Sort order must be a number"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      title,
      eventDate,
      location,
      attendees,
      category,
      duration,
      description,
      images,
      sortOrder,
    },
  }
}
