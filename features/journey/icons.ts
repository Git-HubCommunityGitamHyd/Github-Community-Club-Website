import {
  Award,
  GitBranch,
  GitCommitVertical,
  GitFork,
  GitMerge,
  GitPullRequest,
  Megaphone,
  Rocket,
  Star,
  Tag,
  Trophy,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * The glyph set a timeline entry can choose from.
 *
 * The timeline used to index a fixed array of eight icons by entry position,
 * which only worked while the entries themselves were a hardcoded array of
 * eight. Once the timeline is CMS-managed, adding a ninth milestone would have
 * dropped off the end of that array, and reordering two entries would have
 * swapped their icons.
 *
 * So the icon is a column on the row, stored as one of these keys. A key, not
 * a class name and not an SVG: the CMS never holds markup, an unknown value
 * from an older row falls back instead of throwing, and renaming the
 * underlying icon is a change in this file alone.
 */
export const JOURNEY_ICONS = {
  branch: { label: "Branch: something was started", icon: GitBranch },
  commit: { label: "Commit: a step along the way", icon: GitCommitVertical },
  merge: { label: "Merge: things came together", icon: GitMerge },
  pr: { label: "Pull request: a contribution", icon: GitPullRequest },
  fork: { label: "Fork: the club split or spread", icon: GitFork },
  tag: { label: "Tag: a release or flagship event", icon: Tag },
  star: { label: "Star: recognition", icon: Star },
  award: { label: "Award: a prize or honour", icon: Award },
  trophy: { label: "Trophy: a competition won", icon: Trophy },
  users: { label: "People: a team or membership milestone", icon: Users },
  megaphone: { label: "Megaphone: an announcement", icon: Megaphone },
  rocket: { label: "Rocket: a launch", icon: Rocket },
} satisfies Record<string, { label: string; icon: LucideIcon }>

export type JourneyIconKey = keyof typeof JOURNEY_ICONS

export const JOURNEY_ICON_KEYS = Object.keys(JOURNEY_ICONS) as JourneyIconKey[]

/** Falls back rather than throwing, so an unrecognised key never blanks the page. */
export function journeyIcon(key: string): LucideIcon {
  return (
    Object.hasOwn(JOURNEY_ICONS, key)
      ? JOURNEY_ICONS[key as JourneyIconKey]
      : JOURNEY_ICONS.commit
  ).icon
}
