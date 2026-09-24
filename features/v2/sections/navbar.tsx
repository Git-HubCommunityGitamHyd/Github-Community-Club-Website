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
import { NAV_ITEMS } from "@/features/home/content"

// The line the scroll spy tests against, and the offset section anchors need to
// clear. v1's nav is flush to the top at 64px tall; this one floats, so the two
// tuned constants that were keyed to 64px (`scroll-margin-top: 4rem` in
// globals.css and the spy's hard-coded 100) move with it. Exported so the page
// and the CSS stay in step instead of drifting apart.
export const V2_NAV_OFFSET = 112

const ITEMS = NAV_ITEMS.map((name) => ({ name, link: name.toLowerCase() }))

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
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted transition-colors duration-300 group-hover:text-gh-text">
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

// Surface shared by the desktop pill and the mobile sheet. Kept in one constant
// so the two cannot drift: translucent GitHub surface, hairline border, and a
// shadow tinted toward the palette rather than the snippet's neutral greys.
const SURFACE =
  "border border-transparent bg-transparent shadow-none transition-[background-color,border-color,box-shadow] duration-300"

// Real glass rather than a flat alpha fill: an outer tinted shadow for lift plus
// a 1px inset highlight along the top edge, which is what sells the refraction.
// Opacity is high enough that bright content underneath (the stat figures) reads
// as blurred-through rather than legible through a see-through bar.
const SURFACE_VISIBLE = [
  "border-gray-200/70 bg-white/92",
  "shadow-[0_8px_32px_-12px_rgba(1,4,9,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
  "border-gh-border bg-gh-surface/92",
  "shadow-[0_8px_32px_-12px_rgba(1,4,9,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
].join(" ")

export function V2Navbar({
  activeSection,
  onScrollTo,
}: {
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
      <NavBody className={SURFACE} visibleClassName={SURFACE_VISIBLE}>
        <Wordmark />
        <NavItems items={ITEMS} activeItem={activeSection} onItemClick={go} />
        <div className="relative z-20 flex shrink-0 items-center gap-3">
          <JoinButton onClick={() => go("join")} />
        </div>
      </NavBody>

      <MobileNav className={SURFACE} visibleClassName={SURFACE_VISIBLE}>
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
          {ITEMS.map((item) => (
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
