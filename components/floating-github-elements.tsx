"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { Github } from "lucide-react"

export function FloatingGitHubElements() {
  // Generated once — see enhanced-background-elements for why.
  const marks = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        dx: Math.random() * 40 - 20,
        dy: Math.random() * 40 - 20,
        rotate: Math.random() * 360,
        size: Math.random() * 20 + 10,
        opacity: Math.random() * 0.2 + 0.05,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute right-1/4 top-1/4"
        animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Github className="h-32 w-32 text-gray-100 opacity-30 dark:text-gh-elevated" />
      </motion.div>

      <motion.div
        className="absolute left-1/4 top-1/3"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Github className="h-20 w-20 text-gray-100 opacity-20 dark:text-gh-elevated" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/3"
        animate={{
          x: [-10, 10, -10],
          y: [10, -10, 10],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        <Github className="h-24 w-24 text-gray-100 opacity-25 dark:text-gh-elevated" />
      </motion.div>

      {marks.map((mark) => (
        <motion.div
          key={mark.id}
          className="absolute"
          style={{ top: `${mark.top}%`, left: `${mark.left}%` }}
          animate={{
            x: [0, mark.dx],
            y: [0, mark.dy],
            rotate: [0, mark.rotate],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: mark.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: mark.delay,
          }}
        >
          <Github
            className="text-gray-100 dark:text-gh-elevated"
            size={mark.size}
            style={{ opacity: mark.opacity }}
          />
        </motion.div>
      ))}

      <svg className="absolute inset-0 h-full w-full opacity-5">
        <motion.path
          d="M100,100 Q200,150 300,100 T500,100"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-300 dark:text-gh-border"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M200,300 Q400,250 600,300 T800,300"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-300 dark:text-gh-border"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </svg>
    </div>
  )
}
