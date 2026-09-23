"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev "colorful" button, re-toned.
 *
 * What the snippet actually contributes is the *mechanic*, not the colours: a
 * solid button with a blurred gradient wash sitting behind it, which bleeds
 * past the button's own edge and intensifies on hover. That is a good idea —
 * it gives a flat CTA a light source without adding a border or a shadow.
 *
 * The colours are dropped. The snippet washes indigo into purple into pink at
 * 40% opacity, which is three hues, none of them this site's, on a page whose
 * entire palette is neutral surfaces plus one GitHub green. It would be the
 * only place on the page those hues appear, and it is the single most
 * important button on the site. The wash is the accent's own ramp instead —
 * light green through the two accent greens — so it reads as the button
 * glowing rather than as a different brand's button.
 *
 * Two other departures from the snippet:
 *
 * - `overflow-hidden` is gone. Clipping the wash to the button's box is what
 *   makes it look like a gradient *fill*; letting it bleed (`-inset-1` plus
 *   blur) is what makes it look like light coming off the button. The snippet
 *   has both `overflow-hidden` and `blur`, which cancel out.
 * - The arrow is `ArrowRight`, not `ArrowUpRight`. Up-right means "leaves this
 *   page"; every use here scrolls further down it.
 */
export interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  /** Set false for a button that stays on the page (no arrow). */
  showArrow?: boolean
}

export function ButtonColorful({
  className,
  label = "Join the community",
  showArrow = true,
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        "group relative h-12 rounded-full px-7 text-[15px] font-semibold",
        "bg-gh-accent-light text-white dark:bg-gh-accent dark:text-gh-deep",
        "transition-transform duration-200 hover:bg-gh-accent-light active:scale-[0.98] dark:hover:bg-gh-accent",
        "focus-visible:ring-gh-accent-light focus-visible:ring-offset-white dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-bg",
        className,
      )}
      {...props}
    >
      {/* The wash. `-inset-1` and `-z-10` put it behind and just outside the
          button so the blur reads as spill rather than as a fill. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -inset-1 -z-10 rounded-full blur-md",
          "bg-[linear-gradient(90deg,#7ee787_0%,#3fb950_45%,#1a7f37_100%)]",
          "opacity-45 transition-opacity duration-500 group-hover:opacity-90",
        )}
      />

      <span className="relative flex items-center justify-center gap-2">
        {label}
        {showArrow && (
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        )}
      </span>
    </Button>
  )
}
