"use client"

import { useState } from "react"
import { Check, Copy, Link2 } from "lucide-react"

/**
 * The private link, on the thank-you screen. It is the only way back to the
 * submission's status (there are no accounts), and the server keeps only a
 * hash of it, so the copy says plainly to save it now.
 */
export function TrackLink({ path, noun }: { path: string; noun: string }) {
  const [copied, setCopied] = useState(false)
  const url =
    typeof window === "undefined" ? path : `${window.location.origin}${path}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the link is selectable text anyway.
    }
  }

  return (
    <div className="mt-8 max-w-xl rounded-2xl border border-gh-accent/40 bg-gh-accent/[0.06] p-5">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-gh-text">
        <Link2 aria-hidden="true" className="size-4 text-gh-accent" />
        Your private link
      </p>
      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-gh-muted">
        Save it now. It shows where your {noun} is, any time, with no account.
        We can&apos;t show it to you again.
      </p>
      <div className="mt-4 flex items-stretch gap-2">
        <a
          href={path}
          className="min-w-0 flex-1 truncate rounded-lg border border-gh-border bg-gh-bg/70 px-3 py-2 font-mono text-xs text-gh-text hover:border-gh-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gh-border px-3 text-sm font-medium text-gh-text transition-colors hover:border-gh-accent hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent active:scale-[0.97]"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  )
}
