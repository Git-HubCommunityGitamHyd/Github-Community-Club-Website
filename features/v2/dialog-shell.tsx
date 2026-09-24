"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useLenis } from "@/features/v2/smooth-scroll"
import { useMounted } from "@/lib/use-mounted"
import { cn } from "@/lib/utils"
import { setPerch } from "@/features/v2/mascot/perch"

/** Height the octocat is drawn at while sitting on a popup, in px. */
const DIALOG_PERCH_HEIGHT = 104

/** Its centre, measured from the panel's top-right corner, in px. */
const DIALOG_PERCH_FROM_RIGHT = 132
const DIALOG_PERCH_RISE = 30

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
  panelClassName,
  bleed = false,
  perchMascot = false,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  /** Overrides the panel's width. Padding is controlled by `bleed`. */
  panelClassName?: string
  /**
   * Drops the panel's own padding so a child can run a cover image to the
   * edges, and puts the close button on a scrim so it stays legible over one.
   */
  bleed?: boolean
  /**
   * Asks the page's octocat to come and sit on the panel's top edge while
   * it is open, the way it sits on a project preview. Only pages that mount
   * the mascot notice; everywhere else the request is simply unread.
   */
  perchMascot?: boolean
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

  // Published every frame while open rather than once: the panel springs in
  // (y and scale), and a perch read at mount would be where the panel
  // started, not where it lands. A layout read per frame is fine for the few
  // seconds a popup is open, and it stops the moment it closes.
  useEffect(() => {
    if (!open || !perchMascot) return
    let frame = requestAnimationFrame(function publish() {
      const panel = panelRef.current
      if (panel) {
        const rect = panel.getBoundingClientRect()
        setPerch({
          x: rect.right - DIALOG_PERCH_FROM_RIGHT,
          y: rect.top - DIALOG_PERCH_RISE,
          height: DIALOG_PERCH_HEIGHT,
          aboveDialogs: true,
        })
      }
      frame = requestAnimationFrame(publish)
    })
    return () => {
      cancelAnimationFrame(frame)
      setPerch(null)
    }
  }, [open, perchMascot])

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
          className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center bg-gh-deep/70 p-4 backdrop-blur-sm sm:p-6",
            // Headroom for the octocat sitting on the panel's top edge. A
            // tall panel (a build with a gallery) otherwise starts 7.5vh from
            // the top and the perched mascot's head is cut off by the window.
            perchMascot && "pt-28 sm:pt-28",
          )}
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
            className={cn(
              "relative w-full overflow-y-auto rounded-3xl border border-gh-border bg-gh-surface shadow-2xl focus:outline-none",
              perchMascot ? "max-h-[calc(100dvh-9.5rem)]" : "max-h-[85vh]",
              !bleed && "p-8 sm:p-10",
              panelClassName ?? "max-w-2xl",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "absolute right-5 top-5 z-20 rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
                bleed
                  ? "bg-gh-deep/55 text-white backdrop-blur-sm hover:bg-gh-deep/80"
                  : "text-gh-muted hover:bg-gh-text/10 hover:text-gh-text",
              )}
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
