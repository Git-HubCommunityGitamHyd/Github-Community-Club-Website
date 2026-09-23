"use client"

import { useState } from "react"
import type { Event } from "@/lib/db/events"
import { EventCard } from "@/features/v2/events/event-card"
import { EventDialog } from "@/features/v2/events/event-dialog"
import { SectionLabel } from "@/features/v2/section-label"
import { SectionTexture } from "@/components/ui/texture"

export function V2EventsSection({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Event | null>(null)

  // The first event is given the full width and a horizontal layout, the rest
  // run two-up. Three equal columns is the layout this redesign is trying to
  // get away from, and a featured row gives the section a focal point without
  // needing a second accent colour to create one. With one or two events the
  // grid simply has fewer cells — nothing here assumes a count.
  const [featured, ...rest] = events

  return (
    <section
      id="events"
      className="relative border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
    >
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="04">Events</SectionLabel>
        <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          What we&apos;ve run
        </h2>
        <p className="mb-14 max-w-[52ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
          Workshops, hackathons and contribution drives from past semesters.
          Open any one for the full write-up and photos.
        </p>

        {events.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-gray-300 px-8 py-14 text-center text-gray-500 dark:border-gh-border dark:text-gh-muted">
            Nothing scheduled yet. The first event of the semester goes up here.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <EventCard
                event={featured}
                featured
                onActivate={() => setSelected(featured)}
              />
            </div>

            {rest.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onActivate={() => setSelected(event)}
              />
            ))}
          </div>
        )}
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
