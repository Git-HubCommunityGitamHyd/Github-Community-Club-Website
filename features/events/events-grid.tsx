"use client"

import { useState } from "react"
import type { Event } from "@/lib/db/events"
import { EventCard } from "@/features/events/event-card"
import { EventDialog } from "@/features/events/event-dialog"

/**
 * Event cards and the dialog they open, shared by the homepage section and
 * the events page so the two cannot drift.
 *
 * The first event is given the full width and a horizontal layout, the rest
 * run two-up. Three equal columns is the generic layout this avoids, and a
 * featured row gives the grid a focal point without needing a second accent
 * colour to create one. Nothing here assumes a count.
 */
export function EventsGrid({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Event | null>(null)

  if (events.length === 0) return null
  const [featured, ...rest] = events

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
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

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </>
  )
}
