"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ReactNode, MouseEvent } from "react"

interface EnhancedButtonProps {
  children: ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  type?: "primary" | "secondary"
  colorScheme?:
    "default" | "github" | "linkedin" | "twitter" | "email" | "community"
}

export function EnhancedButton({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  type = "primary",
  colorScheme = "default",
}: EnhancedButtonProps) {
  const isPrimary = type === "primary"

  const getColorScheme = () => {
    switch (colorScheme) {
      case "github":
        return "bg-black hover:bg-gray-800 text-white border-black shadow-lg hover:shadow-xl"
      case "linkedin":
        return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg hover:shadow-xl"
      case "twitter":
        return "bg-blue-400 hover:bg-blue-500 text-white border-blue-400 shadow-lg hover:shadow-xl"
      case "email":
        return "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg hover:shadow-xl"
      case "community":
        return variant === "outline"
          ? "border-2 border-gh-accent text-gh-accent hover:bg-gh-accent/10 bg-transparent"
          : "bg-gradient-to-r from-gh-accent via-[#2ea043] to-gh-accent hover:opacity-90 text-white border-gh-accent shadow-2xl"
      default:
        return isPrimary
          ? "bg-gh-elevated hover:bg-gh-border text-white border-gh-border hover:shadow-lg hover:shadow-gh-accent/10"
          : "border-gh-border text-gh-text hover:bg-gh-elevated bg-transparent hover:shadow-md"
    }
  }

  return (
    <motion.div
      whileHover={{ scale: colorScheme === "community" ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block overflow-hidden"
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {colorScheme === "community" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gh-accent/20 via-green-500/20 to-gh-accent/20 opacity-0 blur-xl"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <Button
        variant={variant}
        size={size}
        className={`group relative z-10 rounded-xl font-semibold transition-all duration-300 ${getColorScheme()} ${colorScheme === "community" ? "px-8 py-4 text-lg" : ""} ${className} `}
        onClick={onClick}
      >
        <motion.span
          className="flex items-center gap-3"
          whileHover={{
            x: colorScheme === "community" ? 2 : isPrimary ? 1 : 0,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {children}
        </motion.span>

        {colorScheme === "community" && variant !== "outline" && (
          <motion.div
            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{
              x: "200%",
              transition: { duration: 0.8, ease: "easeInOut" },
            }}
          />
        )}

        <motion.div
          className="absolute inset-0 rounded-xl bg-white opacity-0"
          whileTap={{ opacity: [0, 0.2, 0], scale: [0.8, 1.1, 1] }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </Button>
    </motion.div>
  )
}
