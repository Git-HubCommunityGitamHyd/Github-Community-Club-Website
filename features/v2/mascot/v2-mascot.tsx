"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValue, useReducedMotion } from "framer-motion"
import { useTheme } from "@/components/theme/theme-provider"
import { MASCOT_DOCKS, DOCK_BLEND, type Dock } from "@/features/v2/mascot/docks"

const GhMascot3D = dynamic(
  () => import("@/components/mascot/gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

/** Scroll distance over which the mascot leaves the hero and takes up its first dock. */
const DOCK_SCROLL = 320

/** Cursor distance, in px, at which head/eye tracking hits full deflection. */
const POINTER_RANGE = 200

/**
 * Cursor distance beyond which the mascot stops tracking and looks around on
 * its own. Without this the pointer is almost always far off on one side —
 * the mascot lives at the edge of the page — so the tracking saturates and it
 * appears to stare permanently in one direction. Inside this radius the
 * pointer wins; outside it, the resting gaze does.
 */
const GAZE_FALLOFF = 620

/**
 * Hero and dock must share this aspect ratio or the shrink distorts — the
 * scale is derived from height alone.
 */
export const MASCOT_ASPECT = 1.25

/** Docked height. The nav pill's 44px was the problem; this is legible. */
const DOCK_HEIGHT = 116

/** Gap from the viewport edges when the mascot is resting. */
const DOCK_MARGIN = 26

/** How far it creeps inwards across a section, in px. Just enough to not be a rail. */
const DOCK_DRIFT = 20

/** How far the cursor can pull the mascot off its dock, in px. */
const LEASH = 58

/** Cursor distance at which the pull is at full strength. */
const LEASH_RANGE = 520

/** Per-frame follow rate. Low enough that it lopes after the cursor. */
const FOLLOW = 0.085

/** Per-frame rate at which the gaze catches up. Slower than the body. */
const GAZE_FOLLOW = 0.11

/** Duration of the settle after it lands in a new dock, in ms. */
const ARRIVAL_MS = 520

type Rect = { top: number; left: number; width: number; height: number }
type Point = { x: number; y: number }
type Placed = Dock & { top: number; height: number }

function documentRect(el: HTMLElement): Rect {
  let top = 0
  let left = 0
  let node: HTMLElement | null = el
  while (node) {
    top += node.offsetTop
    left += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }
  return { top, left, width: el.offsetWidth, height: el.offsetHeight }
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
/** Ease in and out, so a handover starts and ends at rest rather than at speed. */
const smoothstep = (n: number) => n * n * (3 - 2 * n)

/** Where the mascot's centre sits, `progress` of the way through `dock`. */
function dockPoint(dock: Placed, progress: number): Point {
  const width = DOCK_HEIGHT * MASCOT_ASPECT
  const inset = DOCK_MARGIN + width / 2 + DOCK_DRIFT * progress
  return {
    x: dock.side === "right" ? window.innerWidth - inset : inset,
    y: window.innerHeight * (dock.from + (dock.to - dock.from) * progress),
  }
}

/**
 * The octocat: rides in the hero, then docks section by section down the page.
 *
 * It used to shrink into a 55x44 slot inside the nav pill. At that size the
 * model is roughly 30px of actual cat, and in dark mode a black octocat on
 * #0d1117 at 30px is a smudge — you cannot tell it is a cat, let alone that it
 * is watching you. The 3D model, the eye tracking and the spin-on-click were
 * all still running, for something nobody could see.
 *
 * It then docked to a corner of the viewport at a legible size — better, but
 * the corner was chosen by which half of the screen the cursor was in, which
 * made its position a readout of the mouse rather than of the page. It now
 * takes a dock per section (see docks.ts): it arrives high on one side, drifts
 * down as you read through the section, then crosses to the opposite side for
 * the next one. Scrolling the page is what moves it, which is the point — it
 * accompanies you down rather than orbiting the cursor.
 *
 * The cursor still matters, but only up close. Within `LEASH_RANGE` it leans
 * toward the pointer, tethered so it never wanders over what you are reading;
 * within `GAZE_FALLOFF` it looks at it. Past that it looks inward, at the
 * content beside it, with a slow idle drift so it is never quite still.
 */
export function V2Mascot({
  heroSlotRef,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
}) {
  const { theme, toggle } = useTheme()
  const reducedMotion = useReducedMotion()

  const pointerRef = useRef({ x: 0, y: 0 })
  const spinRef = useRef(false)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const centreRef = useRef({ x: 0, y: 0 })
  const heroDocRectRef = useRef<Rect | null>(null)
  /** Smoothed centre, so the mascot lopes after its dock rather than snapping. */
  const easedRef = useRef<Point | null>(null)
  /** Smoothed gaze, so it turns its head rather than flicking it. */
  const gazeRef = useRef({ x: 0, y: 0 })
  /** Which side it is currently resting on — drives the resting gaze inward. */
  const sideRef = useRef<"right" | "left">("right")
  /** Docks with their sections' measured document positions. */
  const docksRef = useRef<Placed[]>([])
  /** Index of the dock it last settled into, and when — drives the landing beat. */
  const dockIndexRef = useRef(-1)
  const arrivedAtRef = useRef(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )

  useEffect(() => {
    /**
     * Resolve the dock target for the current scroll position, including the
     * crossover into the next section.
     */
    const resolveDock = (): Point | null => {
      const docks = docksRef.current
      if (docks.length === 0) return null

      // The line the docks are measured against: the middle of the viewport.
      // Using the top would hand a section its dock while it is still off
      // screen; using the bottom would hold the previous one too long.
      const line = window.scrollY + window.innerHeight / 2

      let index = 0
      for (let i = 0; i < docks.length; i += 1) {
        if (line >= docks[i].top) index = i
      }
      const dock = docks[index]
      const progress = clamp01((line - dock.top) / Math.max(1, dock.height))

      if (index !== dockIndexRef.current) {
        // Not on the very first resolve: landing beats are for arrivals the
        // reader watched happen, not for the state the page opened in.
        if (dockIndexRef.current !== -1)
          arrivedAtRef.current = performance.now()
        dockIndexRef.current = index
      }
      sideRef.current = dock.side

      const here = dockPoint(dock, progress)
      const next = docks[index + 1]
      if (!next || progress < 1 - DOCK_BLEND) return here

      const t = smoothstep((progress - (1 - DOCK_BLEND)) / DOCK_BLEND)
      const there = dockPoint(next, 0)
      return {
        x: here.x + (there.x - here.x) * t,
        y: here.y + (there.y - here.y) * t,
      }
    }

    /**
     * Gaze. Near the cursor it tracks; far from it, it looks in toward the
     * page and drifts, so it reads as alive rather than as saturated.
     */
    const syncGaze = (now: number) => {
      const m = mouseRef.current
      const centre = centreRef.current

      // Resting gaze: toward the content, which is whichever way the page is.
      const idle = reducedMotion ? 0 : 1
      let targetX =
        (sideRef.current === "right" ? -0.5 : 0.5) +
        Math.sin(now / 2100) * 0.14 * idle
      let targetY = Math.sin(now / 1450) * 0.2 * idle

      if (m) {
        const dx = m.x - centre.x
        const dy = m.y - centre.y
        const distance = Math.hypot(dx, dy)
        const near = clamp01(
          1 - (distance - POINTER_RANGE) / (GAZE_FALLOFF - POINTER_RANGE),
        )
        if (near > 0) {
          const cursorX = Math.max(-1, Math.min(1, dx / POINTER_RANGE))
          const cursorY = Math.max(-1, Math.min(1, dy / POINTER_RANGE))
          targetX += (cursorX - targetX) * near
          targetY += (cursorY - targetY) * near
        }
      }

      const gaze = gazeRef.current
      const rate = reducedMotion ? 1 : GAZE_FOLLOW
      gaze.x += (targetX - gaze.x) * rate
      gaze.y += (targetY - gaze.y) * rate
      pointerRef.current = { x: gaze.x, y: gaze.y }
    }

    const apply = () => {
      const heroDoc = heroDocRectRef.current
      if (!heroDoc || !heroDoc.height) return

      const now = performance.now()
      const p = Math.min(1, Math.max(0, window.scrollY / DOCK_SCROLL))

      const dockedScale = DOCK_HEIGHT / heroDoc.height
      const s = Math.max(dockedScale, 1 + (dockedScale - 1) * p)

      const dock = resolveDock()
      if (!dock) return

      // Pull toward the cursor, clamped to the leash, so it never wanders into
      // the middle of the page and never covers what is under the pointer.
      let dockCx = dock.x
      let dockCy = dock.y
      const m = mouseRef.current
      if (m && !reducedMotion) {
        const dx = m.x - dock.x
        const dy = m.y - dock.y
        const distance = Math.hypot(dx, dy) || 1
        const pull = Math.min(1, distance / LEASH_RANGE) * LEASH
        dockCx += (dx / distance) * pull
        dockCy += (dy / distance) * pull
      }

      const startCx = heroDoc.left + heroDoc.width / 2
      const startCy = heroDoc.top - window.scrollY + heroDoc.height / 2

      // Interpolate centres, not corners: the hero slot is larger than the
      // dock, so aligning corners would land it off-centre.
      const targetCx = startCx + (dockCx - startCx) * p
      const targetCy = startCy + (dockCy - startCy) * p

      const eased = easedRef.current ?? { x: targetCx, y: targetCy }
      // Only the docked follow is smoothed. Easing the hero-to-dock journey as
      // well would fight the scroll: the mascot would still be catching up
      // with where the page was a moment ago.
      const rate = reducedMotion ? 1 : FOLLOW + (1 - FOLLOW) * (1 - p)
      eased.x += (targetCx - eased.x) * rate
      eased.y += (targetCy - eased.y) * rate
      easedRef.current = eased

      // The landing beat: one decaying squash as it settles into a new dock,
      // so a crossover finishes with a visible full stop instead of just
      // ceasing to move.
      let settle = 1
      if (!reducedMotion && arrivedAtRef.current) {
        const a = clamp01((now - arrivedAtRef.current) / ARRIVAL_MS)
        if (a < 1) settle = 1 + Math.sin(Math.PI * a) * (1 - a) * 0.16
        else arrivedAtRef.current = 0
      }

      centreRef.current = { x: eased.x, y: eased.y }
      const drawn = s * settle
      x.set(eased.x - (heroDoc.width * drawn) / 2)
      y.set(eased.y - (heroDoc.height * drawn) / 2)
      scale.set(drawn)
      syncGaze(now)
    }

    const measure = () => {
      const heroEl = heroSlotRef.current
      if (!heroEl) return
      const rect = documentRect(heroEl)
      // The hero slot is hidden below md, so it measures 0x0 there. Guard, or
      // the scale ratio divides by zero.
      if (!rect.width || !rect.height) return
      heroDocRectRef.current = rect
      // Only when it actually changed. `measure` runs from a ResizeObserver on
      // the body, and setting a fresh object every time would re-render on
      // every observation — including the ones this component's own render
      // causes.
      setSize((current) =>
        current?.width === rect.width && current?.height === rect.height
          ? current
          : { width: rect.width, height: rect.height },
      )

      // Sections are CMS-driven and any of them can be absent (an empty board,
      // no journey entries). Docks for missing sections are dropped rather
      // than defaulted, so the mascot never waits at a station that is not
      // there.
      docksRef.current = MASCOT_DOCKS.flatMap((dock) => {
        const el = document.getElementById(dock.id)
        if (!el) return []
        const r = documentRect(el)
        return [{ ...dock, top: r.top, height: r.height }]
      })

      apply()
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    measure()

    // rAF rather than a scroll listener: the follow, the gaze and the idle
    // drift are all per-frame eases, so they have to keep running after
    // scrolling stops.
    let frame = requestAnimationFrame(function loop() {
      apply()
      frame = requestAnimationFrame(loop)
    })

    // Sections change height as images load and as `whileInView` content
    // settles, which moves every dock below them. Re-measuring on resize alone
    // would leave the docks pointing at where the page used to be.
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)

    window.addEventListener("resize", measure)
    window.addEventListener("mousemove", onMove)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("mousemove", onMove)
    }
  }, [heroSlotRef, x, y, scale, reducedMotion])

  if (!size) return null

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] hidden md:block"
      style={{
        x,
        y,
        scale,
        width: size.width,
        height: size.height,
        transformOrigin: "top left",
      }}
    >
      <button
        onClick={() => {
          toggle()
          spinRef.current = true
        }}
        className="relative h-full w-full cursor-pointer"
        aria-label="Toggle theme"
      >
        <GhMascot3D
          pointerRef={pointerRef}
          spinRef={spinRef}
          // The dark canvas needs the silhouette drawn back in — a black model
          // on #0d1117 has no edge of its own. Against a white page it
          // separates without help.
          rimIntensity={theme === "dark" ? 3 : 0.6}
        />
      </button>
    </motion.div>
  )
}
