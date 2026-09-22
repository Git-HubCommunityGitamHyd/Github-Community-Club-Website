"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValue } from "framer-motion"
import { useTheme } from "@/components/theme/theme-provider"

const GhMascot3D = dynamic(
  () => import("@/components/mascot/gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

/** Scroll distance over which the mascot shrinks out of the hero and docks. */
const DOCK_SCROLL = 300

/** Cursor distance, in px, at which head/eye tracking hits full deflection. */
const POINTER_RANGE = 200

/**
 * Hero and nav slots must share this aspect ratio or the shrink distorts —
 * the scale is derived from height alone. Both slots are sized from it.
 */
export const MASCOT_ASPECT = 1.25

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
 * The octocat, docking from the hero into the resizable nav pill.
 *
 * v1 measured both slots with offsetTop/offsetLeft because getBoundingClientRect
 * bakes in CSS transforms, and v1's navbar animates in from `y: -100` on mount —
 * measuring the docked slot mid-entry returned a negative top and parked the
 * mascot above the viewport.
 *
 * v2 inverts that for the nav slot specifically. The pill does not merely
 * animate once; it continuously re-lays-out as you scroll — shrinking its width
 * and sliding down — and all of that is transform. Layout-only measurement would
 * report where the slot would sit if the pill were never animated, so the mascot
 * would dock to a position the pill has left. The nav slot is inside a fixed
 * element, so its client rect is already in the coordinate space this mascot
 * uses, and reading it live is both correct and what makes the mascot follow the
 * pill as it collapses.
 *
 * The hero slot keeps layout measurement: it scrolls with the document, so it is
 * cached once and converted to viewport space by subtracting scrollY. That keeps
 * this to one forced layout per frame rather than two.
 */
export function V2Mascot({
  heroSlotRef,
  navSlotRef,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  navSlotRef: RefObject<HTMLDivElement | null>
}) {
  const { theme, toggle } = useTheme()
  const pointerRef = useRef({ x: 0, y: 0 })
  const spinRef = useRef(false)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const centreRef = useRef({ x: 0, y: 0 })
  const heroDocRectRef = useRef<Rect | null>(null)

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
      const navEl = navSlotRef.current
      if (!heroDoc || !navEl) return

      const end = navEl.getBoundingClientRect()
      if (!heroDoc.height || !end.height) return

      const p = Math.min(1, Math.max(0, window.scrollY / DOCK_SCROLL))

      const dockedScale = end.height / heroDoc.height
      const s = Math.max(dockedScale, 1 + (dockedScale - 1) * p)

      // Interpolate centres, not corners: the hero slot is larger than the nav
      // slot, so aligning corners would dock it off-centre.
      const startCx = heroDoc.left + heroDoc.width / 2
      const startCy = heroDoc.top - window.scrollY + heroDoc.height / 2
      const endCx = end.left + end.width / 2
      const endCy = end.top + end.height / 2

      const cx = startCx + (endCx - startCx) * p
      const cy = startCy + (endCy - startCy) * p

      centreRef.current = { x: cx, y: cy }
      x.set(cx - (heroDoc.width * s) / 2)
      y.set(cy - (heroDoc.height * s) / 2)
      scale.set(s)
      syncPointer()
    }

    const measure = () => {
      const heroEl = heroSlotRef.current
      if (!heroEl) return
      const rect = documentRect(heroEl)
      // Both slots are hidden below md, so they measure 0x0 there. Guard, or
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

    // Driven by rAF rather than the scroll event because the pill's own
    // position is spring-animated: it keeps moving for a few hundred ms after
    // scrolling stops, and a scroll listener would freeze the mascot mid-flight
    // while the bar slid out from under it.
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
  }, [heroSlotRef, navSlotRef, x, y, scale])

  if (!size) return null

  return (
    <motion.div
      // z-50, above the nav's z-50 header stacking context sibling — otherwise
      // the docked mascot sits behind the pill's translucent background.
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
          // Only the dark canvas needs the silhouette drawn back in; against a
          // white page the black model already separates on its own.
          rimIntensity={theme === "dark" ? 2.4 : 0.6}
        />
      </button>
    </motion.div>
  )
}
