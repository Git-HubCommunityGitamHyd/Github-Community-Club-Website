"use client"

import Image from "next/image"
import type { PublicBuild } from "@/lib/db/builds"
import { cn } from "@/lib/utils"

export function creditLine(build: PublicBuild): string {
  const mates = build.teammates
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (mates.length === 0) return build.name
  if (mates.length === 1) return `${build.name} and ${mates[0]}`
  return `${build.name}, ${mates.slice(0, -1).join(", ")} and ${mates.at(-1)}`
}

export function stackOf(build: PublicBuild): string[] {
  return build.built_with
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * A build in a grid. The whole card is one button that opens the build; the
 * cover zooms a touch on hover, inside its frame, so the card itself stays
 * put and the grid does not shuffle.
 */
export function BuildCard({
  build,
  onOpen,
  size = "regular",
}: {
  build: PublicBuild
  onOpen: () => void
  size?: "feature" | "regular"
}) {
  const cover = build.images[0]
  const stack = stackOf(build)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/80 text-left transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gh-muted/50 hover:shadow-[0_18px_40px_-18px_rgba(1,4,9,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:translate-y-0 active:scale-[0.99]"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden border-b border-gh-border bg-gh-elevated",
          size === "feature" ? "aspect-[16/9]" : "aspect-[16/10]",
        )}
      >
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes={
              size === "feature"
                ? "(max-width: 1024px) 100vw, 720px"
                : "(max-width: 640px) 100vw, 400px"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        {build.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-gh-bg/80 px-2 py-0.5 font-mono text-[11px] text-gh-text backdrop-blur">
            {build.images.length} images
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            "text-pretty font-bold leading-snug tracking-[-0.01em] text-gh-text",
            size === "feature" ? "text-2xl" : "text-lg",
          )}
        >
          {build.title}
        </h3>
        <p className="mt-1.5 text-pretty text-[15px] leading-relaxed text-gh-muted">
          {build.tagline}
        </p>
        <div className="mt-auto pt-5">
          {stack.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-1.5">
              {stack.slice(0, 4).map((tool) => (
                <li
                  key={tool}
                  className="rounded-md border border-gh-border px-2 py-0.5 font-mono text-[11px] text-gh-muted"
                >
                  {tool}
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-gh-text/85">by {creditLine(build)}</p>
        </div>
      </div>
    </button>
  )
}
