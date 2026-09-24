import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"

/** A big outbound link: the deployed site (accent) or the source. */
export function LinkCard({
  href,
  icon,
  kicker,
  title,
  accent = false,
}: {
  href: string
  icon: ReactNode
  kicker: string
  title: string
  accent?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex min-w-0 items-center gap-4 rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.99] ${
        accent
          ? "border-gh-accent/40 bg-gh-accent/[0.07] hover:border-gh-accent/70 hover:bg-gh-accent/[0.12]"
          : "border-gh-border bg-gh-surface/70 hover:border-gh-muted/60 hover:bg-gh-elevated"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-gh-accent text-gh-deep"
            : "bg-gh-elevated text-gh-text ring-1 ring-inset ring-gh-border"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
          {kicker}
        </span>
        <span className="mt-1 block truncate font-semibold text-gh-text">
          {title}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-gh-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gh-text"
      />
    </a>
  )
}
