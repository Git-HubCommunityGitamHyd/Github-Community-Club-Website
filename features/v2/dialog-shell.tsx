"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useLenis } from "@/features/v2/smooth-scroll"
import { useMounted } from "@/lib/use-mounted"

/**
 * The overlay behind every v2 detail dialog (board member, event).
 *
 * The part worth knowing: `document.body.style.overflow = "hidden"` does not
 * hold this page still. Lenis scrolls by transforming the document and ignores
 * overflow entirely, so without `lenis.stop()` the background keeps gliding
 * under the dialog. The overflow lock stays for the reduced-motion case, where
 * SmoothScroll never constructs a Lenis at all.
 */
export function DialogShell({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
}) {
  const mounted = useMounted()
  const lenis = useLenis()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    lenis?.stop()
    panelRef.current?.focus()

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
      lenis?.start()
      previouslyFocused?.focus?.()
    }
  }, [open, lenis, onClose])

  const onOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose],
  )

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gh-deep/70 p-4 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onOverlayClick}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl focus:outline-none dark:border-gh-border dark:bg-gh-surface sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-2 text-gray-500 transition hover:bg-gray-900/10 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light dark:text-gh-muted dark:hover:bg-gh-text/10 dark:hover:text-gh-text dark:focus-visible:ring-gh-accent"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
