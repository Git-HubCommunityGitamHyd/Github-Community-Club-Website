"use client"

import { memo, useEffect, useState, type ReactNode } from "react"
import { animate, motion, useMotionValue } from "framer-motion"
import useMeasure from "react-use-measure"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev infinite slider, kept as the generic primitive it is — the
 * marquee that uses it lives in features/v2/about/tool-marquee.tsx.
 *
 * Two changes from the snippet.
 *
 * It imports from `framer-motion` rather than `motion/react`. Those are the
 * same library under two package names, and installing both would put two
 * animation runtimes in the bundle with separate contexts — the
 * `MotionConfig reducedMotion="user"` that wraps the v2 tree would not reach
 * anything rendered through the other one, silently undoing the reduced-motion
 * work. The API is identical, so this is an import path and nothing else.
 *
 * The snippet also renders `{children}{children}` and is then fed a
 * pre-doubled array, so every logo appears four times. Doubling once here is
 * what the -50% translate actually requires, and callers pass their list once.
 */
export const InfiniteSlider = memo(function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: {
  children: ReactNode
  gap?: number
  duration?: number
  durationOnHover?: number
  direction?: "horizontal" | "vertical"
  reverse?: boolean
  className?: string
}) {
  const [currentDuration, setCurrentDuration] = useState(duration)
  const [ref, { width, height }] = useMeasure()
  const translation = useMotionValue(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const size = direction === "horizontal" ? width : height
    if (!size) return

    const contentSize = size + gap
    const from = reverse ? -contentSize / 2 : 0
    const to = reverse ? 0 : -contentSize / 2

    const controls = isTransitioning
      ? animate(translation, [translation.get(), to], {
          ease: "linear",
          duration:
            currentDuration * Math.abs((translation.get() - to) / contentSize),
          onComplete: () => {
            setIsTransitioning(false)
            setKey((previous) => previous + 1)
          },
        })
      : animate(translation, [from, to], {
          ease: "linear",
          duration: currentDuration,
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0,
          onRepeat: () => translation.set(from),
        })

    return controls.stop
  }, [
    key,
    translation,
    currentDuration,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ])

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true)
          setCurrentDuration(durationOnHover)
        },
        onHoverEnd: () => {
          setIsTransitioning(true)
          setCurrentDuration(duration)
        },
      }
    : {}

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
})
