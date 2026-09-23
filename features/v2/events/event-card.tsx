"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Images, MapPin, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Event } from "@/lib/db/events"
import { categoryGlyph } from "@/features/v2/events/categories"
import { formatEventDate } from "@/features/v2/events/format"
import { cn } from "@/lib/utils"

/**
 * An event, as a card.
 *
 * The previous card was the generic gradient card with an event poured into
 * it: a badge, a title, a grey facts row, a paragraph, a link, and a footnote
 * reading "3 photos". That footnote is the whole problem — every one of these
 * events has photographs sitting in the database, and the section's answer to
 * "what was it like?" was to tell you how many pictures it was not showing
 * you. The cards were flat because the content was flat, not because the
 * container needed more effects.
 *
 * So the photograph is the card now. The remaining count moves onto the image
 * as a chip, which turns a dead footnote into an invitation: the picture you
 * can see plus the number you cannot.
 *
 * Events with no photographs — a talk, a newly announced event — keep the
 * exact same geometry, filled with the dot field and the category glyph that
 * the old card used. This matters more than it looks: if a missing image
 * collapsed the frame, one empty event would make the whole grid look broken
 * rather than making that one card look quiet.
 */

const CARD_BASE =
  "group/event relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition-colors duration-300 dark:bg-gh-surface"

const CARD_TONE = {
  plain:
    "border-gray-200 hover:border-gray-300 dark:border-gh-border dark:hover:border-gh-muted",
  featured:
    "border-gray-200 hover:border-gh-accent-light/45 dark:border-gh-border dark:hover:border-gh-accent/45",
}

export function EventCard({
  event,
  featured = false,
  onActivate,
}: {
  event: Event
  featured?: boolean
  onActivate: () => void
}) {
  const glyph = categoryGlyph(event.category)
  const [cover, ...others] = event.images

  const facts = [
    { icon: Calendar, value: formatEventDate(event.event_date) },
    { icon: MapPin, value: event.location },
    {
      icon: Users,
      value: event.attendees ? `${event.attendees} attended` : null,
    },
  ].filter((fact): fact is { icon: LucideIcon; value: string } =>
    Boolean(fact.value),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <article
        className={cn(
          CARD_BASE,
          featured ? CARD_TONE.featured : CARD_TONE.plain,
          // The featured event runs side by side from lg up. Below that it is
          // the same stacked card as the rest, which is the only layout that
          // works when the image has to stay above the fold of the card.
          featured && "lg:grid lg:grid-cols-2 lg:items-stretch",
        )}
      >
        <EventCover
          cover={cover}
          remaining={others.length}
          glyph={glyph}
          category={event.category}
          featured={featured}
          alt={`From ${event.title}`}
        />

        <div
          className={cn(
            "flex flex-1 flex-col p-7 sm:p-8",
            featured && "lg:justify-center lg:p-10",
          )}
        >
          <h3
            className={cn(
              "text-balance font-extrabold leading-[1.12] tracking-[-0.02em]",
              featured
                ? "text-[clamp(26px,3vw,38px)]"
                : "text-[clamp(21px,2vw,26px)]",
            )}
          >
            {event.title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gh-muted">
            {facts.map((fact) => (
              <span
                key={fact.value}
                className="inline-flex items-center gap-1.5"
              >
                <fact.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="tabular-nums">{fact.value}</span>
              </span>
            ))}
          </div>

          {/* `flex-1` here rather than on the paragraph: it pushes the CTA to
              the bottom of the card, so a row of cards ends its links on one
              line no matter how long each description runs. */}
          <p className="mt-5 max-w-[52ch] flex-1 text-pretty leading-relaxed text-gray-600 dark:text-gh-muted">
            {event.description}
          </p>

          <button
            type="button"
            onClick={onActivate}
            className="group/cta mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-gh-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:text-gh-text dark:hover:text-gh-accent dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-surface"
          >
            {/* Stretched over the whole card so the entire surface is the hit
                target, while the accessibility tree still sees one button with
                a real label. */}
            <span aria-hidden="true" className="absolute inset-0" />
            Read the write-up
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
            />
          </button>
        </div>
      </article>
    </motion.div>
  )
}

function EventCover({
  cover,
  remaining,
  glyph: Glyph,
  category,
  featured,
  alt,
}: {
  cover: string | undefined
  remaining: number
  glyph: LucideIcon
  category: string
  featured: boolean
  alt: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gh-elevated",
        // One aspect ratio for every card in the grid, so the titles beneath
        // them line up. The featured card drops the ratio at lg and fills its
        // own column instead.
        featured ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/10]",
      )}
    >
      {cover ? (
        <Image
          src={cover}
          alt={alt}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 45vw, 100vw"
          }
          className="object-cover transition-transform duration-1000 ease-out group-hover/event:scale-[1.045]"
        />
      ) : (
        <div className="absolute inset-0">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "22px 22px",
              color: "rgba(140,149,159,0.3)",
            }}
          />
          <Glyph
            aria-hidden="true"
            strokeWidth={1.2}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-gray-400/70 transition-transform duration-700 ease-out group-hover/event:scale-[1.08] dark:text-gh-muted/50"
          />
        </div>
      )}

      {/* A scrim only at the top, only as far as the badge reaches. A full
          overlay would flatten the photograph to make room for one small
          label. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
      />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-800 backdrop-blur-sm dark:bg-gh-deep/80 dark:text-gh-text">
        <Glyph
          aria-hidden="true"
          className="h-3.5 w-3.5 text-gh-accent-light dark:text-gh-accent"
        />
        {category}
      </span>

      {remaining > 0 && (
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Images aria-hidden="true" className="h-3.5 w-3.5" />+{remaining}
        </span>
      )}
    </div>
  )
}
