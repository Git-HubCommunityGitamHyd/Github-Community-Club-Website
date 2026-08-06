"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import type { ReactNode } from "react"

interface PopupCardProps {
  frontContent: ReactNode
  backContent: ReactNode
  className?: string
  cardId: string
}

export function PopupCard({
  frontContent,
  backContent,
  className = "",
  cardId,
}: PopupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBackContent, setShowBackContent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCardClick = () => {
    setIsExpanded(true)
    setTimeout(() => setShowBackContent(true), 150)
  }

  const handleClose = useCallback(() => {
    setShowBackContent(false)
    setTimeout(() => setIsExpanded(false), 150)
  }, [])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) handleClose()
    }
    if (isExpanded) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isExpanded])

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`cursor-pointer ${className}`}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleCardClick()
          }
        }}
        role="button"
        tabIndex={0}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        layoutId={`card-${cardId}`}
        style={{ visibility: isExpanded ? "hidden" : "visible" }}
      >
        {frontContent}
      </motion.div>

      {mounted &&
        createPortal(
          // AnimatePresence has to wrap the conditional, not sit inside it —
          // otherwise the tree unmounts before the exit animation can run.
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="popup-overlay fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg dark:bg-black/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={handleOverlayClick}
                role="dialog"
                aria-modal="true"
                style={{ zIndex: 9999999 }}
              >
                <motion.div
                  className="hide-scrollbar popup-content relative h-auto max-h-[85vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gh-surface dark:shadow-black/60 md:rounded-3xl"
                  layoutId={`card-${cardId}`}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ zIndex: 10000000 }}
                >
                  <motion.button
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 shadow-lg transition-colors duration-200 hover:bg-gray-200 dark:bg-gh-elevated dark:hover:bg-gh-border"
                    onClick={handleClose}
                    aria-label="Close"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { delay: 0.2 },
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{ zIndex: 10000001 }}
                  >
                    <X className="h-6 w-6 text-gray-600 dark:text-gh-muted" />
                  </motion.button>

                  <AnimatePresence>
                    {showBackContent && (
                      <motion.div
                        className="p-6 md:p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {backContent}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
