"use client"

import { useEffect, useRef, useState } from "react"

// Scoped to the mascot's own fixed wrapper, not just the aria-label, so a
// hidden 0x0 button elsewhere in the tree can never win the match and leave
// the glow failing its visibility check every frame.
// v2's mascot wrapper is z-[60] (it docks over the page rather than into the
// nav pill), v1's is z-50. Match either.
const MASCOT_SELECTOR =
  '.z-50 > button[aria-label="Spin the octocat"], .z-\\[60\\] > button[aria-label="Spin the octocat"]'

// Glow that tracks the mascot's on-screen position/size through its
// scroll-driven shrink/dock animation. Reads the mascot's real rendered
// bounding box (read-only DOM measurement) instead of touching
// gh-mascot-dock.tsx's internal motion values — zero edits to
// gh-mascot-dock.tsx / gh-mascot-3d.tsx (locked). Polls via rAF rather
// than scroll/resize listeners so it doesn't need to detect when the
// dynamically-imported (ssr:false) mascot finishes mounting.
export function MascotGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Only the v1 homepage mounts this now; v2 draws its glow inside
    // V2Mascot. Three things below used to happen unconditionally on every
    // frame and now only happen when something changed: finding the mascot
    // (a document-wide selector match), telling React it is visible, and
    // writing a new size onto a `blur(70px)` element, which re-lays it out and
    // re-rasterises the whole blur.
    let frame: number
    let mascot: HTMLElement | null = null
    let shown = false
    let last = ""
    const tick = () => {
      if (!mascot?.isConnected) {
        mascot = document.querySelector<HTMLElement>(MASCOT_SELECTOR)
      }
      const r = mascot?.getBoundingClientRect()
      const ok = Boolean(r && r.width && r.height)
      if (ok !== shown) {
        shown = ok
        setVisible(ok)
      }
      if (r && ok) {
        const cx = Math.round(r.left + r.width / 2)
        const cy = Math.round(r.top + r.height / 2)
        const size = Math.round(Math.max(r.width, r.height) * 3)
        const key = `${cx},${cy},${size}`
        if (key !== last) {
          last = key
          el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
          el.style.width = `${size}px`
          el.style.height = `${size}px`
        }
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
