"use client"

import { useEffect, useState } from "react"
import { useLenis } from "@/features/site/smooth-scroll"

/**
 * Which section is currently under the line the nav floats over.
 *
 * Two things here are deliberate, both of them lessons from this page:
 *
 * 1. The element lookup happens inside `resolve`, not once at mount. Caching the
 *    nodes is the obvious optimisation and it is why this silently failed: the
 *    section DOM gets replaced after the first commit, so the cached references
 *    end up detached. A detached node's getBoundingClientRect() is all zeros, so
 *    `top <= offset` passes, `bottom >= offset` fails, and the spy reports "no
 *    section" forever while looking perfectly healthy. An IntersectionObserver
 *    fails the same way and even more quietly — it delivers its one initial
 *    callback and then never fires again, because detached nodes never cross
 *    anything. getElementById is a hash lookup; six of them per frame is nothing
 *    next to being wrong.
 *
 * 2. It reads from Lenis rather than a raw scroll listener. Lenis owns this
 *    page's scrolling and emits at most once per animation frame off its own RAF
 *    loop. Without Lenis — reduced motion — a plain listener coalesced into a
 *    frame gives the same budget.
 */
export function useActiveSection(ids: string[], offset: number) {
  const lenis = useLenis()
  const [activeSection, setActiveSection] = useState(ids[0] ?? "")

  useEffect(() => {
    const resolve = () => {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= offset && rect.bottom >= offset) {
          setActiveSection(id)
          return
        }
      }
    }

    resolve()

    if (lenis) {
      lenis.on("scroll", resolve)
      return () => {
        lenis.off("scroll", resolve)
      }
    }

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        resolve()
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [ids, offset, lenis])

  return activeSection
}
