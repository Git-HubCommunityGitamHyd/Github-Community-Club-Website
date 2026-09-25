"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Event } from "@/lib/db/events"
import { EventsGrid } from "@/features/events/events-grid"
import { SectionLabel } from "@/features/site/section-label"
import { SectionTexture } from "@/components/ui/texture"

/**
 * At most five on the homepage: the featured event plus two rows of two. The
 * rest are what the events page is for. Order is the CMS order.
 */
const HOME_LIMIT = 5

export function EventsSection({ events }: { events: Event[] }) {
  const shown = events.slice(0, HOME_LIMIT)
  const hasMore = events.length > HOME_LIMIT

  return (
    <section
      id="events"
      className="relative border-y border-gh-border bg-gh-surface"
    >
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="04">Events</SectionLabel>
        <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          What we&apos;ve run
        </h2>
        <p className="mb-14 max-w-[52ch] text-pretty text-lg leading-relaxed text-gh-muted">
          Workshops, talks and hackathons from past semesters. Open any one for
          the full write-up and photos.
        </p>

        {events.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-gh-border px-8 py-14 text-center text-gh-muted">
            Nothing scheduled yet. The first event of the semester goes up here.
          </p>
        ) : (
          <EventsGrid events={shown} />
        )}

        {hasMore && (
          <div className="mt-12">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2.5 rounded-full border border-gh-border px-6 py-3 text-[15px] font-semibold text-gh-text transition-colors duration-300 hover:border-gh-accent hover:bg-gh-accent hover:text-gh-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
            >
              View all {events.length} events
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
