"use client"

import React, { useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Ported from the Aceternity resizable navbar. Three deltas from the published
// snippet, all forced by this project rather than preference:
//
//   1. `motion/react` -> `framer-motion`. The `motion` package is not installed;
//      framer-motion 13 exposes the same motion / AnimatePresence / useScroll /
//      useMotionValueEvent API.
//   2. @tabler/icons-react -> lucide-react, which is already this project's
//      declared iconLibrary in components.json.
//   3. `sticky top-20` -> `fixed top-0` with inner offset. The snippet is written
//      for a demo container that scrolls inside a page; this is a real site nav.
//
// The pastel drop shadows and bg-white/80 from the snippet are gone too — colour
// is left entirely to the caller so the GitHub palette can drive it.

const SHRINK_AT = 80

interface NavbarProps {
  children: React.ReactNode
  className?: string
}

export function Navbar({ children, className }: NavbarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > SHRINK_AT)
  })

  return (
    <motion.header
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.header>
  )
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
  /** Applied only once the bar has shrunk, so the caller owns the palette. */
  visibleClassName?: string
  visible?: boolean
  /**
   * A surface painted behind the bar, given the current shrink state.
   *
   * A render prop rather than a node because only this component knows
   * `visible` (Navbar clones it in), and the surface has to fade with it.
   *
   * Supplying one also switches off the animated `backdrop-filter` below. Two
   * nested backdrop filters do not compose: the outer one establishes a
   * backdrop root, so the inner one filters an already-blurred image. A
   * refractive surface underneath a blur just looks like a smudge.
   */
  backdrop?: (visible: boolean) => React.ReactNode
}

export function NavBody({
  children,
  className,
  visibleClassName,
  visible,
  backdrop,
}: NavBodyProps) {
  return (
    <motion.nav
      animate={{
        ...(backdrop
          ? {}
          : { backdropFilter: visible ? "blur(12px)" : "blur(0px)" }),
        width: visible ? "min(62rem, 92%)" : "100%",
        y: visible ? 14 : 0,
        borderRadius: visible ? 999 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        // The snippet hard-codes minWidth:800px inline, which makes the pill wider
        // than the viewport below 800px even though it is already hidden there.
        // Dropped in favour of the max()/% animation above.
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-5 py-2.5 lg:flex",
        className,
        visible && visibleClassName,
      )}
    >
      {backdrop?.(Boolean(visible))}
      {children}
    </motion.nav>
  )
}

interface NavItemsProps {
  items: { name: string; link: string }[]
  className?: string
  activeItem?: string
  onItemClick?: (link: string) => void
}

export function NavItems({
  items,
  className,
  activeItem,
  onItemClick,
}: NavItemsProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        // The shadow is what keeps the labels legible over the glass. Behind a
        // translucent bar the page is still visible, refracted, and the hero's
        // bright green grid and white display type pass directly under these
        // labels. A one-pixel dark halo separates each glyph from whatever is
        // behind it without darkening the bar as a whole.
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center text-sm font-medium [text-shadow:0_1px_2px_rgba(1,4,9,0.75)] lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = activeItem === item.link
        return (
          <button
            key={item.link}
            type="button"
            onMouseEnter={() => setHovered(idx)}
            onClick={() => onItemClick?.(item.link)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "relative rounded-full px-4 py-2 transition-colors duration-200",
              // Not gh-muted. That grey is tuned for body copy on a flat
              // #0d1117 page; over a moving, refracted backdrop it sat at
              // roughly the brightness of the grid behind it and the labels
              // dissolved into the field.
              isActive ? "text-gh-text" : "text-gh-text/75 hover:text-gh-text",
            )}
          >
            {hovered === idx && (
              // A lighter pane of the same glass, not a solid chip. The old
              // pill was `bg-gh-elevated`, an opaque grey slab, which sat
              // inside a translucent bar like a sticker: flat, a different
              // material, and the one thing on the bar you could not see
              // through. Translucent white lifts the item the way a pressed
              // region of glass catches more light, and the inset hairlines
              // give it the same lit top edge the bar itself has.
              <motion.span
                layoutId="nav-hover-pill"
                className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-20">{item.name}</span>
            {isActive && (
              <motion.span
                layoutId="nav-active-underline"
                className="absolute inset-x-4 -bottom-0.5 z-20 h-px bg-gh-accent"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        )
      })}
    </motion.div>
  )
}

interface MobileNavProps {
  children: React.ReactNode
  className?: string
  /** Applied only once the bar has shrunk, so the caller owns the palette. */
  visibleClassName?: string
  visible?: boolean
  /**
   * A surface painted behind the bar, given the current shrink state.
   *
   * A render prop rather than a node because only this component knows
   * `visible` (Navbar clones it in), and the surface has to fade with it.
   *
   * Supplying one also switches off the animated `backdrop-filter` below. Two
   * nested backdrop filters do not compose: the outer one establishes a
   * backdrop root, so the inner one filters an already-blurred image. A
   * refractive surface underneath a blur just looks like a smudge.
   */
  backdrop?: (visible: boolean) => React.ReactNode
}

export function MobileNav({
  children,
  className,
  visibleClassName,
  visible,
  backdrop,
}: MobileNavProps) {
  return (
    <motion.nav
      animate={{
        ...(backdrop
          ? {}
          : { backdropFilter: visible ? "blur(12px)" : "blur(0px)" }),
        width: visible ? "92%" : "100%",
        borderRadius: visible ? 16 : 0,
        y: visible ? 10 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-50 mx-auto flex w-full flex-col items-center justify-between px-4 py-2.5 lg:hidden",
        className,
        visible && visibleClassName,
      )}
    >
      {backdrop?.(Boolean(visible))}
      {children}
    </motion.nav>
  )
}

export function MobileNavHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MobileNavMenu({
  children,
  className,
  isOpen,
}: {
  children: React.ReactNode
  className?: string
  isOpen: boolean
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-2 flex w-full flex-col items-start gap-1 rounded-2xl border p-3",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function MobileNavToggle({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition duration-200 active:scale-95",
        className,
      )}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  )
}
