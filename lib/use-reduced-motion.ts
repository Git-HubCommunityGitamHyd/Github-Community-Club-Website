"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/**
 * Whether the visitor asked for reduced motion.
 *
 * Use this instead of framer-motion's `useReducedMotion`. Framer's reads the
 * media query on the client's first render, so anything rendered from it
 * (the finished terminal transcript, a static hero) differs from the server
 * HTML and React throws a hydration error for every visitor with the setting
 * on. Here the server snapshot, `false`, is also used while hydrating, and
 * React re-renders with the real value straight after. It also follows the
 * setting if it changes while the page is open.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
