import type { AvatarPerson } from "@/components/ui/avatar-circles"

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
}

/**
 * Their uploaded photo, else their GitHub avatar, else nothing (initials).
 * Most contributors will never upload a photo, and nearly all of them have a
 * GitHub account, so this is what makes a row of faces actually faces.
 */
export function profilePhoto(person: Pick<Profile, "image_url" | "github">) {
  if (person.image_url) return person.image_url
  if (person.github) {
    return `https://avatars.githubusercontent.com/${person.github}?size=160`
  }
  return null
}

export function toAvatar(person: Profile): AvatarPerson {
  return { name: person.name, src: profilePhoto(person) }
}
