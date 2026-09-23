"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, CalendarCheck, CalendarDays, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { FaGithub } from "react-icons/fa6"
import { CountingNumber } from "@/components/ui/counting-number"
import { PILLARS } from "@/features/home/content"
import { TerminalTile } from "@/features/v2/about/terminal-tile"
import { ToolMarquee } from "@/features/v2/about/tool-marquee"
import { SectionLabel } from "@/features/v2/section-label"
import { SectionTexture } from "@/components/ui/texture"

/**
 * The about bento.
 *
 * The reference is built on violet and emerald with a violet CTA — a
 * two-accent scheme that would be the loudest thing on a page whose entire
 * palette is neutral surfaces plus one GitHub green. The colour is spent once
 * instead, on the members tile. The wide CTA is deliberately quiet: the join
 * section further down already carries the loud call to action, and two
 * competing CTAs on one page means neither reads as the primary one.
 *
 * The numbers used to live in a separate full-width strip directly above this
 * section — four figures on their own band of background, immediately followed
 * by a grid of tiles. Two adjacent modules doing the same job, and the strip
 * was the weaker one: an unbroken row of four gives every figure identical
 * weight, which is exactly what a bento is for avoiding. They are tiles here
 * now, so the membership count can be the loud one and the founding year can
 * be small, and the grid reads as a grid instead of a row plus a grid.
 *
 * The three tiles that are not numbers or the CTA are the club's three
 * pillars, so this also replaces the old flat three-column pillar strip rather
 * than sitting next to a duplicate of it.
 */

const ENTRY = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const CARD = "relative overflow-hidden rounded-2xl p-8 sm:p-10"
const QUIET_TILE =
  "border border-gray-200 bg-white dark:border-gh-border dark:bg-gh-surface"

export function V2AboutSection({
  onScrollTo,
}: {
  onScrollTo: (sectionId: string) => void
}) {
  const [openSource, community, innovation] = PILLARS

  const gridRef = useRef<HTMLDivElement>(null)
  // One `inView` for every counter in the bento, so they all start together
  // rather than each tile counting as it individually crosses the line. `once`
  // because a number that re-rolls on the way back up reads as a glitch.
  const counting = useInView(gridRef, {
    once: true,
    margin: "-15% 0px -15% 0px",
  })

  return (
    <section id="about" className="relative">
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="01">About</SectionLabel>
        <h2 className="mb-5 mt-5 max-w-3xl text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          A community of builders, designers and open-source contributors.
        </h2>
        <p className="mb-14 max-w-[56ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
          We are students at GITAM University who learn in public — running
          workshops, maintaining repositories together, and getting each
          other&apos;s first pull requests merged.
        </p>

        <motion.div
          ref={gridRef}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.07 }}
          className="grid grid-cols-2 gap-5 md:grid-cols-6"
        >
          {/* Feature tile — half the grid, two rows tall. */}
          <motion.article
            variants={ENTRY}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${CARD} ${QUIET_TILE} group col-span-2 flex flex-col justify-between md:col-span-3 md:row-span-2`}
          >
            <Ornament />

            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-gray-900 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white dark:bg-gh-accent dark:text-gh-deep">
                {openSource.title}
              </span>
              <h3 className="mt-7 text-balance text-[clamp(30px,3.4vw,46px)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em]">
                We build
                <br />
                in the open.
              </h3>
            </div>

            <p className="relative z-10 mt-12 max-w-[34ch] text-pretty text-lg leading-relaxed text-gray-500 dark:text-gh-muted">
              {openSource.desc} — in public repositories, reviewed by the people
              sitting next to you.
            </p>
          </motion.article>

          {/* The one loud tile on the page, and the largest number. */}
          <motion.article
            variants={ENTRY}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${CARD} col-span-2 flex flex-col justify-between bg-gh-accent-light text-white dark:bg-gh-accent dark:text-gh-deep md:col-span-3`}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
              {community.title}
            </span>
            <div className="mt-8 space-y-3">
              <span
                className="block text-6xl font-extrabold tabular-nums tracking-[-0.04em]"
                aria-label="700+ members"
              >
                <span aria-hidden="true">
                  <CountingNumber
                    target={700}
                    autoStart={counting}
                    transition={COUNT}
                  />
                  +
                </span>
              </span>
              <div className="h-1.5 w-full rounded-full bg-white/25 dark:bg-gh-deep/20">
                {/* The bar fills with the count rather than being painted in at
                  four fifths, so the figure and its bar tell one story. */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={counting ? { scaleX: 0.8 } : { scaleX: 0 }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full origin-left rounded-full bg-white dark:bg-gh-deep"
                />
              </div>
              <p className="text-sm font-medium opacity-80">
                members across three campuses
              </p>
            </div>
          </motion.article>

          {/* Three small figures, under the loud one. */}
          <StatTile
            icon={CalendarDays}
            value={2022}
            from={2018}
            format={String}
            label="Founded"
            counting={counting}
          />
          <StatTile
            icon={CalendarCheck}
            value={30}
            suffix="+"
            label="Events hosted"
            counting={counting}
          />
          <StatTile
            icon={MapPin}
            value={3}
            label="Campuses"
            counting={counting}
          />

          {/* Dark tile — a terminal, so the one dark panel in a light bento has
            a reason to be dark rather than reading as a stray section. */}
          <motion.article
            variants={ENTRY}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${CARD} col-span-2 bg-gh-deep text-white md:col-span-3`}
          >
            {/* A faint scanline wash, only here. It is the one place on the
              page where a CRT reference reads as the subject rather than as
              decoration. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.55]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
              }}
            />
            <TerminalTile label={innovation.title} />
          </motion.article>

          {/* Wide tile. */}
          <motion.article
            variants={ENTRY}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${CARD} ${QUIET_TILE} group col-span-2 flex items-center justify-between gap-6 transition-colors hover:border-gray-300 dark:hover:border-gh-muted md:col-span-3`}
          >
            <div>
              <h3 className="text-2xl font-extrabold uppercase tracking-[-0.02em]">
                Start contributing
              </h3>
              <p className="mt-2 text-pretty text-gray-600 dark:text-gh-muted">
                No experience required. The next workshop takes you from install
                to merged.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onScrollTo("join")}
              aria-label="Start contributing — go to the join form"
              className="flex size-16 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-900 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-2 group-hover:border-transparent group-hover:bg-gh-accent-light group-hover:text-white dark:border-gh-border dark:text-gh-text dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-surface dark:group-hover:bg-gh-accent dark:group-hover:text-gh-deep"
            >
              <span
                className="absolute inset-0 rounded-2xl"
                aria-hidden="true"
              />
              <ArrowRight
                aria-hidden="true"
                className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </motion.article>
        </motion.div>

        <div className="mt-16">
          <ToolMarquee />
        </div>
      </div>
    </section>
  )
}

const COUNT = {
  duration: 1.8,
  ease: [0.16, 1, 0.3, 1],
  type: "tween",
} as const

/**
 * One of the three small figures. Tighter padding than the big tiles — a
 * single number in a tile padded like a paragraph floats in the middle of
 * nothing.
 */
function StatTile({
  icon: Icon,
  value,
  from,
  suffix,
  format,
  label,
  counting,
}: {
  icon: LucideIcon
  value: number
  from?: number
  suffix?: string
  /** Years are not quantities, so they opt out of thousands grouping. */
  format?: (value: number) => string
  label: string
  counting: boolean
}) {
  return (
    <motion.article
      variants={ENTRY}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${QUIET_TILE} relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-6`}
    >
      <Icon
        aria-hidden="true"
        className="h-5 w-5 text-gh-accent-light dark:text-gh-accent"
        strokeWidth={2}
      />
      <div>
        <span
          className="block text-[clamp(28px,3vw,40px)] font-extrabold leading-none tracking-[-0.04em]"
          aria-label={`${(format ?? ((v: number) => v.toLocaleString()))(value)}${suffix ?? ""}`}
        >
          <span aria-hidden="true">
            <CountingNumber
              from={from ?? 0}
              target={value}
              format={format}
              autoStart={counting}
              transition={COUNT}
            />
            {suffix}
          </span>
        </span>
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gh-muted">
          {label}
        </p>
      </div>
    </motion.article>
  )
}

/**
 * The reference rotates a star behind its feature tile. That is the Octocat's
 * job here instead.
 *
 * It is the vector Invertocat mark — the same one in the navbar and the footer
 * — rather than a second `<GhMascot3D>`. `useGLTF` caches one scene object
 * globally, and a Three.js object can only have one parent, so mounting the
 * model again would take it away from the hero and leave that slot empty. A
 * second WebGL context for an ornament in a card you scroll past is not a
 * trade worth making either.
 *
 * It does not rotate. A mark that turns reads as a loading spinner, and the
 * Invertocat has an obvious upright orientation, so tilting it just looks like
 * it came loose. It swells toward the reader and brightens instead, which is
 * what a hover is for.
 */
function Ornament() {
  return (
    <FaGithub
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] origin-bottom-right text-gray-900/[0.045] transition-[transform,color] ease-out [transition-duration:1200ms] group-hover:scale-[1.18] group-hover:text-gray-900/[0.075] dark:text-gh-text/[0.045] dark:group-hover:text-gh-text/[0.08]"
    />
  )
}
