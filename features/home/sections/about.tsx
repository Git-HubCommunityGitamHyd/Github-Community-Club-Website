"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  GitPullRequestArrow,
  MapPin,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { FaGithub } from "react-icons/fa6"
import { CountingNumber } from "@/components/ui/counting-number"
import { PILLARS } from "@/features/about/pillars"
import { TerminalTile } from "@/features/about/terminal-tile"
import { ToolMarquee } from "@/features/about/tool-marquee"
import { SectionLabel } from "@/features/site/section-label"
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
const QUIET_TILE = "border border-gh-border bg-gh-surface"

export function AboutSection({
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
        <p className="mb-14 max-w-[56ch] text-pretty text-lg leading-relaxed text-gh-muted">
          Two things share one name. The community group is open to any student
          at GITAM and always will be. The club is the smaller team that runs
          it, and it recruits in rounds.
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
              <span className="inline-flex rounded-full bg-gh-accent px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gh-deep">
                {openSource.title}
              </span>
              <h3 className="mt-7 text-balance text-[clamp(30px,3.4vw,46px)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em]">
                We build
                <br />
                in the open.
              </h3>
            </div>

            <p className="relative z-10 mt-12 max-w-[34ch] text-pretty text-lg leading-relaxed text-gh-muted">
              {openSource.desc}, in public repositories reviewed by the people
              sitting next to you.
            </p>
          </motion.article>

          {/* The one loud tile on the page, and the largest number. */}
          <motion.article
            variants={ENTRY}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${CARD} group col-span-2 flex flex-col justify-between bg-gh-accent text-gh-deep md:col-span-3`}
          >
            {/* Drawn in the tile's own text colour rather than a grey, so it
                stays a shade of the green instead of putting a third value on
                an accent surface. */}
            <Users
              aria-hidden="true"
              strokeWidth={1.1}
              className="pointer-events-none absolute -right-6 -top-8 h-44 w-44 origin-top-right text-current opacity-[0.13] transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />

            <span className="relative font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
              {community.title}
            </span>
            <div className="relative mt-8 space-y-3">
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
              <div className="h-1.5 w-full rounded-full bg-gh-deep/20">
                {/* The bar fills with the count rather than being painted in at
                  four fifths, so the figure and its bar tell one story. */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={counting ? { scaleX: 0.8 } : { scaleX: 0 }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full origin-left rounded-full bg-gh-deep"
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
            // Odd one out on the two-column phone grid: full width there
            // rather than half a row with a hole beside it.
            className="col-span-2 md:col-span-1"
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
            className={`${CARD} ${QUIET_TILE} group col-span-2 flex items-center justify-between gap-6 transition-colors hover:border-gh-muted md:col-span-3`}
          >
            {/* Opacity on the element, not alpha in the stroke colour. A lucide
                  glyph is several overlapping sub-paths - git-branch runs its
                  line straight through the circle it joins - and a
                  semi-transparent *stroke* paints each one separately, so the
                  alpha compounds where they cross and you see a darker line
                  drawn over the shape it connects to. Element opacity
                  composites the whole glyph first and makes that one result
                  transparent, so the joins are clean. */}
            {/* A pull request, because that is literally what the button asks
                for, and because the terminal tile diagonally opposite ends on
                "Opened pull request #218". */}
            <GitPullRequestArrow
              aria-hidden="true"
              strokeWidth={1.1}
              className="pointer-events-none absolute -bottom-8 -right-4 h-44 w-44 origin-bottom-right text-gh-text opacity-[0.05] transition-[transform,color,opacity] duration-700 ease-out group-hover:scale-[1.1] group-hover:text-gh-accent group-hover:opacity-25"
            />

            <div className="relative">
              <h3 className="text-2xl font-extrabold uppercase tracking-[-0.02em]">
                Start contributing
              </h3>
              <p className="mt-2 text-pretty text-gh-muted">
                The community group is open now. Club applications run in rounds
                and include an interview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onScrollTo("join")}
              aria-label="Start contributing: go to the join form"
              className="flex size-16 shrink-0 items-center justify-center rounded-full border border-gh-border text-gh-text transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface group-hover:border-transparent group-hover:bg-gh-accent group-hover:text-gh-deep"
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
  className = "",
}: {
  icon: LucideIcon
  value: number
  from?: number
  suffix?: string
  /** Years are not quantities, so they opt out of thousands grouping. */
  format?: (value: number) => string
  label: string
  counting: boolean
  className?: string
}) {
  return (
    <motion.article
      variants={ENTRY}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${QUIET_TILE} group relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-6 ${className}`}
    >
      {/* The tile's own glyph again, oversized and nearly invisible. These
          three were a small icon, a number and a label in a box with most of
          its area empty, next to a feature tile carrying a 28rem Invertocat -
          the emptiness read as unfinished rather than as restraint. Echoing
          the glyph gives each tile a shape without adding anything to read,
          and using the tile's *own* icon keeps the three told apart. */}
      <Icon
        aria-hidden="true"
        strokeWidth={1.1}
        className="pointer-events-none absolute -bottom-7 -right-6 h-36 w-36 origin-bottom-right text-gh-text opacity-[0.055] transition-[transform,color,opacity] duration-700 ease-out group-hover:scale-[1.12] group-hover:text-gh-accent group-hover:opacity-25"
      />

      <Icon
        aria-hidden="true"
        className="relative h-5 w-5 text-gh-accent"
        strokeWidth={2}
      />
      <div className="relative">
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
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
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
      className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] origin-bottom-right text-gh-text/[0.045] transition-[transform,color] ease-out [transition-duration:1200ms] group-hover:scale-[1.18] group-hover:text-gh-text/[0.08]"
    />
  )
}
