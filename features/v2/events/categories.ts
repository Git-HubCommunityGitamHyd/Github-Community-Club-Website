import {
  CalendarDays,
  GitPullRequest,
  GraduationCap,
  Mic,
  Terminal,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

/**
 * The glyph a category gets on its card.
 *
 * `events.category` is free text in the schema and was a free-text input in the
 * admin form, so this is a lookup with a fallback rather than a union type —
 * rows written before this existed still render, they just get the calendar.
 * The admin form now offers these as a dropdown (keeping any value a row
 * already has), which is what makes the glyph something the CMS manages rather
 * than something only this file knows about.
 *
 * The key is matched case-insensitively and ignores surrounding whitespace, so
 * "workshop" and "Workshop" are the same category.
 */
export const EVENT_CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Talk",
  "Meetup",
  "Open Source",
  "Bootcamp",
  "Competition",
  "Social",
] as const

const GLYPHS: Record<string, LucideIcon> = {
  workshop: Wrench,
  hackathon: Terminal,
  talk: Mic,
  meetup: Users,
  "open source": GitPullRequest,
  bootcamp: GraduationCap,
  competition: Trophy,
  social: Users,
}

export function categoryGlyph(category: string): LucideIcon {
  return GLYPHS[category.trim().toLowerCase()] ?? CalendarDays
}
