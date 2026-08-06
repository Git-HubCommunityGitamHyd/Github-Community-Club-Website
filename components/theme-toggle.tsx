"use client"

import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <motion.button
      onClick={toggle}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:border-gh-border dark:bg-gh-elevated dark:text-gh-muted dark:hover:bg-gh-border dark:hover:text-gh-text"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle theme"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </motion.span>
    </motion.button>
  )
}
