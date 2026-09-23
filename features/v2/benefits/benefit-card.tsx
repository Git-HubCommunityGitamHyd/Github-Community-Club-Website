"use client"

import { useCallback, useRef, type CSSProperties } from "react"
import type { Benefit } from "@/features/v2/benefits/content"

/**
 * One card in the benefits stack.
 *
 * The old card was a number, a dot, a title and a paragraph in a 288px box.
 * Six of those stacking is a mechanic, not a design: the only thing that
 * happened was the stacking itself, and once a card was pinned there was
 * nothing on it to look at and nothing to do.
 *
 * Three things were added, in rough order of how much they matter:
 *
 * 1. A glyph, big and contained, in the manner of the about bento and the
 *    event cards — so a pinned card has a shape, not just text.
 * 2. A cursor spotlight. A soft accent-tinted radial that tracks the pointer
 *    across the card. This is the interactive part: a scroll-stack pins a card
 *    under the cursor for several hundred pixels of scrolling, which is exactly
 *    the situation where a surface that responds to the pointer pays off.
 * 3. A proof line in the footer, and the index promoted to a real figure, so
 *    there is a hierarchy to read rather than one block of grey text.
 *
 * The spotlight writes two CSS custom properties rather than React state.
 * Pointer moves fire at frame rate; putting them through `setState` would
 * re-render six cards on every one of them, and the scroll-stack is already
 * writing transforms to these same elements each frame.
 */
export function BenefitCard({
  benefit,
  index,
}: {
  benefit: Benefit
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const Icon = benefit.icon

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
    el.style.setProperty("--spot-opacity", "1")
  }, [])

  const onPointerLeave = useCallback(() => {
    ref.current?.style.setProperty("--spot-opacity", "0")
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group/benefit relative h-full w-full p-10"
      style={
        {
          "--spot-x": "50%",
          "--spot-y": "50%",
          "--spot-opacity": "0",
        } as CSSProperties
      }
    >
      {/* The spotlight. Behind the content, above the card background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity)",
          background:
            "radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(63,185,80,0.16), rgba(63,185,80,0.05) 42%, transparent 70%)",
        }}
      />

      <Icon
        aria-hidden="true"
        strokeWidth={1.4}
        className="pointer-events-none absolute bottom-8 right-9 h-36 w-36 origin-bottom-right text-gray-900/[0.06] transition-[transform,color] duration-700 ease-out group-hover/benefit:scale-[1.12] group-hover/benefit:text-gh-accent-light/20 dark:text-gh-text/[0.06] dark:group-hover/benefit:text-gh-accent/20"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-6">
          <span className="font-mono text-[28px] font-extrabold tabular-nums leading-none text-gray-200 transition-colors duration-300 group-hover/benefit:text-gh-accent-light/60 dark:text-gh-border dark:group-hover/benefit:text-gh-accent/50">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="rounded-full border border-gray-200 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 transition-colors duration-300 group-hover/benefit:border-gh-accent-light/40 group-hover/benefit:text-gh-accent-light dark:border-gh-border dark:text-gh-muted dark:group-hover/benefit:border-gh-accent/40 dark:group-hover/benefit:text-gh-accent">
            {benefit.proof}
          </span>
        </div>

        <div>
          {/* A rule that draws itself in from the left on hover — the smallest
              possible thing that makes the card feel like it answered. */}
          <span
            aria-hidden="true"
            className="mb-5 block h-0.5 w-10 origin-left scale-x-100 rounded-full bg-gray-200 transition-all duration-500 ease-out group-hover/benefit:w-24 group-hover/benefit:bg-gh-accent-light dark:bg-gh-border dark:group-hover/benefit:bg-gh-accent"
          />
          <h3 className="text-[clamp(26px,3vw,40px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {benefit.title}
          </h3>
          <p className="mt-4 max-w-[48ch] text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted sm:text-lg">
            {benefit.desc}
          </p>
        </div>
      </div>
    </div>
  )
}
