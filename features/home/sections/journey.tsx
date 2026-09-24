"use client"

import { JourneyTimeline } from "@/features/journey/journey-timeline"
import { SectionLabel } from "@/features/site/section-label"
import { SectionTexture } from "@/components/ui/texture"
import type { JourneyEntry } from "@/lib/db/journey"

export function JourneySection({ entries }: { entries: JourneyEntry[] }) {
  // Nothing in the CMS means nothing to draw. Rendering the heading over an
  // empty rail would read as a broken section rather than an empty one.
  if (entries.length === 0) return null

  return (
    <section
      id="journey"
      className="relative border-y border-gh-border bg-gh-surface"
    >
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="02">Journey</SectionLabel>
        <h2 className="mb-20 mt-5 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          From the start.
        </h2>
        <JourneyTimeline entries={entries} />
      </div>
    </section>
  )
}
