import type { CSSProperties, ReactNode } from "react"
import { SectionLabel } from "@/features/site/section-label"

/** Place in the staggered arrival (globals.css `.project-rise`). */
export function rise(i: number): CSSProperties {
  return { "--i": String(i) } as CSSProperties
}

/**
 * One block of a project's or a build's page below the header. The label sits
 * in its own column on wide screens so every block starts its content on the
 * same vertical line, which is what makes six differently shaped sections
 * read as one document.
 */
export function Block({
  index,
  label,
  id,
  order,
  children,
}: {
  index: number
  label: string
  id?: string
  order: number
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-mascot-dock
      style={rise(order)}
      className="project-rise grid scroll-mt-32 gap-6 border-t border-gh-border pt-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10"
    >
      <SectionLabel index={String(index).padStart(2, "0")} className="h-fit">
        {label}
      </SectionLabel>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

/** A block's "NOTES.md" frame, for dev notes on either kind of page. */
export function NotesFrame({ children }: { children: ReactNode }) {
  return (
    // Framed like a file in a repository, because that is where notes like
    // these usually live, and so the section reads as a different voice from
    // the brief above it.
    <div className="overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/70">
      <div className="flex items-center gap-2 border-b border-gh-border px-5 py-3 font-mono text-xs text-gh-muted">
        <span aria-hidden="true" className="size-2 rounded-full bg-gh-accent" />
        NOTES.md
      </div>
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </div>
  )
}
