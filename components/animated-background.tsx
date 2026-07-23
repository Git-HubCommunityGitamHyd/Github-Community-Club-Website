"use client"

import { motion } from "framer-motion"
import {
  Github,
  GitBranch,
  Code,
  Star,
  Zap,
  GitCommit,
  GitMerge,
  GitPullRequest,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const icons = [
  Github,
  GitBranch,
  Code,
  Star,
  Zap,
  GitCommit,
  GitMerge,
  GitPullRequest,
]

interface FloatingElement {
  id: number
  Icon: any
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export function AnimatedBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  // Generated once — see enhanced-background-elements for why.
  const extras = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        top: Math.random() * 100,
        left: Math.random() * 100,
        dx: Math.random() * 30 - 15,
        dy: Math.random() * 30 - 15,
        size: Math.random() * 25 + 15,
        opacity: Math.random() * 0.12 + 0.08,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 10,
      })),
    [],
  )

  useEffect(() => {
    const newElements: FloatingElement[] = []
    for (let i = 0; i < 50; i++) {
      newElements.push({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 20,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.25 + 0.05,
      })
    }
    setElements(newElements)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          initial={{
            x: `${element.x}vw`,
            y: `${element.y}vh`,
            opacity: element.opacity,
          }}
          animate={{
            x: [
              `${element.x}vw`,
              `${(element.x + 30) % 100}vw`,
              `${element.x}vw`,
            ],
            y: [
              `${element.y}vh`,
              `${(element.y + 20) % 100}vh`,
              `${element.y}vh`,
            ],
            rotate: [0, 360],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: element.delay,
          }}
        >
          <element.Icon
            size={element.size}
            className="text-gray-300 dark:text-gh-elevated"
            style={{ opacity: element.opacity }}
          />
        </motion.div>
      ))}

      <motion.div
        className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full border border-gray-300 dark:border-gh-elevated"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 top-3/4 h-24 w-24 rounded-full border border-gray-300 dark:border-gh-elevated"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.25, 0.15, 0.25] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute right-1/3 top-1/2 h-16 w-16 rounded-full border border-gray-300 dark:border-gh-elevated"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {extras.map((extra) => (
        <motion.div
          key={`extra-${extra.id}`}
          className="absolute"
          style={{ top: `${extra.top}%`, left: `${extra.left}%` }}
          animate={{ x: [0, extra.dx], y: [0, extra.dy], rotate: [0, 360] }}
          transition={{
            duration: extra.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: extra.delay,
          }}
        >
          <extra.Icon
            size={extra.size}
            className="text-gray-400 dark:text-gh-elevated"
            style={{ opacity: extra.opacity }}
          />
        </motion.div>
      ))}
    </div>
  )
}
