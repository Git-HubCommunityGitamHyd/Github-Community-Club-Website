"use client"

import { EnhancedTimeline } from "@/components/motion/enhanced-timeline"
import { JOURNEY_ITEMS } from "@/features/home/content"

export function JourneySection() {
  return (
    <section id="journey" className="border-y border-gh-border bg-gh-surface">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <span className="font-mono text-[13px] font-bold text-gh-accent">
          02 — JOURNEY
        </span>
        <h2 className="mb-14 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
          From the start.
        </h2>
        <EnhancedTimeline items={JOURNEY_ITEMS} />
      </div>
    </section>
  )
}
