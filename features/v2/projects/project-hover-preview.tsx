"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion"
import { setPerch } from "@/features/v2/mascot/perch"

/**
 * The window that follows the cursor across the homepage project list.
 *
 * It shows a captured image rather than an `<iframe>` of the live site. An
 * iframe is the obvious reading of "preview the deployed site" and it is the
 * wrong tool: most sites send `X-Frame-Options: DENY` or a frame-ancestors
 * CSP and simply refuse to render, so the preview would be blank for a large
 * share of real links. It also means loading a whole third-party page, with
 * its scripts and its cookies, every time a cursor crosses a row. Wikipedia,
 * GitHub and Vercel all use captured images for their link previews for the
 * same two reasons.
 *
 * The octocat that perches on the frame is the page's own mascot, called over
 * from wherever it had got to on its scroll rail. This component owns no
 * mascot of its own; it publishes a perch (see mascot/perch.ts) and the mascot
 * flies to it and back. That is what makes the preview part of the page rather
 * than a card with a picture of a cat on it, and it means a reader who is
 * watching the mascot come down the projects section sees it go and sit on the
 * thing they just pointed at.
 *
 * A row with no live URL publishes no preview and therefore no perch, so the
 * mascot simply carries on down its rail. Nothing extra is needed to make a
 * project the CMS has marked in progress behave that way.
 */

export type PreviewTarget = {
  /** Identifies the hovered row, so re-entering the same row does not restart. */
  id: number
  name: string
  image: string
  href: string
}

/** Offset from the cursor, in px. Right and below, out of the pointer's way. */
const OFFSET_X = 28
const OFFSET_Y = 24

/** The card's glide between positions while it is showing. */
const CARD_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.6,
} as const

const CARD_W = 380
const CARD_H = 250

/** How far in from the card's corner the mascot sits, in px. */
const PERCH_INSET = 52

/**
 * How far above the card's top edge the mascot's centre sits, in px.
 *
 * Negative, so it straddles the rim: roughly its lower half overlaps the
 * frame, which is what reads as sitting on the card rather than hovering above
 * it. The mascot draws at z-[60] and the card at z-40, so the overlap resolves
 * in the right order without either of them having to know about the other.
 */
const PERCH_RISE = -14

export function ProjectHoverPreview({
  target,
  containerRef,
}: {
  target: PreviewTarget | null
  containerRef: React.RefObject<HTMLElement | null>
}) {
  const reducedMotion = useReducedMotion()

  // Motion values, not state. A pointermove fires at frame rate and putting it
  // through setState would re-render the whole list on every one of them.
  //
  // What the card is drawn at, which is also what the mascot's perch is
  // derived from, so it sits on the card where the card is rather than where
  // it is heading.
  //
  // Plain values sprung with `animate()` per move, rather than `useSpring`
  // over a raw target. The card must appear *at* the cursor and only then
  // glide, and with `useSpring` that meant calling `jump()` on the spring when
  // the hover began. Whether that ran before or after the first recorded
  // cursor position depended on the order React and the native listener saw
  // the entering event, and when it ran first the spring was left parked at
  // the top-left corner until the next move. Deciding snap-or-spring inside
  // the move handler itself has no ordering to get wrong.
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  /** Which side of the cursor the card is on, from the last pointer move. */
  const flipRef = useRef({ x: false, y: false })
  /** Whether a row is hovered, so moves know whether to publish a perch. */
  const activeRef = useRef(false)
  /**
   * True while the card is hidden and on the first move after it appears: the
   * next position is placed, not animated to. Set by the effect on `target`
   * and cleared by the first move that honours it, so either order works.
   */
  const snapRef = useRef(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (event: PointerEvent) => {
      // Flip the card to the other side of the cursor near the right edge, so
      // it never hangs off the viewport.
      const flipX = event.clientX + OFFSET_X + CARD_W > window.innerWidth
      const flipY = event.clientY + OFFSET_Y + CARD_H > window.innerHeight
      flipRef.current = { x: flipX, y: flipY }
      const nextX = event.clientX + (flipX ? -OFFSET_X - CARD_W : OFFSET_X)
      const nextY = event.clientY + (flipY ? -OFFSET_Y - CARD_H : OFFSET_Y)

      if (reducedMotion || snapRef.current || !activeRef.current) {
        x.set(nextX)
        y.set(nextY)
        // Keep snapping while nothing is shown; stop once a card is up.
        if (activeRef.current) snapRef.current = false
        return
      }
      animate(x, nextX, CARD_SPRING)
      animate(y, nextY, CARD_SPRING)
    }

    el.addEventListener("pointermove", onMove)
    // Also on `pointerover`, which fires on this element as the event bubbles
    // and so before React, listening at the root, turns it into the row's
    // `onPointerEnter`. That enter sets `target`, and the effect below moves
    // the card to the cursor the moment it appears. Without this, a pointer
    // that lands on a row with no move in between (a fast flick onto the list)
    // reaches that effect before any position has been recorded, and the card,
    // and the mascot perched on it, fly in from the top-left corner.
    el.addEventListener("pointerover", onMove)
    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerover", onMove)
      // The list is going away, so nothing is asking for the mascot any more.
      setPerch(null)
    }
  }, [containerRef, x, y, reducedMotion])

  // The perch, republished every time the card moves.
  //
  // It used to be published once, when the hovered row changed, from a value
  // the pointer handler went on updating afterwards but never sent. So the
  // mascot flew to where the card had been at the moment the row was entered
  // and stayed there while the card followed the cursor away, ending up
  // sitting on the picture, or nowhere near the card at all, instead of on its
  // rim. Subscribing to the card's own drawn position means the two cannot
  // come apart.
  useEffect(() => {
    const publish = () => {
      if (!activeRef.current) return
      const flip = flipRef.current
      // On the card's top rim, at the corner furthest from the cursor, so the
      // mascot never covers the frame it sits on and never ends up between
      // the reader and their own pointer.
      setPerch({
        x: x.get() + (flip.x ? PERCH_INSET : CARD_W - PERCH_INSET),
        y: y.get() + PERCH_RISE,
      })
    }

    const stopX = x.on("change", publish)
    const stopY = y.on("change", publish)

    // Appearing: the next move places the card rather than animating it in
    // from wherever it was last hidden.
    if (target && !activeRef.current) snapRef.current = true
    activeRef.current = target !== null
    if (target) {
      publish()
    } else {
      setPerch(null)
    }

    return () => {
      stopX()
      stopY()
    }
  }, [target, x, y])

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          // Hidden below lg: the whole interaction is hover, and a touch
          // device has no hover. The projects page shows the same work
          // without it.
          className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
          style={{
            x,
            y,
            width: CARD_W,
          }}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl border border-gh-border bg-gh-surface shadow-[0_24px_60px_-20px_rgba(1,4,9,0.9)]">
              {/* The captured page. `key` on the src so swapping rows
                  crossfades rather than snapping. */}
              <div className="relative aspect-[16/10] w-full bg-gh-elevated">
                <Image
                  key={target.image}
                  src={target.image}
                  alt=""
                  fill
                  sizes="380px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gh-border px-3.5 py-2.5">
                <span className="truncate text-[13px] font-semibold text-gh-text">
                  {target.name}
                </span>
                <span className="shrink-0 truncate font-mono text-[11px] text-gh-muted">
                  {hostOf(target.href)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** "https://example.com/a/b" reads as "example.com" on the card's footer. */
function hostOf(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, "")
  } catch {
    return ""
  }
}
