"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { GitCommitHorizontal } from "lucide-react"
import { CountingNumber } from "@/components/ui/counting-number"

// The homepage stats' curve, so the two counters feel like one component.
const COUNT = {
  duration: 1.8,
  ease: [0.16, 1, 0.3, 1],
  type: "tween",
} as const

/**
 * Commits on the repository's default branch, counted up from zero when it
 * scrolls into view, as the homepage figures do. The number is cached in D1
 * and refreshed daily (lib/github/commits.ts); the page leaves this out
 * entirely when there is no number, rather than showing a zero that reads as
 * "nobody has worked on this".
 */
export function CommitCount({
  count,
  repoUrl,
}: {
  count: number
  repoUrl: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" })

  return (
    <a
      ref={ref}
      href={`${repoUrl.replace(/\/+$/, "")}/commits`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${count.toLocaleString()} commits on the default branch, open history on GitHub`}
      className="group flex shrink-0 flex-col items-start rounded-2xl border border-gh-border bg-gh-surface/70 px-5 py-4 transition-colors duration-200 hover:border-gh-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent sm:items-end"
    >
      <span
        aria-hidden="true"
        className="text-[clamp(32px,3.6vw,44px)] font-extrabold leading-none tracking-[-0.04em] text-gh-text"
      >
        <CountingNumber target={count} autoStart={inView} transition={COUNT} />
      </span>
      <span
        aria-hidden="true"
        className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted transition-colors group-hover:text-gh-accent"
      >
        <GitCommitHorizontal className="h-3.5 w-3.5" />
        Commits
      </span>
    </a>
  )
}
