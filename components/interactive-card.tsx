"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

interface InteractiveCardProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  glowEffect?: boolean
}

export function InteractiveCard({
  children,
  className = "",
  hoverScale = 1.02,
  glowEffect = false,
}: InteractiveCardProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale, y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative"
    >
      {glowEffect && (
        <motion.div
          className="absolute -inset-1 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 opacity-0 blur-sm dark:from-gh-elevated dark:to-gh-border"
          whileHover={{ opacity: 0.4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}

      <Card
        className={`relative border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-xl hover:shadow-black/10 dark:border-gh-border dark:bg-gh-surface dark:hover:border-gh-muted dark:hover:shadow-black/40 ${className} `}
      >
        {children}

        <motion.div
          className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 dark:via-white/5"
          whileHover={{ opacity: [0, 1, 0], x: [-100, 300] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </Card>
    </motion.div>
  )
}
