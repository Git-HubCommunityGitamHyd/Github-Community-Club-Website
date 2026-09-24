"use client"

import { useEffect, useRef, type RefObject } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { ArrowRight } from "lucide-react"
import { ButtonColorful } from "@/components/ui/button-colorful"
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

export function HeroSection({
  heroSlotRef,
  onScrollTo,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  onScrollTo: (sectionId: string) => void
}) {
  return (
    <section id="hero" className="relative overflow-hidden">
      <HeroTexture />
      <ContributionGrid />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-20 pt-32 sm:px-6 md:grid-cols-12 md:pb-24 md:pt-40 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="md:col-span-7"
        >
          <motion.h1
            variants={ENTRY}
            transition={{ duration: 0.7 }}
            className="text-balance text-[clamp(56px,7.2vw,104px)] font-extrabold leading-[0.95] tracking-[-0.045em]"
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
            <span className="text-gh-accent">.</span>
          </motion.h1>

          {/* The old line was "Empowering developers, fostering collaboration,
              and building the future of open source" — three abstractions and
              no claim a reader can picture. This says what actually happens. */}
          <motion.p
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mt-8 max-w-[52ch] text-pretty text-lg leading-relaxed text-gh-muted"
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
            <ButtonColorful
              type="button"
              label="Join the community"
              onClick={() => onScrollTo("join")}
            />
            <button
              type="button"
              onClick={() => onScrollTo("journey")}
              className="group -my-3 inline-flex items-center gap-1.5 py-3 text-[15px] font-semibold text-gh-muted underline-offset-[6px] transition-colors duration-200 hover:text-gh-text hover:underline"
            >
              Read our story
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </motion.div>
        </motion.div>

        {/* Where the big mascot rests. HomeMascot measures this and animates
            toward the pill's slot as you scroll. Aspect ratio must stay 1.25
            to match the nav slot — the dock scale is derived from height
            alone, so a mismatch stretches the model on the way down. */}
        {/* Hidden below md with its slot: there is no mascot on phones, and
            an empty grid row would only add a gap under the buttons. */}
        <div className="relative hidden md:col-span-5 md:block">
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
        className="pointer-events-none absolute inset-0 opacity-40 opacity-[0.55]"
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
 * A contribution graph, bled off the right edge of the hero as atmosphere.
 *
 * The right half of the hero was a mascot floating in empty space. This fills
 * it with the one motif that belongs here without claiming anything: it is
 * `aria-hidden`, carries no caption and no number, so it reads as GitHub's
 * texture rather than as a statistic the club would have to stand behind.
 *
 * It used to read as a carpet the mascot was standing on, and the mask was the
 * reason. It ran `transparent 16%, black 76%` from the centre out, which
 * clears a hole behind the mascot but puts the cells at *full strength exactly
 * where the grid ends*. A bounded rectangle at full strength, centred on the
 * subject, is a rug. The mask now falls off outward from the right edge
 * instead: one ellipse anchored at `100% 50%`, opaque where it leaves the
 * screen and gone before it reaches the headline. A field that fades to
 * nothing has no boundary to read as an object.
 *
 * It is also no longer centred on the mascot. It hangs off the section rather
 * than the mascot's column, overhanging right, top and bottom so it is never
 * seen whole, and fades leftward toward the copy. That is the same treatment
 * the join band gives this same motif, which is why that one never looked like
 * a mat, and it makes the two bookend the page on purpose.
 *
 * The pattern is a hash of the cell index, not `Math.random()` — this renders
 * on the server as well as the client, and a random fill would produce a
 * different grid in each and throw a hydration mismatch.
 *
 * It used to stagger in once and then sit frozen for the rest of the visit,
 * which is the worst of both: an animation nobody who lands mid-page ever
 * sees, and a dead texture for everybody else. Every cell breathes on its own
 * delay and duration, derived from the same hash, so the field twinkles
 * unevenly the way a real contribution graph fills rather than pulsing in
 * unison.
 *
 * It is drawn on one canvas. It used to be 600 `<span>`s, each running its own
 * CSS keyframe with `will-change` set, which is 600 compositor layers and 600
 * animations ticked at the display's refresh rate, forever, whether the hero
 * was on screen or not. Measured, pausing them alone took about a third of a
 * CPU core off the page. The canvas redraws the same field at 24fps, which is
 * indistinguishable for a 5-to-9-second breathing cycle, and stops entirely
 * once the hero scrolls out of view. It also stops invalidating the navbar's
 * glass, which has to re-run its filter every time something under it
 * changes.
 */
/*
 * Bigger cells rather than more of them: covering the whole hero at the old
 * 25px pitch would have taken about 900 cells. The join band already runs
 * this motif at a 64px cell, so a larger square here is within the vocabulary
 * rather than a new one.
 */
const COLUMNS = 30
const ROWS = 20
const CELL = 26
const GAP = 9

/** Canvas redraw rate. The slowest visible change is a 5.5s breathing cycle. */
const GRID_FPS = 24

const GRID_W = COLUMNS * CELL + (COLUMNS - 1) * GAP
const GRID_H = ROWS * CELL + (ROWS - 1) * GAP

type GridCell = {
  x: number
  y: number
  /** Alpha of the cell's colour before the breathing multiplies it. */
  alpha: number
  green: boolean
  /** Seconds into its own cycle at t=0, and the cycle's length. */
  offset: number
  duration: number
}

/**
 * Same hash, same pattern, same cells as the DOM version. `gridAutoFlow:
 * column` filled columns first, so index -> (column, row) is divmod by ROWS,
 * and keeping that mapping is what keeps the field looking identical.
 */
const GRID_CELLS: GridCell[] = Array.from(
  { length: COLUMNS * ROWS },
  (_, index) => {
    const hash = (index * 2654435761) % 4294967296
    const unit = hash / 4294967296
    const level = Math.floor(unit * 5)
    return {
      x: Math.floor(index / ROWS) * (CELL + GAP),
      y: (index % ROWS) * (CELL + GAP),
      alpha: level === 0 ? 0.11 : 0.09 + level * 0.1,
      green: level !== 0,
      offset: unit * 7,
      duration: 5.5 + unit * 4,
    }
  },
  // Grey first, then green, so the fill colour changes once per frame
  // rather than on most cells.
).sort((a, b) => Number(a.green) - Number(b.green))

function ContributionGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Capped at 1.5. These are soft, low-alpha squares under a mask, and the
    // backing store is width x height x dpr^2 x 4 bytes: at 2x it is 11.5MB
    // for decoration, at 1.5x it is 6.5MB and looks the same.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(GRID_W * dpr)
    canvas.height = Math.round(GRID_H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // `breathe` 0..1 follows the old keyframe: 0.45 opacity and 0.9 scale at
    // the ends of the cycle, full at the middle. A cosine is the old
    // ease-in-out segments to within what a 24fps redraw can show.
    const draw = (seconds: number | null) => {
      ctx.clearRect(0, 0, GRID_W, GRID_H)
      let green: boolean | null = null
      for (const cell of GRID_CELLS) {
        if (cell.green !== green) {
          green = cell.green
          ctx.fillStyle = green ? "rgb(63,185,80)" : "rgb(140,149,159)"
        }
        // Reduced motion matches what `animation: none` left behind: every
        // cell at rest at full opacity and full size.
        const breathe =
          seconds === null
            ? 1
            : 0.5 -
              0.5 *
                Math.cos(
                  (2 * Math.PI * (seconds + cell.offset)) / cell.duration,
                )
        const size = CELL * (0.9 + 0.1 * breathe)
        const inset = (CELL - size) / 2
        ctx.globalAlpha = cell.alpha * (0.45 + 0.55 * breathe)
        ctx.beginPath()
        ctx.roundRect(cell.x + inset, cell.y + inset, size, size, 4)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    if (reducedMotion) {
      draw(null)
      return
    }

    let frame = 0
    let last = -Infinity
    let running = false
    const start = performance.now()

    const loop = (now: number) => {
      if (now - last >= 1000 / GRID_FPS) {
        last = now
        draw((now - start) / 1000)
      }
      frame = requestAnimationFrame(loop)
    }

    // Only while the hero is on screen. The DOM version had no way to stop:
    // CSS animations on a scrolled-away element keep ticking.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true
        frame = requestAnimationFrame(loop)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(frame)
      }
    })
    observer.observe(canvas)
    draw(0)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  // Anchored at the right edge and overhanging it, so the grid's own right,
  // top and bottom boundaries are all off-screen. `overflow-hidden` on the
  // section does the clipping.
  // The opaque core has to reach well across the grid before it falls away.
  // A tighter core put the falloff on screen at the mascot and left the right
  // half of the hero looking empty again, which is the problem the graph was
  // added to solve.
  const MASK =
    "radial-gradient(ellipse 112% 94% at 100% 50%, black 0%, black 46%, transparent 93%)"

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 md:block"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ maskImage: MASK, WebkitMaskImage: MASK }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: GRID_W, height: GRID_H }}
        />
      </motion.div>
    </div>
  )
}
