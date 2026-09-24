import { cn } from "@/lib/utils"

/**
 * The label above each section heading.
 *
 * It used to be `01 — ABOUT` set in bold accent-green mono at 13px, repeated
 * six times down the page. Three things made it read as imported from
 * somewhere else rather than designed with the rest:
 *
 * - it was the only green *text* on the page. Green is otherwise the page's
 *   action colour — buttons, links, the active timeline node — so a green
 *   label promised something clickable and delivered a caption.
 * - at bold 13px with no tracking it sat at the same visual weight as body
 *   copy, so it competed with the headline directly underneath it instead of
 *   introducing it.
 * - the em dash between a number and a word is a typographic tic. Nothing else
 *   on the page numbers itself that way.
 *
 * Now: the index keeps the accent, because a single digit is the right amount
 * of colour and it is the part that is genuinely an ordinal. The word itself
 * drops to the same muted grey as every other small label on the page (stat
 * captions, the timeline rail, the marquee header), gains real tracking so it
 * reads as a caption at a glance, and a short rule connects the two. The rule
 * is what makes it look placed rather than typed.
 */
export function SectionLabel({
  index,
  children,
  className,
}: {
  /** The section's ordinal, e.g. "01". */
  index: string
  children: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-mono text-[11px] font-bold tabular-nums text-gh-accent">
        {index}
      </span>
      <span aria-hidden="true" className="h-px w-7 bg-gh-border" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-gh-muted">
        {children}
      </span>
    </div>
  )
}
