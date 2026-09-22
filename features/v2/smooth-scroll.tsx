"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import Lenis from "lenis"

// On `/`, Lenis is constructed inside components/motion/scroll-stack.tsx. Because
// the benefits section passes useWindowScroll, one section's component ends up
// owning the whole page's scrolling as a side effect — which is why
// document.documentElement carries a `lenis` class there, and why a programmatic
// scrollTo with behavior:"instant" still animates for about a second.
//
// v2 lifts it here instead. One instance, one RAF loop, and every component that
// reads scroll position (the navbar, the scroll spy, the timeline spine) shares a
// single source of truth rather than racing a loop it cannot see.
const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    // The old setup ran regardless. Hijacking the scroll wheel is exactly the
    // kind of motion a reduced-motion preference is asking us not to do.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    })

    let frame = requestAnimationFrame(function loop(time: number) {
      instance.raf(time)
      frame = requestAnimationFrame(loop)
    })

    setLenis(instance)

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
