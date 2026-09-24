import { proposalStatus } from "@/features/v2/proposals/keys"
import { cn } from "@/lib/utils"

/** Same rules as ProjectStatusBadge: green only for the one that shipped. */
export function ProposalStatusPill({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const { label, icon: Icon, tone } = proposalStatus(status)
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
      <Icon aria-hidden="true" className="size-3" strokeWidth={2} />
      {label}
    </span>
  )
}
