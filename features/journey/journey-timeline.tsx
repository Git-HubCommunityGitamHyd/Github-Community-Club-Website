"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { journeyIcon } from "@/features/journey/icons"
import type { JourneyEntry } from "@/lib/db/journey"
import { cn } from "@/lib/utils"

/**
 * What changed, and why the previous version read as bland.
 *
 * It animated once and then stopped: every card faded up on entry and from
 * then on the section was eight static blocks and a drawn line. Nothing
 * responded to the reader, nothing indicated where they were in eight years of
 * history, and the only way through it was to scroll past all of it.
 *
 * Three things fix that, and all three are about *state*, not more motion.
 *
 * 1. One entry is active at a time — whichever is nearest the middle of the
 *    viewport. The active node fills with the accent and grows, its card lifts
 *    and sharpens, and the rest sit back. The section now tells you where you
 *    are as you move.
 * 2. A year rail, sticky beside the timeline, listing every year in the
 *    history. It highlights the active year and each entry is a real button
 *    that scrolls to it, so eight years are navigable in one click instead of
 *    a long scroll.
 * 3. Hover and keyboard focus promote an entry too, so the thing is
 *    interactive with a pointer, with a keyboard, and while scrolling.
 *
 * Active tracking is one scroll handler measuring node positions rather than
 * eight IntersectionObservers with a sliver root margin: it needs *nearest to
 * centre*, which is a comparison across all entries, not a per-element
 * threshold — and with Lenis driving the scroll, observers fire at their own
 * cadence and the highlight lags the page.
 *
 * The entries come from D1, not from a constant. Each row carries its own icon
 * key; the component used to index a fixed array of eight glyphs by position,
 * which is fine for a hardcoded list of eight and wrong the moment the club
 * adds a ninth milestone or reorders two.
 */

function yearOf(entry: JourneyEntry) {
  return entry.entry_date.trim().split(/\s+/).pop() ?? entry.entry_date
}

export function JourneyTimeline({ entries }: { entries: JourneyEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Nearest to the middle of the viewport wins. Polled on scroll rather than
  // observed, because this is a comparison across every entry and because
  // Lenis moves the page inside its own frame loop.
  useEffect(() => {
    const resolve = () => {
      const middle = window.innerHeight / 2
      let best = 0
      let bestDistance = Infinity
      nodeRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - middle)
        if (distance < bestDistance) {
          bestDistance = distance
          best = index
        }
      })
      setActiveIndex(best)
    }

    resolve()
    window.addEventListener("scroll", resolve, { passive: true })
    window.addEventListener("resize", resolve)
    return () => {
      window.removeEventListener("scroll", resolve)
      window.removeEventListener("resize", resolve)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  })

  // Spring so the draw keeps moving through Lenis's inertia instead of
  // stepping frame to frame with the raw scroll value.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  const scaleY = useTransform(progress, (v) => v)

  // The one the reader is pointing at beats the one they have scrolled to.
  const focusedIndex = hoveredIndex ?? activeIndex

  const years = entries.map(yearOf)
  const uniqueYears = [...new Set(years)]

  const scrollToIndex = (index: number) => {
    nodeRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  return (
    <div className="lg:flex lg:gap-12">
      <YearRail
        years={uniqueYears}
        activeYear={years[focusedIndex]}
        onSelect={(year) => scrollToIndex(years.indexOf(year))}
      />

      <div ref={ref} className="relative flex-1">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-gh-border md:left-1/2"
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleY }}
          className="absolute bottom-0 left-[1.75rem] top-0 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-gh-accent via-gh-accent to-transparent md:left-1/2"
        />

        <ol className="relative">
          {entries.map((entry, index) => (
            <Entry
              key={entry.id}
              ref={(node) => {
                nodeRefs.current[index] = node
              }}
              entry={entry}
              index={index}
              isFocused={focusedIndex === index}
              onEnter={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </ol>
      </div>
    </div>
  )
}

function YearRail({
  years,
  activeYear,
  onSelect,
}: {
  years: string[]
  activeYear: string
  onSelect: (year: string) => void
}) {
  return (
    <nav
      aria-label="Jump to a year"
      className="sticky top-32 hidden h-fit w-28 shrink-0 lg:block"
    >
      <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gh-muted">
        Timeline
      </p>
      <ul className="space-y-1">
        {years.map((year) => {
          const isActive = year === activeYear
          return (
            <li key={year}>
              <button
                type="button"
                onClick={() => onSelect(year)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg py-1.5 text-left font-mono text-sm font-bold tabular-nums transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
                  isActive
                    ? "text-gh-accent"
                    : "text-gh-muted hover:text-gh-text",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px transition-all duration-300",
                    isActive
                      ? "w-6 bg-gh-accent"
                      : "w-3 bg-gh-border group-hover:w-5",
                  )}
                />
                {year}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// `ref` as a plain prop — React 19 passes it through without forwardRef.
function Entry({
  ref,
  entry,
  index,
  isFocused,
  onEnter,
  onLeave,
}: {
  ref: (node: HTMLLIElement | null) => void
  entry: JourneyEntry
  index: number
  isFocused: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const onLeft = index % 2 === 0
  // Lowercase local, rendered through a module-scope component: assigning a
  // capitalised name from a call during render trips react-hooks/static-components.
  const glyph = journeyIcon(entry.icon)

  return (
    <li
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 md:grid-cols-[1fr_5rem_1fr] md:gap-x-0"
    >
      <div
        className={`hidden md:block ${onLeft ? "md:pr-12 md:text-right" : ""}`}
      >
        {onLeft && <Card entry={entry} align="right" isFocused={isFocused} />}
      </div>

      <div className="relative flex justify-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className={cn(
            "relative z-10 mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-[background-color,border-color,color,box-shadow,transform] duration-300",
            isFocused
              ? "scale-110 border-transparent bg-gh-accent text-gh-deep shadow-[0_12px_30px_-10px_rgba(63,185,80,0.55)]"
              : "border-gh-border bg-gh-elevated text-gh-muted shadow-[0_8px_24px_-12px_rgba(1,4,9,0.9)]",
          )}
        >
          {/* A ring that only exists on the active node, so the eye can find
              the current point in the history at a glance. It fades in place
              rather than sharing a `layoutId` across the nodes: entries sit
              300px or more apart, so a shared ring flew the length of the
              section on every change — and travelled through empty space
              whenever the newly active entry was still off-screen. */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -inset-2 rounded-[1.25rem] border transition-all duration-300",
              isFocused
                ? "scale-100 border-gh-accent/40 opacity-100"
                : "scale-90 border-transparent opacity-0",
            )}
          />
          <NodeGlyph icon={glyph} />
        </motion.span>
      </div>

      <div className={`md:pl-12 ${onLeft ? "md:invisible" : ""}`}>
        <Card entry={entry} align="left" isFocused={isFocused} />
      </div>
    </li>
  )
}

function NodeGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" className="h-6 w-6" />
}

function Card({
  entry,
  align,
  isFocused,
}: {
  entry: JourneyEntry
  align: "left" | "right"
  isFocused: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pb-16 md:pb-24"
    >
      <div
        className={cn(
          "transition-opacity duration-500",
          isFocused ? "opacity-100" : "opacity-55",
        )}
      >
        <div
          className={cn(
            "font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-gh-accent",
            align === "right" && "md:text-right",
          )}
        >
          {entry.entry_date}
        </div>
        <h3
          className={cn(
            "mt-3 text-balance text-[clamp(24px,2.6vw,38px)] font-extrabold leading-[1.08] tracking-[-0.02em] transition-transform duration-500",
            isFocused &&
              (align === "right" ? "md:-translate-x-1" : "md:translate-x-1"),
          )}
        >
          {entry.title}
        </h3>
        <p
          className={cn(
            "mt-4 max-w-[46ch] text-pretty text-base leading-relaxed text-gh-muted",
            align === "right" && "md:ml-auto",
          )}
        >
          {entry.description}
        </p>
      </div>
    </motion.div>
  )
}
