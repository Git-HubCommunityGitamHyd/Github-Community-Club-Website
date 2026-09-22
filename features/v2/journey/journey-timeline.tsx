"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import {
  GitBranch,
  GitCommitVertical,
  GitFork,
  GitMerge,
  GitPullRequest,
  Star,
  Tag,
  Users,
} from "lucide-react"

export type JourneyItem = {
  date: string
  title: string
  description: string
}

/**
 * Node icons carry git semantics rather than being interchangeable dots — the
 * club's history reads as a repository history. Keyed by position so
 * features/home/content.ts stays untouched; the fallback keeps the timeline
 * working if someone appends an entry without coming here first.
 *
 * Stored as elements rather than component references on purpose: binding one
 * to a capitalised local and rendering `<Icon />` counts as creating a
 * component during render, which resets its state on every pass.
 */
const ICON_CLASS = "h-6 w-6"

const NODE_ICONS = [
  <GitBranch key="branch" className={ICON_CLASS} />, // founded — branch cut
  <GitCommitVertical key="commit" className={ICON_CLASS} />, // first flagship
  <Star key="star" className={ICON_CLASS} />, // Ace Award, SIG -> Club
  <Users key="users" className={ICON_CLASS} />, // new executive board
  <GitPullRequest key="pr" className={ICON_CLASS} />, // second flagship
  <GitFork key="fork" className={ICON_CLASS} />, // a board per campus
  <GitMerge key="merge" className={ICON_CLASS} />, // 700+ members
  <Tag key="tag" className={ICON_CLASS} />, // third flagship — a release
]

const FALLBACK_ICON = (
  <GitCommitVertical key="fallback" className={ICON_CLASS} />
)

function Entry({ item, index }: { item: JourneyItem; index: number }) {
  const onLeft = index % 2 === 0

  return (
    <li className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 md:grid-cols-[1fr_5rem_1fr] md:gap-x-0">
      {/* Desktop left column: holds the card on even rows, empty on odd. */}
      <div
        className={`hidden md:block ${onLeft ? "md:pr-12 md:text-right" : ""}`}
      >
        {onLeft && <Card item={item} align="right" />}
      </div>

      {/* The spine column. The node sits on the line in both layouts. */}
      <div className="relative flex justify-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="relative z-10 mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gh-accent-light shadow-[0_8px_24px_-12px_rgba(1,4,9,0.25)] dark:border-gh-border dark:bg-gh-elevated dark:text-gh-accent dark:shadow-[0_8px_24px_-12px_rgba(1,4,9,0.9)]"
        >
          {NODE_ICONS[index] ?? FALLBACK_ICON}
        </motion.span>
      </div>

      {/* Mobile always renders here; desktop only on odd rows. */}
      <div className={`md:pl-12 ${onLeft ? "md:invisible" : ""}`}>
        <Card item={item} align="left" />
      </div>
    </li>
  )
}

function Card({ item, align }: { item: JourneyItem; align: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pb-16 md:pb-24"
    >
      <div
        className={`font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-gh-accent-light dark:text-gh-accent ${
          align === "right" ? "md:text-right" : ""
        }`}
      >
        {item.date}
      </div>
      <h3 className="mt-3 text-balance text-[clamp(24px,2.6vw,38px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
        {item.title}
      </h3>
      <p
        className={`mt-4 max-w-[46ch] text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted ${
          align === "right" ? "md:ml-auto" : ""
        }`}
      >
        {item.description}
      </p>
    </motion.div>
  )
}

export function JourneyTimeline({ items }: { items: JourneyItem[] }) {
  const ref = useRef<HTMLDivElement>(null)

  // Progress across the timeline's own height: 0 when its top reaches the
  // bottom of the viewport, 1 when its bottom reaches the top.
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

  return (
    <div ref={ref} className="relative">
      {/* Spine. Offset to the node column's centre: 1.75rem on mobile (half of
          the 3.5rem gutter), dead centre from md up. */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-[1.75rem] top-0 w-px -translate-x-1/2 bg-gray-200 dark:bg-gh-border md:left-1/2"
      />
      <motion.div
        aria-hidden="true"
        style={{ scaleY }}
        className="absolute bottom-0 left-[1.75rem] top-0 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-gh-accent-light via-gh-accent-light to-transparent dark:from-gh-accent dark:via-gh-accent md:left-1/2"
      />

      <ol className="relative">
        {items.map((item, index) => (
          <Entry key={item.title} item={item} index={index} />
        ))}
      </ol>
    </div>
  )
}
