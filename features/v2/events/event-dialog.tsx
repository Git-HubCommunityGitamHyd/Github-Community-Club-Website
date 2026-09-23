"use client"

import Image from "next/image"
import {
  Calendar,
  Clock,
  ImageIcon,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { Event } from "@/lib/db/events"
import { DialogShell } from "@/features/v2/dialog-shell"
import { categoryGlyph } from "@/features/v2/events/categories"
import { formatEventDate } from "@/features/v2/events/format"

/**
 * The event write-up.
 *
 * It used to be a document: a badge, a heading, a row of inline facts, a
 * paragraph, a rule, and a marquee of photos scrolling sideways underneath. The
 * photos were the most interesting thing about a past event and they were the
 * last thing you reached, pushed below the fold of the panel and moving on
 * their own so you could not study one.
 *
 * Now the first photo is the cover: it opens on the event rather than on a
 * heading, with the title set over a scrim so the two read as one object. The
 * facts are a bordered strip of labelled cells instead of four icons on one
 * line — they are the specifics somebody actually scans for (when, where, how
 * long, how many), and a strip lets them be labelled. The rest of the photos
 * are a still grid, so each one can be looked at.
 *
 * Events with no photos get a tinted band carrying the oversized category
 * glyph, so the panel has the same shape either way rather than collapsing
 * into the old document layout whenever a write-up has no pictures.
 */

function CategoryBadge({
  icon: Icon,
  label,
  onCover,
}: {
  icon: LucideIcon
  label: string
  onCover: boolean
}) {
  return (
    <span
      className={
        onCover
          ? "inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-gh-deep/55 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
          : "inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:border-gh-border dark:text-gh-muted"
      }
    >
      <Icon
        aria-hidden="true"
        className={
          onCover
            ? "h-3.5 w-3.5 text-gh-accent"
            : "h-3.5 w-3.5 text-gh-accent-light dark:text-gh-accent"
        }
      />
      {label}
    </span>
  )
}

function CoverGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.25}
      className="h-28 w-28 text-gh-accent-light/25 dark:text-gh-accent/25"
    />
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
        {
          icon: Calendar,
          label: "Date",
          value: formatEventDate(event.event_date),
        },
        { icon: MapPin, label: "Venue", value: event.location },
        { icon: Clock, label: "Ran for", value: event.duration },
        {
          icon: Users,
          label: "Attended",
          value: event.attendees ? String(event.attendees) : null,
        },
      ].filter((fact) => Boolean(fact.value))
    : []

  const cover = event?.images[0] ?? null
  const gallery = event?.images.slice(1) ?? []

  return (
    <DialogShell
      open={event !== null}
      onClose={onClose}
      labelledBy="event-dialog-title"
      panelClassName="max-w-3xl"
      bleed
    >
      {event && glyph && (
        <>
          <header className="relative">
            {cover ? (
              <div className="relative h-56 w-full overflow-hidden sm:h-72">
                <Image
                  src={cover}
                  alt={`${event.title} — photo from the event`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
                {/* Scrim, not a flat overlay: the title sits at the bottom, so
                    only the bottom needs darkening. Flattening the whole image
                    to make text legible wastes the photograph. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(1,4,9,0.92) 0%, rgba(1,4,9,0.55) 34%, rgba(1,4,9,0.05) 72%)",
                  }}
                />
              </div>
            ) : (
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gh-elevated sm:h-48">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                    color: "rgba(140,149,159,0.3)",
                  }}
                />
                <CoverGlyph icon={glyph} />
              </div>
            )}

            <div
              className={
                cover
                  ? "absolute inset-x-0 bottom-0 p-7 sm:p-9"
                  : "px-7 pb-2 pt-7 sm:px-9"
              }
            >
              <CategoryBadge
                icon={glyph}
                label={event.category}
                onCover={Boolean(cover)}
              />
              <h3
                id="event-dialog-title"
                className={
                  cover
                    ? "mt-4 text-balance text-[clamp(26px,3.4vw,38px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white"
                    : "mt-4 text-balance text-[clamp(26px,3.4vw,38px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-gray-900 dark:text-gh-text"
                }
              >
                {event.title}
              </h3>
            </div>
          </header>

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 border-b border-gray-200 dark:border-gh-border sm:grid-cols-4">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="border-t border-gray-200 px-5 py-4 first:border-l-0 dark:border-gh-border sm:border-l sm:first:border-l-0"
                >
                  <dt className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gh-muted">
                    <fact.icon aria-hidden="true" className="h-3.5 w-3.5" />
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-gray-900 dark:text-gh-text">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="px-7 py-7 sm:px-9 sm:py-9">
            <p className="max-w-[62ch] text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted">
              {event.description}
            </p>

            {gallery.length > 0 && (
              <section className="mt-8">
                <h4 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gh-muted">
                  <ImageIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  From the day
                </h4>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((src, index) => (
                    <div
                      key={src}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gh-elevated"
                    >
                      <Image
                        src={src}
                        alt={`${event.title} — photo ${index + 2}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 240px"
                        className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </DialogShell>
  )
}
