"use client"

import { Calendar, Clock, MapPin, Users, type LucideIcon } from "lucide-react"
import type { Event } from "@/lib/db/events"
import { DialogShell } from "@/features/v2/dialog-shell"
import { AutoScrollGallery } from "@/components/motion/auto-scroll-gallery"
import { categoryGlyph } from "@/features/v2/events/categories"
import { formatEventDate } from "@/features/v2/events/format"

/**
 * Declared out here, taking the icon as a prop, rather than rendering
 * `categoryGlyph(...)`'s return value inline. A capitalised local assigned from
 * a call during render is a new component on every render as far as React is
 * concerned, and `react-hooks/static-components` rejects it.
 */
function CategoryBadge({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:border-gh-border dark:text-gh-muted">
      <Icon
        aria-hidden="true"
        className="h-3.5 w-3.5 text-gh-accent-light dark:text-gh-accent"
      />
      {label}
    </span>
  )
}

export function EventDialog({
  event,
  onClose,
}: {
  event: Event | null
  onClose: () => void
}) {
  const glyph = event ? categoryGlyph(event.category) : null

  const facts = event
    ? [
        { icon: Calendar, value: formatEventDate(event.event_date) },
        { icon: MapPin, value: event.location },
        { icon: Clock, value: event.duration },
        {
          icon: Users,
          value: event.attendees ? `${event.attendees} attended` : null,
        },
      ].filter((fact) => Boolean(fact.value))
    : []

  return (
    <DialogShell
      open={event !== null}
      onClose={onClose}
      labelledBy="event-dialog-title"
    >
      {event && glyph && (
        <>
          <CategoryBadge icon={glyph} label={event.category} />

          <h3
            id="event-dialog-title"
            className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.02em] text-gray-900 dark:text-gh-text"
          >
            {event.title}
          </h3>

          {facts.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gh-muted">
              {facts.map((fact) => (
                <div key={fact.value} className="flex items-center gap-2">
                  <fact.icon aria-hidden="true" className="h-4 w-4" />
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-6 text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted">
            {event.description}
          </p>

          {event.images.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gh-border">
              <AutoScrollGallery images={event.images} title={event.title} />
            </div>
          )}
        </>
      )}
    </DialogShell>
  )
}
