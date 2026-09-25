import { isCloudinaryImage } from "@/lib/validation/image"

/** Cover plus gallery. The popup gallery is built for a handful, not an album. */
export const EVENT_IMAGES_MAX = 12

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
  if (attendees && !Number.isFinite(Number(attendees))) {
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
  if (images.length > EVENT_IMAGES_MAX) {
    errors.images = `At most ${EVENT_IMAGES_MAX} photos`
  } else if (images.some((src) => !isCloudinaryImage(src))) {
    // Uploaded through the CMS, so always Cloudinary. The seed photos that
    // used to ship in public/images/events are gone.
    errors.images = "Upload photos here rather than linking to them"
  }

  const sortOrder = String(input.sortOrder ?? "0").trim()
  if (sortOrder && !Number.isFinite(Number(sortOrder))) {
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
