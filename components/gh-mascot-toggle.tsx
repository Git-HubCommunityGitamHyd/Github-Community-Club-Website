"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

const GhMascot3D = dynamic(
  () => import("./gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

// Octocat 3D model toggle: it tracks the cursor and does a full spin on
// click while it swaps light/dark. Model: "GitHub Octocat" by pissang
// (CC Attribution) — credited in the footer.
export function GhMascotToggle() {
  const { theme, toggle } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const spinRef = useRef(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const max = 200
      pointerRef.current = {
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / max)),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / max)),
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  const handleClick = () => {
    toggle()
    spinRef.current = true
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="relative h-12 w-12 cursor-pointer"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* Soft edge fade instead of a hard crop: the Octocat's whiskers run
          past the canvas, so a circular clip left a visible cut line. The
          mask stays on the canvas so it doesn't eat the badge below. */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle, black 62%, transparent 92%)",
          maskImage: "radial-gradient(circle, black 62%, transparent 92%)",
        }}
      >
        <GhMascot3D pointerRef={pointerRef} spinRef={spinRef} />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 z-[2] flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-elevated">
        {theme === "dark" ? (
          <Sun className="h-2.5 w-2.5" />
        ) : (
          <Moon className="h-2.5 w-2.5" />
        )}
      </div>
    </button>
  )
}
