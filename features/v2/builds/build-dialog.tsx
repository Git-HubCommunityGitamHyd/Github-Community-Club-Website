"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowUpRight, Github, Globe } from "lucide-react"
import type { PublicBuild } from "@/lib/db/builds"
import { DialogShell } from "@/features/v2/dialog-shell"
import { creditLine, stackOf } from "@/features/v2/builds/build-card"
import { monthLabel } from "@/features/v2/builds/keys"
import { cn } from "@/lib/utils"

export function BuildDialog({
  build,
  onClose,
}: {
  build: PublicBuild | null
  onClose: () => void
}) {
  return (
    <DialogShell
      open={build !== null}
      onClose={onClose}
      labelledBy="build-dialog-title"
      bleed
      perchMascot
      panelClassName="max-w-3xl"
    >
      {/* Keyed so the gallery starts on the cover for each build. */}
      {build && <BuildDetail key={build.id} build={build} />}
    </DialogShell>
  )
}

function BuildDetail({ build }: { build: PublicBuild }) {
  const [shown, setShown] = useState(0)
  const stack = stackOf(build)
  const image = build.images[shown] ?? build.images[0]

  return (
    <>
      {image && (
        <div className="relative aspect-[16/9] w-full bg-gh-elevated">
          <Image
            src={image}
            alt={`${build.title}, image ${shown + 1} of ${build.images.length}`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
            priority
          />
        </div>
      )}
      {build.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-gh-border bg-gh-bg/60 px-6 py-3 sm:px-8">
          {build.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === shown}
              className={cn(
                "relative h-12 w-20 shrink-0 overflow-hidden rounded-md border transition-[border-color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
                i === shown
                  ? "border-gh-accent"
                  : "border-gh-border opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="px-6 pb-8 pt-7 sm:px-8">
        {build.month && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
            {monthLabel(build.month)} builds
          </p>
        )}
        <h2
          id="build-dialog-title"
          className="mt-2 text-balance text-3xl font-extrabold tracking-[-0.02em] text-gh-text"
        >
          {build.title}
        </h2>
        <p className="mt-2 text-pretty text-lg text-gh-text/85">
          {build.tagline}
        </p>
        <p className="mt-1 text-sm text-gh-muted">by {creditLine(build)}</p>

        <p className="mt-6 whitespace-pre-line text-pretty leading-relaxed text-gh-muted">
          {build.description}
        </p>

        {stack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {stack.map((tool) => (
              <li
                key={tool}
                className="rounded-lg border border-gh-border bg-gh-surface/70 px-2.5 py-1 font-mono text-xs text-gh-text"
              >
                {tool}
              </li>
            ))}
          </ul>
        )}

        {(build.live_url || build.repo_url) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {build.live_url && (
              <a
                href={build.live_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group inline-flex items-center gap-2 rounded-full bg-gh-accent px-4 py-2 text-sm font-semibold text-gh-deep transition-[transform,background-color] hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface active:scale-[0.97]"
              >
                <Globe aria-hidden="true" className="size-4" />
                Open it
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            )}
            {build.repo_url && (
              <a
                href={build.repo_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-full border border-gh-border px-4 py-2 text-sm font-semibold text-gh-text transition-colors hover:border-gh-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent active:scale-[0.97]"
              >
                <Github aria-hidden="true" className="size-4" />
                Code
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}
