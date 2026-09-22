"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import dynamic from "next/dynamic"
import { motion, useMotionValue } from "framer-motion"
import { useTheme } from "./theme-provider"

const GhMascot3D = dynamic(
  () => import("./gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

type Rect = { top: number; left: number; width: number; height: number }

// getBoundingClientRect() bakes in CSS transforms, and the navbar animates
// in from `y: -100` on mount — measuring the docked slot during that entry
// returned a negative top, so the mascot docked above the viewport and got
// clipped. offsetTop/offsetLeft are layout-only and ignore transforms.
function offsetRect(el: HTMLElement): Rect {
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

// Scroll distance over which the mascot shrinks and docks.
const DOCK_SCROLL = 300

// Cursor distance, in px, at which head/eye tracking hits full deflection.
const POINTER_RANGE = 200

// Octocat 3D toggle: sits big in heroSlotRef's spot and shrinks into
// navSlotRef's as you scroll, locking there. Position is written through
// motion values, never React state — a setState per scroll event would
// re-render the WebGL canvas wrapper every frame.
export function GhMascotToggle({
  heroSlotRef,
  navSlotRef,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  navSlotRef: RefObject<HTMLDivElement | null>
}) {
  const { toggle } = useTheme()
  const pointerRef = useRef({ x: 0, y: 0 })
  const spinRef = useRef(false)

  // Ref drives the math (always fresh inside the scroll handler); state only
  // carries the resting size, which has to reach the DOM as real width and
  // height so the canvas gets a stable backing store.
  const rectsRef = useRef<{ start: Rect; end: Rect } | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  )

  // Last known cursor position, plus the mascot's current on-screen centre.
  // Both are needed to recompute tracking while *scrolling* — the mascot
  // moves under a stationary cursor, so deriving the pointer vector only on
  // mousemove left the eyes aimed at where the mascot used to be.
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const centreRef = useRef({ x: 0, y: 0 })

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  useEffect(() => {
    const syncPointer = () => {
      const m = mouseRef.current
      if (!m) return
      // Uses the centre we already computed — reading the DOM here would
      // force a layout on every scroll frame.
      const dx = (m.x - centreRef.current.x) / POINTER_RANGE
      const dy = (m.y - centreRef.current.y) / POINTER_RANGE
      pointerRef.current = {
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      }
    }

    const apply = () => {
      const r = rectsRef.current
      if (!r) return

      const p = Math.min(1, Math.max(0, window.scrollY / DOCK_SCROLL))

      // Shrink until the container matches the navbar slot, never below.
      // The octocat fills ~93% of its canvas, so container == slot puts the
      // whole mascot inside the bar with no bleed and nothing to mask.
      const dockedScale = r.end.height / r.start.height
      const s = Math.max(dockedScale, 1 + (dockedScale - 1) * p)

      // Interpolate centres, not corners: the overscanned container is
      // larger than its slot, so corner alignment would sit it off-centre.
      const startCx = r.start.left + r.start.width / 2
      const startCy = r.start.top + r.start.height / 2
      const endCx = r.end.left + r.end.width / 2
      const endCy = r.end.top + r.end.height / 2

      const cx = startCx + (endCx - startCx) * p
      // Floor on the CENTRE, not the top-left corner. The overscanned box
      // legitimately extends above y=0, so clamping its corner to the
      // viewport top would shove the docked mascot down out of the bar.
      const cy = Math.max(endCy, startCy + (endCy - startCy) * p)

      centreRef.current = { x: cx, y: cy }
      x.set(cx - (r.start.width * s) / 2)
      y.set(cy - (r.start.height * s) / 2)
      scale.set(s)
      syncPointer()
    }

    const measure = () => {
      const heroEl = heroSlotRef.current
      const navEl = navSlotRef.current
      if (!heroEl || !navEl) return
      const start = offsetRect(heroEl)
      const end = offsetRect(navEl)
      // Both slots are `hidden` below md, so they measure 0x0 there —
      // guard, or the scale ratio divides by zero and goes Infinity.
      if (!start.width || !start.height || !end.height) return
      rectsRef.current = { start, end }
      setSize({ width: start.width, height: start.height })
      apply()
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      syncPointer()
    }

    measure()
    window.addEventListener("scroll", apply, { passive: true })
    window.addEventListener("resize", measure)
    window.addEventListener("mousemove", onMove)
    return () => {
      window.removeEventListener("scroll", apply)
      window.removeEventListener("resize", measure)
      window.removeEventListener("mousemove", onMove)
    }
  }, [heroSlotRef, navSlotRef, x, y, scale])

  const handleClick = () => {
    toggle()
    spinRef.current = true
  }

  if (!size) return null

  return (
    <motion.div
      // z-50: above the fixed nav (z-40), otherwise the docked mascot sits
      // behind the nav's opaque background — invisible and unclickable.
      className="fixed left-0 top-0 z-50 hidden md:block"
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
        onClick={handleClick}
        className="relative h-full w-full cursor-pointer"
        aria-label="Toggle theme"
      >
        {/* No mask. The camera frames the whole model with margin on every
            side, so nothing is cut and there is no edge to hide — a fade
            here only dimmed the whisker tips and tentacle into a visible
            blurred frame. See the camera note in gh-mascot-3d. */}
        <GhMascot3D pointerRef={pointerRef} spinRef={spinRef} />
      </button>
    </motion.div>
  )
}
