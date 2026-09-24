import { projectStatus } from "@/features/v2/projects/statuses"
import { cn } from "@/lib/utils"

/**
 * One badge, used on the homepage list, the projects page and a project's own
 * page, so a status cannot come to mean two different things in two places.
 *
 * Green is reserved for the one status that is a claim a visitor can act on:
 * the thing is live and they can open it now. The rest are neutral and read by
 * their word and glyph. Colour-coding all six would put five extra hues on a
 * page with one accent, to express a distinction the label already makes.
 */
export function ProjectStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const { label, icon: Icon, tone } = projectStatus(status)

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
        tone === "accent"
          ? "border-gh-accent/40 bg-gh-accent/10 text-gh-accent"
          : "border-gh-border bg-gh-elevated/60 text-gh-muted",
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
      {label}
    </span>
  )
}
