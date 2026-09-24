import { ArrowLeft } from "lucide-react"
import { TransitionLink } from "@/features/v2/projects/transition"

/**
 * The way out of a page that is not the homepage.
 *
 * `/projects` had none at all: the navbar's Projects item scrolls that page to
 * its own top, so every nav item led further into the site and the only route
 * home was the browser's back button. One component, used by both pages, so a
 * third page cannot be added without the question coming up.
 *
 * It was a line of grey text with an arrow, which is easy to miss. Now a
 * pill: the arrow sits in its own disc that turns accent green and slides
 * left on hover, so the control says which way it goes before it is clicked,
 * and a small "Back to" kicker over the destination makes it read as
 * navigation rather than as a caption. Between project pages it goes through
 * the same view transition as the cards, so leaving a project plays the
 * arrival in reverse.
 */
export function ProjectsBackLink({
  href,
  children,
}: {
  href: string
  /** The destination, e.g. "Home" or "All projects". */
  children: string
}) {
  return (
    <TransitionLink
      href={href}
      // Only between pages that take part; the homepage does not.
      transition={href.startsWith("/projects") || href.startsWith("/builds")}
      aria-label={`Back to ${children.toLowerCase()}`}
      className="group inline-flex items-center gap-3 rounded-full border border-gh-border bg-gh-surface/80 py-1.5 pl-1.5 pr-5 text-gh-text shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm transition-[border-color,background-color,transform] duration-200 hover:border-gh-muted/60 hover:bg-gh-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.98]"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-gh-elevated text-gh-muted ring-1 ring-inset ring-gh-border transition-[background-color,color,transform,box-shadow] duration-200 ease-out group-hover:-translate-x-0.5 group-hover:bg-gh-accent group-hover:text-gh-deep group-hover:ring-transparent">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-gh-muted">
          Back to
        </span>
        <span className="text-sm font-semibold">{children}</span>
      </span>
    </TransitionLink>
  )
}
