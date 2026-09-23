"use client"

import { useState } from "react"
import { Calendar, ImageIcon, MapPin, Users } from "lucide-react"
import type { Event } from "@/lib/db/events"
import { GradientCard } from "@/components/ui/gradient-card"
import { EventDialog } from "@/features/v2/events/event-dialog"
import { categoryGlyph } from "@/features/v2/events/categories"
import { formatEventDate } from "@/features/v2/events/format"
import { SectionLabel } from "@/features/v2/section-label"

function EventMeta({ event }: { event: Event }) {
  const facts = [
    { icon: Calendar, value: formatEventDate(event.event_date) },
    { icon: MapPin, value: event.location },
    { icon: Users, value: event.attendees ? `${event.attendees}` : null },
  ].filter((fact) => Boolean(fact.value))

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gh-muted">
      {facts.map((fact) => (
        <span key={fact.value} className="inline-flex items-center gap-1.5">
          <fact.icon aria-hidden="true" className="h-4 w-4" />
          <span className="tabular-nums">{fact.value}</span>
        </span>
      ))}
    </div>
  )
}

function PhotoCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gh-muted">
      <ImageIcon aria-hidden="true" className="h-3.5 w-3.5" />
      {count} {count === 1 ? "photo" : "photos"}
    </span>
  )
}

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
      className="border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
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
              <GradientCard
                tone="featured"
                horizontal
                badgeText={featured.category}
                glyph={categoryGlyph(featured.category)}
                title={featured.title}
                description={featured.description}
                ctaText="Read the write-up"
                onActivate={() => setSelected(featured)}
                meta={<EventMeta event={featured} />}
                footer={<PhotoCount count={featured.images.length} />}
              />
            </div>

            {rest.map((event) => (
              <GradientCard
                key={event.id}
                badgeText={event.category}
                glyph={categoryGlyph(event.category)}
                title={event.title}
                description={event.description}
                ctaText="Read the write-up"
                onActivate={() => setSelected(event)}
                meta={<EventMeta event={event} />}
                footer={<PhotoCount count={event.images.length} />}
              />
            ))}
          </div>
        )}
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
