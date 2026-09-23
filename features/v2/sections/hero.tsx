"use client"

import type { RefObject } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { CanvasText } from "@/components/ui/canvas-text"

const ENTRY = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

/**
 * The ramp that travels down "Community". The demo's ten steps of one blue
 * fade the phrase out at the bottom, which is fine over a light page but
 * disappears against #0d1117. This holds full strength for the first half and
 * only then falls away, and it moves from the light-mode accent to the
 * dark-mode one so the word reads as lit rather than as fading.
 */
const SCAN_COLORS = [
  "rgba(126,231,135,1)",
  "rgba(86,211,100,1)",
  "rgba(63,185,80,1)",
  "rgba(63,185,80,0.92)",
  "rgba(46,160,67,0.84)",
  "rgba(46,160,67,0.7)",
  "rgba(35,134,54,0.56)",
  "rgba(35,134,54,0.42)",
]

export function V2HeroSection({
  heroSlotRef,
  onScrollTo,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  onScrollTo: (sectionId: string) => void
}) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <HeroTexture />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-24 pt-40 sm:px-6 md:grid-cols-12 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="md:col-span-7"
        >
          <motion.h1
            variants={ENTRY}
            transition={{ duration: 0.7 }}
            className="text-balance text-[clamp(44px,7.2vw,104px)] font-extrabold leading-[0.95] tracking-[-0.045em]"
          >
            GitHub
            <br />
            {/* No plate behind the word. A tinted box around one phrase of a
                headline reads as a highlighter mark, and it boxed in the only
                part of the hero that was supposed to feel open. The scan-line
                fill carries the emphasis on its own. */}
            <CanvasText
              text="Community"
              colors={SCAN_COLORS}
              lineGap={5}
              lineHeight={4}
              animationDuration={14}
            />
            <span className="text-gh-accent-light dark:text-gh-accent">.</span>
          </motion.h1>

          {/* The old line was "Empowering developers, fostering collaboration,
              and building the future of open source" — three abstractions and
              no claim a reader can picture. This says what actually happens. */}
          <motion.p
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mt-8 max-w-[52ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted"
          >
            A student community at GITAM University that learns Git in public,
            maintains real repositories together, and gets first pull requests
            merged.
          </motion.p>

          {/* One filled button and one text link, rather than the filled +
              ghost pair. A ghost button reads as a second primary action and
              makes the reader choose; a link does not compete. */}
          <motion.div
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <button
              type="button"
              onClick={() => onScrollTo("join")}
              className="group inline-flex items-center gap-2 rounded-full bg-gh-accent-light px-7 py-3.5 text-[15px] font-semibold text-white transition duration-200 hover:opacity-90 active:scale-[0.98] dark:bg-gh-accent dark:text-gh-deep"
            >
              Join the community
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
            <button
              type="button"
              onClick={() => onScrollTo("journey")}
              className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-gray-700 underline-offset-[6px] transition-colors duration-200 hover:text-gray-900 hover:underline dark:text-gh-muted dark:hover:text-gh-text"
            >
              Read our story
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </motion.div>
        </motion.div>

        {/* Where the big mascot rests. V2Mascot measures this and animates
            toward the pill's slot as you scroll. Aspect ratio must stay 1.25
            to match the nav slot — the dock scale is derived from height
            alone, so a mismatch stretches the model on the way down. */}
        <div className="relative md:col-span-5">
          <ContributionGrid />
          <div
            ref={heroSlotRef}
            className="pointer-events-none relative z-10 mx-auto hidden h-[240px] w-[300px] md:block lg:h-[300px] lg:w-[375px]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}

/**
 * Texture, which the hero had none of: it was type on flat colour with one
 * radial glow, and read as unfinished at large sizes.
 *
 * A dot grid at ~3% opacity, masked so it fades out before it reaches the
 * headline, plus the original green plate behind the mascot. Both are painted
 * with gradients rather than an image, so there is nothing to download and
 * nothing to go blurry on a high-density screen.
 */
function HeroTexture() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
          color: "rgba(140,149,159,0.35)",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 70% 30%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 70% 30%, black 0%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden h-[560px] w-[720px] md:block"
        style={{
          background:
            "radial-gradient(ellipse at 62% 42%, rgba(63,185,80,0.10) 0%, rgba(63,185,80,0.04) 38%, rgba(63,185,80,0) 68%)",
        }}
      />
    </>
  )
}

/**
 * A contribution graph, sat behind the mascot as texture.
 *
 * The right half of the hero was a mascot floating in empty space. This fills
 * it with the one motif that belongs here without claiming anything: it is
 * `aria-hidden`, carries no caption and no number, so it reads as GitHub's
 * texture rather than as a statistic the club would have to stand behind.
 *
 * The pattern is a hash of the cell index, not `Math.random()` — this renders
 * on the server as well as the client, and a random fill would produce a
 * different grid in each and throw a hydration mismatch.
 *
 * It used to stagger in once and then sit frozen for the rest of the visit,
 * which is the worst of both: an animation nobody who lands mid-page ever
 * sees, and a dead texture for everybody else. Every cell now breathes on its
 * own CSS keyframe (`contribution-cell` in globals.css), with the delay
 * derived from the same hash so the field twinkles unevenly the way a real
 * contribution graph fills rather than pulsing in unison. It is pure CSS —
 * 450 cells on a framer-motion value each would cost a JavaScript frame
 * budget for something that is decoration.
 */
const COLUMNS = 30
const ROWS = 15
const CELL = 18
const GAP = 7

function ContributionGrid() {
  const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const hash = (index * 2654435761) % 4294967296
    const unit = hash / 4294967296
    return {
      level: Math.floor(unit * 5),
      // Negative delay starts each cell part-way through its own cycle, so
      // the field is already alive on the first painted frame instead of
      // every cell beginning together.
      delay: -(unit * 7).toFixed(2),
      duration: (5.5 + unit * 4).toFixed(2),
    }
  })

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="grid"
        style={{
          gap: `${GAP}px`,
          gridTemplateColumns: `repeat(${COLUMNS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          gridAutoFlow: "column",
          maskImage:
            "radial-gradient(ellipse 62% 62% at 50% 50%, transparent 16%, black 76%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 62% at 50% 50%, transparent 16%, black 76%)",
        }}
      >
        {cells.map((cell, index) => (
          <span
            key={index}
            className="contribution-cell rounded-[4px]"
            style={{
              animationDelay: `${cell.delay}s`,
              animationDuration: `${cell.duration}s`,
              backgroundColor:
                cell.level === 0
                  ? "rgba(140,149,159,0.13)"
                  : `rgba(63,185,80,${0.1 + cell.level * 0.11})`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
