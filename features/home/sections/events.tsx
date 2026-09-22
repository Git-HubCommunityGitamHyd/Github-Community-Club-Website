"use client"

import { EventPopupCard } from "@/features/events/event-popup-card"
import type { Event } from "@/lib/db/events"

export function EventsSection({
  events,
  loading,
}: {
  events: Event[]
  loading: boolean
}) {
  return (
    <section
      id="events"
      className="border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
          04 — EVENTS
        </span>
        <h2 className="mb-3 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
          Events from last year.
        </h2>
        <p className="mb-12 text-lg text-gray-600 dark:text-gh-muted">
          Highlights from our community gatherings and workshops.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-80 flex-col items-center gap-4 rounded-2xl border border-gray-200 p-8 dark:border-gh-border"
                >
                  <div className="skeleton h-16 w-16 rounded-full" />
                  <div className="skeleton h-5 w-40 rounded-lg" />
                  <div className="skeleton h-4 w-32 rounded-lg" />
                </div>
              ))
            : events.map((event, index) => (
                <EventPopupCard
                  key={event.id}
                  index={index}
                  event={{
                    title: event.title,
                    date: event.event_date,
                    location: event.location ?? undefined,
                    attendees: event.attendees ?? undefined,
                    category: event.category,
                    duration: event.duration ?? undefined,
                    description: event.description,
                    images: event.images,
                  }}
                />
              ))}
        </div>
      </div>
    </section>
  )
}
