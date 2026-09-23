"use client"

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type ValueAnimationTransition,
} from "framer-motion"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev counting number, with two changes.
 *
 * It imports from `framer-motion` rather than `motion/react` — the same
 * library under two package names. Installing both would put two animation
 * runtimes in the bundle with separate contexts, so the
 * `MotionConfig reducedMotion="user"` wrapping the v2 tree would not reach
 * anything rendered through the other one.
 *
 * `autoStart` defaults to false rather than true. Starting on mount means a
 * counter half-way down the page finishes long before anyone scrolls to it,
 * and the reader arrives at a static number — the animation exists and is
 * never seen. Callers gate it on visibility instead.
 */
export type CountingNumberRef = {
  startAnimation: () => void
}

export type CountingNumberProps = {
  from?: number
  target: number
  transition?: ValueAnimationTransition
  className?: string
  onStart?: () => void
  onComplete?: () => void
  autoStart?: boolean
  /**
   * How the rounded value is rendered. The default groups thousands, which is
   * right for a member count and wrong for a year — 2022 would read "2,022".
   */
  format?: (value: number) => string
}

export const CountingNumber = forwardRef<
  CountingNumberRef,
  CountingNumberProps
>(function CountingNumber(
  {
    from = 0,
    target = 100,
    transition = { duration: 2, ease: "easeOut", type: "tween" },
    className,
    onStart,
    onComplete,
    autoStart = false,
    format = (value) => value.toLocaleString(),
  },
  ref,
) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => format(Math.round(latest)))
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)

  const startAnimation = useCallback(() => {
    controlsRef.current?.stop()
    onStart?.()
    count.set(from)
    controlsRef.current = animate(count, target, {
      ...transition,
      onComplete: () => onComplete?.(),
    })
  }, [from, target, transition, onStart, onComplete, count])

  useImperativeHandle(ref, () => ({ startAnimation }))

  useEffect(() => {
    if (autoStart) startAnimation()
    return () => controlsRef.current?.stop()
  }, [autoStart, startAnimation])

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {rounded}
    </motion.span>
  )
})
