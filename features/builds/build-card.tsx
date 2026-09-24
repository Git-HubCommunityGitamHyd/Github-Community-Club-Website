"use client"

import Image from "next/image"
import type { CSSProperties } from "react"
import type { PublicBuild } from "@/lib/db/builds"
import { creditLine, stackOf } from "@/features/builds/format"
import { TransitionLink } from "@/features/site/transition"
import { buildTransitionName } from "@/features/site/transition-name"
import { cn } from "@/lib/utils"

/**
 * A build in a grid, linking to its page. Like a project card: the title is a
 * stretched link over the whole card, and the cover and title carry view
 * transition names so they travel into the page rather than cutting to it.
 */
export function BuildCard({
  build,
  size = "regular",
}: {
  build: PublicBuild
  size?: "feature" | "regular"
}) {
  const cover = build.images[0]
  const stack = stackOf(build)
  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/80 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gh-muted/50 hover:shadow-[0_18px_40px_-18px_rgba(1,4,9,0.9)] has-[a:active]:translate-y-0 has-[a:active]:scale-[0.99] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-gh-accent has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-gh-bg">
      <div
        style={
          cover
            ? ({
                viewTransitionName: buildTransitionName(build.slug, "cover"),
              } as CSSProperties)
            : undefined
        }
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
          <span
            className="inline-block"
            style={{
              viewTransitionName: buildTransitionName(build.slug, "title"),
            }}
          >
            <TransitionLink
              href={`/builds/${build.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {build.title}
            </TransitionLink>
          </span>
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
    </article>
  )
}
