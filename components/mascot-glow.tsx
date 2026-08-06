"use client"

import { useEffect, useRef, useState } from "react"

// Scoped to the mascot's own fixed z-50 wrapper, not just the aria-label —
// components/theme-toggle.tsx (a separate, desktop-hidden mobile toggle)
// shares the same "Toggle theme" label, and a plain label selector was
// matching that hidden (0x0 rect) button first, so the glow's visibility
// check failed every frame and it never showed.
const MASCOT_SELECTOR = '.z-50 > button[aria-label="Toggle theme"]'

// Glow that tracks the mascot's on-screen position/size through its
// scroll-driven shrink/dock animation. Reads the mascot's real rendered
// bounding box (read-only DOM measurement) instead of touching
// gh-mascot-toggle.tsx's internal motion values — zero edits to
// gh-mascot-toggle.tsx / gh-mascot-3d.tsx (locked). Polls via rAF rather
// than scroll/resize listeners so it doesn't need to detect when the
// dynamically-imported (ssr:false) mascot finishes mounting.
export function MascotGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame: number
    const tick = () => {
      const mascot = document.querySelector<HTMLElement>(MASCOT_SELECTOR)
      const r = mascot?.getBoundingClientRect()
      if (r && r.width && r.height) {
        setVisible(true)
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const size = Math.max(r.width, r.height) * 3
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
        el.style.width = `${size}px`
        el.style.height = `${size}px`
      } else {
        setVisible(false)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      // z-[45]: above the navbar's opaque z-40 background, below the
      // mascot's own z-50 — otherwise the docked navbar mascot has nothing
      // behind it to contrast against and blends into the bar.
      className={`pointer-events-none fixed left-0 top-0 z-[45] rounded-full blur-[70px] transition-opacity duration-200 ${
        visible ? "opacity-50" : "opacity-0"
      }`}
      style={{
        background:
          "radial-gradient(circle, rgba(63,185,80,0.6) 0%, rgba(63,185,80,0) 70%)",
      }}
    />
  )
}
