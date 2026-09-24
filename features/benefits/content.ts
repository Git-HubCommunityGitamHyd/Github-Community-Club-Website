import {
  BadgeCheck,
  FlaskConical,
  GitPullRequestArrow,
  MessagesSquare,
  Network,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react"

/**
 * The six reasons to join, each with a glyph.
 *
 * The first version of this copy said "learn cutting-edge technologies",
 * "connect with like-minded developers" and the like: six cards that said
 * nothing a reader could picture and nothing another club could not also
 * claim. No amount of motion rescues copy that makes no claim.
 *
 * Each entry now says one specific thing that happens, and carries a short
 * `proof`: a fact, a cadence or a number. The proof is what gives the card a
 * second line of hierarchy to design around instead of a lone title and
 * paragraph floating in a 288px-tall box.
 */
export type Benefit = {
  title: string
  desc: string
  /** A short, concrete fact — shown as the card's footnote. */
  proof: string
  icon: LucideIcon
}

export const BENEFITS: Benefit[] = [
  {
    title: "Skill development",
    desc: "Git, code review, CI and deployment, taught in sessions where you type along on your own machine rather than watch slides.",
    proof: "Hands-on workshops",
    icon: TerminalSquare,
  },
  {
    title: "Networking",
    desc: "The people reviewing your pull requests sit in your lectures. Across three campuses, someone who has already solved your problem is usually a message away.",
    proof: "700+ members, 3 campuses",
    icon: Network,
  },
  {
    title: "Recognition",
    desc: "Your work ships under the club's name with your commits on it, in a public repository anyone can read, not anonymously into a shared folder.",
    proof: "Public repositories",
    icon: BadgeCheck,
  },
  {
    title: "Open source",
    desc: "Club work happens in public repositories. You can read the history, open an issue and send a pull request without asking anyone for permission first.",
    proof: "Issues anyone can pick up",
    icon: GitPullRequestArrow,
  },
  {
    title: "Mentorship",
    desc: "Someone further along reviews your code and tells you why. The semester after, you are the one doing the reviewing.",
    proof: "Reviewed by seniors",
    icon: MessagesSquare,
  },
  {
    title: "Building things",
    desc: "Tools that solve something for students on this campus, and builds we do purely because they are fun. Both kinds get finished and shown.",
    proof: "EPOCH, three years running",
    icon: FlaskConical,
  },
]
