import {
  CircleCheck,
  CircleX,
  Hammer,
  Inbox,
  Rocket,
  type LucideIcon,
} from "lucide-react"

/**
 * Where a proposal is. `public` decides whether /proposals shows it at all:
 * everything arrives as `pending` and nobody but the admins sees it until one
 * of them moves it on. `declined` stays private too, so a student's idea is
 * never shown to the college with a "no" stamped on it.
 */
export type ProposalStatus = {
  label: string
  icon: LucideIcon
  public: boolean
  tone: "accent" | "neutral"
}

export const PROPOSAL_STATUSES: Record<string, ProposalStatus> = {
  pending: { label: "New", icon: Inbox, public: false, tone: "neutral" },
  accepted: {
    label: "Accepted",
    icon: CircleCheck,
    public: true,
    tone: "neutral",
  },
  building: {
    label: "Being built",
    icon: Hammer,
    public: true,
    tone: "neutral",
  },
  built: { label: "Built", icon: Rocket, public: true, tone: "accent" },
  declined: {
    label: "Declined",
    icon: CircleX,
    public: false,
    tone: "neutral",
  },
}

export const PROPOSAL_STATUS_KEYS = Object.keys(PROPOSAL_STATUSES)
export const PUBLIC_PROPOSAL_STATUSES = PROPOSAL_STATUS_KEYS.filter(
  (key) => PROPOSAL_STATUSES[key].public,
)

export function proposalStatus(key: string): ProposalStatus {
  return PROPOSAL_STATUSES[key] ?? PROPOSAL_STATUSES.pending
}

/** Who it is for. Plain words: the form is for anyone, not just developers. */
export const PROPOSAL_AUDIENCES: Record<string, string> = {
  students: "Students",
  faculty: "Faculty and staff",
  clubs: "Clubs and societies",
  campus: "Everyone on campus",
  other: "Someone else",
}

/** What shape it takes, asked as "how would people use it?" */
export const PROPOSAL_FORMATS: Record<string, string> = {
  website: "On a website",
  app: "As a phone app",
  chat: "Through a chat bot",
  unsure: "Not sure, you decide",
}

/** Whether they want in. */
export const PROPOSAL_HELP: Record<string, string> = {
  build: "Yes, I want to help build it",
  test: "Yes, I can test it and give feedback",
  none: "No, I'm just sharing the idea",
}

export function labelOf(set: Record<string, string>, key: string): string {
  return set[key] ?? key
}
