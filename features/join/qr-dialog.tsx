"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

interface QrDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function QrDialog({ isOpen, onClose }: QrDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 9999 }}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-2xl bg-gh-surface p-6 shadow-2xl shadow-black/60 sm:p-12 md:rounded-3xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gh-elevated shadow-lg transition-colors duration-200 hover:bg-gh-border sm:right-6 sm:top-6"
              onClick={onClose}
              aria-label="Close"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6 text-gh-muted" />
            </motion.button>
            <div className="text-center">
              <h3 className="mb-4 pr-10 text-xl font-bold text-gh-text sm:pr-5 sm:text-2xl">
                Join our WhatsApp Community
              </h3>
              <div className="flex justify-center">
                <Image
                  src="/images/whatsapp-qr.png"
                  alt="WhatsApp QR code"
                  width={300}
                  height={250}
                  className="h-auto w-full max-w-[240px] sm:max-w-[300px]"
                />
              </div>
              <p className="mt-4 text-sm text-gh-muted sm:text-base">
                Scan this code with your phone to join the group!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
