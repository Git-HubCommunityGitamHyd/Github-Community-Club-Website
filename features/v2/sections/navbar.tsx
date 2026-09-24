"use client"

import { useState } from "react"
import { FaGithub } from "react-icons/fa6"
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
} from "@/components/ui/resizable-navbar"
import { GlassSurface } from "@/components/ui/glass-surface"
import { NAV_ITEMS } from "@/features/home/content"

// The line the scroll spy tests against, and the offset section anchors need to
// clear. v1's nav is flush to the top at 64px tall; this one floats, so the two
// tuned constants that were keyed to 64px (`scroll-margin-top: 4rem` in
// globals.css and the spy's hard-coded 100) move with it. Exported so the page
// and the CSS stay in step instead of drifting apart.
export const V2_NAV_OFFSET = 112

export type NavItem = { name: string; link: string }

/** Used when a caller does not supply its own, e.g. a page with no spy. */
const DEFAULT_ITEMS: NavItem[] = NAV_ITEMS.map((name) => ({
  name,
  link: name.toLowerCase(),
}))

/**
 * The lockup carried over from v1 used lucide's `Github`, a hollow stroke
 * outline, while every other GitHub mark in the v2 tree is a solid one from
 * react-icons. Two icon families in one page is the tell; next to the solid
 * marks further down the page the thin outline read as unfinished.
 *
 * `GITAM` also becomes a mono uppercase tag rather than a lighter weight of
 * the same sentence. That is the register v2 uses for every qualifier on the
 * page (section labels, the benefit proofs, event categories), and it
 * separates the club from the campus without a second font weight.
 */
function Wordmark() {
  return (
    <a
      href="#hero"
      className="group relative z-20 flex shrink-0 items-center gap-2.5 rounded-lg px-1 py-1 text-gh-text"
    >
      <FaGithub
        aria-hidden="true"
        className="h-[22px] w-[22px] transition-colors duration-300 group-hover:text-gh-accent"
      />
      <span className="flex items-baseline gap-2">
        <span className="text-[15px] font-extrabold tracking-[-0.02em]">
          GitHub Community
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-text/60 transition-colors duration-300 group-hover:text-gh-text">
          GITAM
        </span>
      </span>
    </a>
  )
}

function JoinButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full bg-gh-accent px-4 py-2 font-mono text-[13px] font-semibold text-gh-bg transition duration-200 hover:opacity-90 active:scale-95 ${className ?? ""}`}
    >
      Join →
    </button>
  )
}

/**
 * The bar itself paints nothing.
 *
 * It used to carry the surface as Tailwind classes: a `bg-gh-surface/92` fill,
 * a hairline border and a tinted shadow, faded in once the bar shrank. That
 * was a flat alpha fill doing an impression of glass, and it still carried a
 * dead `bg-white/92` pair from before light mode was removed.
 *
 * The surface is a real refractive one now, supplied through the shell's
 * backdrop slot below, so everything here stays transparent. Anything painted
 * on the bar itself would sit on top of the glass and cancel it out.
 */
const SURFACE = "border-0 bg-transparent shadow-none"

/**
 * The glass. One function so the desktop pill and the mobile sheet cannot
 * drift apart; they differ only in corner radius.
 *
 * The tuning, against React Bits' defaults:
 *
 * - `backgroundOpacity` 0.5 rather than 0. Fully transparent is the honest
 *   liquid-glass setting and it is unreadable here, because what passes under
 *   this bar is the hero's own white display type and bright green grid. 0.24
 *   was tried first and the labels still dissolved into the field. At 0.5 the
 *   middle of the bar is calm enough to read, and the refraction still shows
 *   where it matters, at the rim, which is where the displacement map is
 *   strongest anyway.
 * - `saturation` 1.4, so colour that refracts through (the accent green, the
 *   contribution grid) stays colour rather than washing to grey.
 * - `distortionScale` -150 rather than -180. The displacement is in the map's
 *   own units and this element is about 60px tall, so the default smears
 *   rather than refracts at this height.
 * - `displace` 0.6 to take the hard edge off the displaced image.
 * - `chromaticAberration` off. At a 0.5 tint the colour fringe it adds is not
 *   visible (compared side by side in the browser), and it is most of the
 *   component's cost: the filter re-runs on every frame the page composites,
 *   and the split runs it three times. See the prop's comment for numbers.
 */
function glassBackdrop(borderRadius: number) {
  return function Backdrop(visible: boolean) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <GlassSurface
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          backgroundOpacity={0.5}
          saturation={1.4}
          distortionScale={-150}
          displace={0.6}
          blur={11}
          chromaticAberration={false}
        />
      </div>
    )
  }
}

// Hoisted out of the component. Defined inline they would be a new function
// identity on every render, which remounts GlassSurface and with it the
// `useId` the filter is keyed on, so the backdrop-filter would point at a
// filter that no longer exists.
const DESKTOP_GLASS = glassBackdrop(999)
const MOBILE_GLASS = glassBackdrop(16)

export function V2Navbar({
  items = DEFAULT_ITEMS,
  activeSection,
  onScrollTo,
}: {
  items?: NavItem[]
  activeSection: string
  onScrollTo: (sectionId: string) => void
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const go = (link: string) => {
    setIsMobileMenuOpen(false)
    onScrollTo(link)
  }

  return (
    <Navbar>
      <NavBody className={SURFACE} backdrop={DESKTOP_GLASS}>
        <Wordmark />
        <NavItems items={items} activeItem={activeSection} onItemClick={go} />
        <div className="relative z-20 flex shrink-0 items-center gap-3">
          <JoinButton onClick={() => go("join")} />
        </div>
      </NavBody>

      <MobileNav className={SURFACE} backdrop={MOBILE_GLASS}>
        <MobileNavHeader>
          <Wordmark />
          <div className="flex items-center gap-2">
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="border border-gh-border text-gh-muted"
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          className="border-gh-border bg-gh-surface/95 shadow-[0_8px_32px_-12px_rgba(1,4,9,0.9)] backdrop-blur-xl"
        >
          {items.map((item) => (
            <button
              key={item.link}
              type="button"
              onClick={() => go(item.link)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-base font-medium transition duration-200 ${
                activeSection === item.link
                  ? "bg-gh-elevated text-gh-text"
                  : "text-gh-muted"
              }`}
            >
              {item.name}
            </button>
          ))}
          <JoinButton onClick={() => go("join")} className="mt-2 w-full" />
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
