"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev gradient card, re-toned for this site.
 *
 * The snippet's four `gradient` variants are orange, slate, purple and emerald —
 * a different hue per card, which is the single loudest thing on a page that is
 * otherwise neutral surfaces plus one GitHub green. So the variants are gone and
 * the card is a neutral surface in both themes; the only colour is the accent,
 * and it is the same accent on every card. Cards are told apart by their glyph,
 * not by hue.
 *
 * `tone` survives as a much quieter thing: it decides how present the card is,
 * so a featured event can sit forward of the rest without introducing a colour.
 *
 * The decorative `<img>` became a `glyph`, per the brief's "per-category
 * glyphs". A remote decorative image is a request, a layout shift and a licence
 * question for something that is ornament; an icon is none of those and cannot
 * clash with the palette.
 */
const cardVariants = cva(
  "group/card relative flex h-full w-full flex-col overflow-hidden rounded-3xl border p-8 transition-colors duration-300",
  {
    variants: {
      tone: {
        plain:
          "border-gray-200 bg-white hover:border-gray-300 dark:border-gh-border dark:bg-gh-surface dark:hover:border-gh-muted",
        featured:
          "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gh-accent-light/40 dark:border-gh-border dark:from-gh-elevated dark:to-gh-surface dark:hover:border-gh-accent/40",
      },
    },
    defaultVariants: { tone: "plain" },
  },
)

export interface GradientCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardVariants> {
  badgeText: string
  glyph: LucideIcon
  title: string
  description: string
  ctaText: string
  onActivate: () => void
  meta?: React.ReactNode
  footer?: React.ReactNode
  horizontal?: boolean
}

export const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  function GradientCard(
    {
      className,
      tone,
      badgeText,
      glyph: Glyph,
      title,
      description,
      ctaText,
      onActivate,
      meta,
      footer,
      horizontal = false,
      ...props
    },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <div className={cn(cardVariants({ tone }), className)} {...props}>
          {/* Ornament. aria-hidden because the category it stands for is already
              written out in the badge beside it. */}
          <Glyph
            aria-hidden="true"
            strokeWidth={1}
            className="pointer-events-none absolute -bottom-10 -right-8 h-52 w-52 text-gray-900/[0.06] transition-transform duration-500 group-hover/card:-translate-y-2 group-hover/card:rotate-3 dark:text-gh-text/[0.05]"
          />

          <div
            className={cn(
              "relative flex h-full flex-col",
              horizontal && "lg:flex-row lg:items-center lg:gap-12",
            )}
          >
            {/* flex-1 so the CTA row is pushed to the bottom of the card
                rather than sitting directly under the description. Without it,
                cards in the same row end their CTAs at different heights
                whenever their descriptions differ in length. */}
            <div className={cn("flex-1", horizontal && "lg:flex-none")}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 backdrop-blur-sm dark:border-gh-border dark:bg-gh-bg/50 dark:text-gh-muted">
                <Glyph
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-gh-accent-light dark:text-gh-accent"
                />
                {badgeText}
              </span>

              <h3
                className={cn(
                  "mt-5 text-balance font-extrabold leading-[1.1] tracking-[-0.02em]",
                  horizontal
                    ? "text-[clamp(26px,3vw,38px)]"
                    : "text-[clamp(22px,2vw,28px)]",
                )}
              >
                {title}
              </h3>

              {meta}

              <p className="mt-4 max-w-[52ch] text-pretty leading-relaxed text-gray-600 dark:text-gh-muted">
                {description}
              </p>
            </div>

            <div
              className={cn(
                "mt-8 flex items-center justify-between gap-4",
                horizontal && "lg:mt-0 lg:flex-col lg:items-start",
              )}
            >
              <button
                type="button"
                onClick={onActivate}
                className="group/cta inline-flex items-center gap-2 rounded-full text-sm font-semibold text-gray-900 transition-colors hover:text-gh-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:text-gh-text dark:hover:text-gh-accent dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-surface"
              >
                {/* Stretched over the whole card so the entire surface is the
                    hit target, while the accessibility tree still sees one
                    button with a real label. */}
                <span className="absolute inset-0" aria-hidden="true" />
                {ctaText}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </button>
              {footer}
            </div>
          </div>
        </div>
      </motion.div>
    )
  },
)

export { cardVariants }
