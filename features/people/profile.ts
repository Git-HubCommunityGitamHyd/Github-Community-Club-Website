import type { AvatarPerson } from "@/components/ui/avatar-circles"
import { boardAccent } from "@/features/board/accents"

/**
 * What the profile dialog needs to draw someone. Board members and project
 * members both satisfy it as they come out of D1, because the two tables
 * share these columns on purpose (see db/schema.sql).
 */
export type Profile = {
  name: string
  /** One-line headline under the name. */
  role: string
  description: string
  image_url: string | null
  github: string | null
  linkedin: string | null
  email: string | null
  accent: string
  /** Their team, where one is known (club members; not board rows). */
  team_name?: string | null
  /** Club members only. */
  tagline?: string
  handle?: string | null
}

/** The handle a page shows: their own, else their GitHub username. */
export function displayHandle(person: Pick<Profile, "handle" | "github">) {
  return person.handle || person.github || null
}

/**
 * The avatar they sent, or null for the identicon fallback.
 *
 * There used to be a second step, their GitHub profile picture. It went
 * because for many people that is a photo of their face, and club members
 * asked not to show their faces (see docs/member-avatar-prompt.md).
 */
export function profilePhoto(person: Pick<Profile, "image_url">) {
  return person.image_url || null
}

/** The colour their identicon is drawn in: the first stop of their border. */
export function identiconColor(person: Pick<Profile, "accent">) {
  return boardAccent(person.accent).stops[0]
}

export function toAvatar(person: Profile): AvatarPerson {
  return {
    name: person.name,
    src: profilePhoto(person),
    color: identiconColor(person),
  }
}
