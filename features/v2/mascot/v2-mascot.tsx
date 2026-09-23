"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValue, useReducedMotion } from "framer-motion"
import { useTheme } from "@/components/theme/theme-provider"

const GhMascot3D = dynamic(
  () => import("@/components/mascot/gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

/** Scroll distance over which the mascot leaves the hero and takes up its dock. */
const DOCK_SCROLL = 320

/** Cursor distance, in px, at which head/eye tracking hits full deflection. */
const POINTER_RANGE = 200

/**
 * Hero and dock must share this aspect ratio or the shrink distorts — the
 * scale is derived from height alone.
 */
export const MASCOT_ASPECT = 1.25

/** Docked height. The nav pill's 44px was the problem; this is legible. */
const DOCK_HEIGHT = 116

/** Gap from the viewport edges when the mascot is resting. */
const DOCK_MARGIN = 26

/** How far the cursor can pull the mascot off its dock, in px. */
const LEASH = 74

/** Cursor distance at which the pull is at full strength. */
const LEASH_RANGE = 520

/** Per-frame follow rate. Low enough that it lopes after the cursor. */
const FOLLOW = 0.085

type Rect = { top: number; left: number; width: number; height: number }

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

/**
 * The octocat: rides in the hero, then takes up a dock and follows the cursor.
 *
 * It used to shrink into a 55x44 slot inside the nav pill. At that size the
 * model is roughly 30px of actual cat, and in dark mode a black octocat on
 * #0d1117 at 30px is a smudge — you cannot tell it is a cat, let alone that it
 * is watching you. The 3D model, the eye tracking and the spin-on-click were
 * all still running, for something nobody could see.
 *
 * So it docks to a corner of the viewport at a legible size instead, and the
 * cursor tracking becomes the point rather than a detail. It leans toward the
 * pointer, on a leash, so it reads as a companion following you down the page
 * rather than a widget that has been parked. The leash matters: unbounded
 * following turns it into a cursor trail that covers whatever you are trying
 * to read, and it would have to be dodged. Tethered, it can be ignored.
 *
 * The dock corner flips to the left half of the screen when the pointer
 * settles over the right side, so it moves out of the way of whatever is being
 * read or hovered instead of sitting on top of it.
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
  /** Smoothed centre, so the mascot lopes after the cursor rather than snapping. */
  const easedRef = useRef<{ x: number; y: number } | null>(null)
  /** Which side it rests on. Flips to get out of the pointer's way. */
  const sideRef = useRef<"right" | "left">("right")

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )

  useEffect(() => {
    const syncPointer = () => {
      const m = mouseRef.current
      if (!m) return
      const dx = (m.x - centreRef.current.x) / POINTER_RANGE
      const dy = (m.y - centreRef.current.y) / POINTER_RANGE
      pointerRef.current = {
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      }
    }

    const apply = () => {
      const heroDoc = heroDocRectRef.current
      if (!heroDoc || !heroDoc.height) return

      const p = Math.min(1, Math.max(0, window.scrollY / DOCK_SCROLL))

      const dockedScale = DOCK_HEIGHT / heroDoc.height
      const s = Math.max(dockedScale, 1 + (dockedScale - 1) * p)
      const dockedWidth = DOCK_HEIGHT * MASCOT_ASPECT

      const m = mouseRef.current
      // Rest on the side away from the pointer. Only the pointer's own half
      // decides it, with a dead band in the middle, so it does not flip back
      // and forth while the cursor wanders around the centre of the page.
      if (m) {
        if (m.x > window.innerWidth * 0.62) sideRef.current = "left"
        else if (m.x < window.innerWidth * 0.38) sideRef.current = "right"
      }

      const anchorX =
        sideRef.current === "right"
          ? window.innerWidth - DOCK_MARGIN - dockedWidth / 2
          : DOCK_MARGIN + dockedWidth / 2
      const anchorY = window.innerHeight - DOCK_MARGIN - DOCK_HEIGHT / 2

      // Pull toward the cursor, clamped to the leash, so it never wanders into
      // the middle of the page and never covers what is under the pointer.
      let dockCx = anchorX
      let dockCy = anchorY
      if (m && !reducedMotion) {
        const dx = m.x - anchorX
        const dy = m.y - anchorY
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

      centreRef.current = { x: eased.x, y: eased.y }
      x.set(eased.x - (heroDoc.width * s) / 2)
      y.set(eased.y - (heroDoc.height * s) / 2)
      scale.set(s)
      syncPointer()
    }

    const measure = () => {
      const heroEl = heroSlotRef.current
      if (!heroEl) return
      const rect = documentRect(heroEl)
      // The hero slot is hidden below md, so it measures 0x0 there. Guard, or
      // the scale ratio divides by zero.
      if (!rect.width || !rect.height) return
      heroDocRectRef.current = rect
      setSize({ width: rect.width, height: rect.height })
      apply()
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      syncPointer()
    }

    measure()

    // rAF rather than a scroll listener: the follow is a per-frame ease toward
    // the cursor, so it has to keep running after scrolling stops.
    let frame = requestAnimationFrame(function loop() {
      apply()
      frame = requestAnimationFrame(loop)
    })

    window.addEventListener("resize", measure)
    window.addEventListener("mousemove", onMove)
    return () => {
      cancelAnimationFrame(frame)
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
