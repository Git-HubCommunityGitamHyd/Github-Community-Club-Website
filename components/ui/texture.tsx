"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * Background texture for the long middle of the page.
 *
 * Everything from About through Benefits was flat colour. Each section was
 * well composed on its own and the page still read as unfinished, because
 * nothing sat *behind* the content.
 *
 * The first attempt was graph paper: crossed hairlines on a 52px pitch. It
 * fixed the flatness and said nothing. A ruled grid is the background of a
 * thousand developer landing pages, and behind a bento grid of rectangular
 * tiles it read as a second set of boxes behind the first set.
 *
 * It is a doodle field now: git branches, merges, pull requests, terminals,
 * braces, forks and the occasional octocat. Same job, and it is about
 * something. The marks come from the same icon libraries the rest of the site
 * uses, composed into one seamless tile by scripts/build-doodle-pattern.mjs.
 *
 * The second attempt got the scale wrong in the other direction: 22 marks at
 * 22-36px across a 540px tile, large enough and far enough apart to be read
 * individually, so the background competed with the foreground. The reference
 * that fixed it is the grip texture on a game controller - many small symbols,
 * packed tight, at almost no contrast. Small and dense reads as material;
 * large and sparse reads as decoration, and decoration argues with content.
 *
 * The field also used to fade out at the top and bottom of every section, and
 * each section started its tile at its own top edge. Together that made each
 * section look like a separate swatch rather than one surface the whole page
 * sits on. It now runs edge to edge, phase-aligned across boundaries.
 */

const DOODLE_URL = "/patterns/github-doodles.svg"

/** Tile edge, in px. Must match TILE in scripts/build-doodle-pattern.mjs. */
const DOODLE_TILE = 306

/**
 * How much slower than the page the field travels, as a fraction.
 *
 * This is the one layer on the page that earns parallax: its entire job is to
 * sit behind the content, so moving it slower than the content is the literal
 * thing parallax is for. Nothing else gets it. The mascot already owns moving
 * independently down the page, Lenis is already easing the scroll (parallax on
 * top of eased scroll compounds the lag and reads sluggish rather than deep),
 * and the benefits stack and journey rail are pinned, which parallax layers
 * fight.
 */
const DOODLE_DRIFT = 0.12

export function DoodleField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  /**
   * Where this section starts within the tile grid, in px.
   *
   * Each section paints its own copy of the field. Left alone each copy starts
   * its tile at its own top edge and the pattern restarts at every boundary.
   * Offsetting the mask by the section's position in the document makes every
   * copy a window onto one grid that runs the whole page.
   */
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      setPhase(((top % DOODLE_TILE) + DOODLE_TILE) % DOODLE_TILE)
    }

    measure()
    // Sections change height as images load and as `whileInView` content
    // settles, which moves every section below them onto a different phase.
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  // Driven by the window's scroll, not this element's progress through the
  // viewport. A per-section progress gives each section its own phase of
  // movement, so adjacent fields drift apart at the boundary and the seam
  // becomes visible the moment you scroll. One global value keeps every
  // section in lockstep.
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, (value) => {
    // Wrapped into one tile. The pattern is periodic with period DOODLE_TILE,
    // so translating by a whole tile is indistinguishable from translating by
    // nothing: the wrap is invisible and the offset stays bounded instead of
    // growing with the length of the page.
    const drift = (value * DOODLE_DRIFT) % DOODLE_TILE
    return drift < 0 ? drift + DOODLE_TILE : drift
  })

  return (
    // `overflow-hidden` clips the overhang below. It is safe despite the
    // sticky gotcha in CLAUDE.md because nothing sticky lives in this
    // subtree - it holds one decorative div.
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* The doodles are painted by masking a flat `currentColor` fill with
          the SVG rather than loading it as a background image. A background
          image carries its own colours; a mask carries only alpha, so the
          colour is a Tailwind text utility and the asset stays one file. */}
      <motion.div
        className="absolute inset-x-0 text-[rgba(240,246,252,0.05)]"
        style={{
          // A full tile of overhang on each side, because the drift above
          // travels up to a full tile. Any less and the translate exposes an
          // uncovered strip at one edge of the section.
          top: -DOODLE_TILE,
          bottom: -DOODLE_TILE,
          y: reducedMotion ? 0 : y,
          backgroundColor: "currentColor",
          maskImage: `url(${DOODLE_URL})`,
          WebkitMaskImage: `url(${DOODLE_URL})`,
          maskSize: `${DOODLE_TILE}px ${DOODLE_TILE}px`,
          WebkitMaskSize: `${DOODLE_TILE}px ${DOODLE_TILE}px`,
          maskRepeat: "repeat",
          WebkitMaskRepeat: "repeat",
          maskPosition: `0px ${-phase}px`,
          WebkitMaskPosition: `0px ${-phase}px`,
        }}
      />
    </div>
  )
}

/**
 * Two hairlines down the edges of the content container.
 *
 * Kept from the graph-paper version, because it was never the part that read
 * as a grid: it says the content sits inside a measured column, which is what
 * stops a scattered field behind it from looking like wallpaper. It has to use
 * the same max-width as the section it is placed in, hence the prop.
 */
export function ContainerRules({
  className,
  width = "max-w-6xl",
}: {
  className?: string
  /** Must match the section's own container width. */
  width?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div
        className={cn(
          "mx-auto h-full border-x border-gh-border/60 px-4 sm:px-6 lg:px-8",
          width,
        )}
      />
    </div>
  )
}

/**
 * A hatched band, used where two sections meet.
 *
 * The seams were bare 1px borders, which is the weakest possible transition:
 * two flat colours butted together. A short hatched strip gives the page a
 * join that looks deliberate, and it is the one place a repeating diagonal is
 * welcome, because a seam is exactly the thing it is describing.
 *
 * Deliberately short (32px). At any real height it stops being a seam and
 * becomes a section of its own.
 */
export function HatchBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-8 w-full border-y border-gh-border text-[rgba(240,246,252,0.09)]",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)",
      }}
    />
  )
}

/**
 * The doodle field plus the container rules, which is how they are always used
 * together. Sections render this as their first child and everything else
 * above it.
 */
export function SectionTexture({
  className,
  width,
}: {
  className?: string
  width?: string
}) {
  return (
    <>
      <DoodleField className={className} />
      <ContainerRules width={width} />
    </>
  )
}
