"use client"

import { JourneyTimeline } from "@/features/v2/journey/journey-timeline"
import { JOURNEY_ITEMS } from "@/features/home/content"

export function V2JourneySection() {
  return (
    <section
      id="journey"
      className="border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <span className="font-mono text-[13px] font-bold text-gh-accent-light dark:text-gh-accent">
          02 — JOURNEY
        </span>
        <h2 className="mb-20 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          From the start.
        </h2>
        <JourneyTimeline items={JOURNEY_ITEMS} />
      </div>
    </section>
  )
}
