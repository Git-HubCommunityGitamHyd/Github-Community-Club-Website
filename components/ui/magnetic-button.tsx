"use client"

import { useRef, type ReactNode } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * A button that leans toward the cursor and springs back when it leaves.
 *
 * Two details make the difference between this and the usual version.
 *
 * The pull is measured from the button's own centre and clamped to `pull`
 * pixels, so a wide button does not travel further than a narrow one — the
 * naive implementation multiplies the raw offset and makes a full-width CTA
 * slide halfway across the screen.
 *
 * The label moves further than the shell (`labelPull`), which is what reads as
 * depth rather than as the whole element sliding around.
 *
 * `useReducedMotion` short-circuits the whole thing: a cursor-chasing control
 * is exactly what that preference is asking us not to do, and the button still
 * has its ordinary hover and focus states without it.
 */
export function MagneticButton({
  children,
  onClick,
  className,
  pull = 18,
  labelPull = 8,
  type = "button",
  "aria-label": ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  pull?: number
  labelPull?: number
  type?: "button" | "submit"
  "aria-label"?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 260, damping: 18, mass: 0.6 }
  const shellX = useSpring(x, spring)
  const shellY = useSpring(y, spring)
  const labelX = useTransform(shellX, (value) => (value / pull) * labelPull)
  const labelY = useTransform(shellY, (value) => (value / pull) * labelPull)

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    // Normalised against the half-extent, so the clamp is proportional to the
    // button rather than to raw pixel distance.
    x.set(Math.max(-1, Math.min(1, dx / (rect.width / 2))) * pull)
    y.set(Math.max(-1, Math.min(1, dy / (rect.height / 2))) * pull)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={{ x: shellX, y: shellY }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group/magnetic relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold",
        "bg-gh-accent text-gh-deep transition-colors duration-200 hover:bg-[#56d364]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black",
        className,
      )}
    >
      <motion.span
        style={{ x: labelX, y: labelY }}
        className="pointer-events-none inline-flex items-center gap-2"
      >
        {children}
      </motion.span>
    </motion.button>
  )
}
