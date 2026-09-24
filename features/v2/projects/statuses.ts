import {
  Archive,
  FlaskConical,
  Globe,
  Hammer,
  PencilRuler,
  Wrench,
  type LucideIcon,
} from "lucide-react"

/**
 * The status a project can be in.
 *
 * The CMS stores the key. It never stores the label, the icon or a colour, so
 * a rename here reaches every place the badge is drawn and a row can never
 * carry markup or an off-palette hue onto the site. Same contract as
 * JOURNEY_ICONS and BOARD_ACCENTS.
 *
 * `tone` is deliberately only two values. The site has one accent, and status
 * badges are exactly the kind of component that tempts a second and third:
 * amber for in progress, red for archived, blue for beta. Six hues on one page
 * to distinguish six states the icon and the word already distinguish. Green
 * means "you can use this right now"; everything else is neutral and reads by
 * its label.
 */
export type ProjectStatus = {
  label: string
  icon: LucideIcon
  tone: "accent" | "neutral"
}

export const PROJECT_STATUSES: Record<string, ProjectStatus> = {
  live: { label: "Live", icon: Globe, tone: "accent" },
  "in-progress": { label: "In progress", icon: Hammer, tone: "neutral" },
  beta: { label: "Beta", icon: FlaskConical, tone: "neutral" },
  planning: { label: "Planning", icon: PencilRuler, tone: "neutral" },
  maintenance: { label: "Maintenance", icon: Wrench, tone: "neutral" },
  archived: { label: "Archived", icon: Archive, tone: "neutral" },
}

export const DEFAULT_PROJECT_STATUS = "in-progress"

/** Never throws on an unknown key; the page renders rather than breaking. */
export function projectStatus(key: string | null | undefined): ProjectStatus {
  return PROJECT_STATUSES[key ?? ""] ?? PROJECT_STATUSES[DEFAULT_PROJECT_STATUS]
}
