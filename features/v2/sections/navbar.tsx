"use client"

import { useState } from "react"
import { Github } from "lucide-react"
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
} from "@/components/ui/resizable-navbar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { NAV_ITEMS } from "@/features/home/content"

// The line the scroll spy tests against, and the offset section anchors need to
// clear. v1's nav is flush to the top at 64px tall; this one floats, so the two
// tuned constants that were keyed to 64px (`scroll-margin-top: 4rem` in
// globals.css and the spy's hard-coded 100) move with it. Exported so the page
// and the CSS stay in step instead of drifting apart.
export const V2_NAV_OFFSET = 112

const ITEMS = NAV_ITEMS.map((name) => ({ name, link: name.toLowerCase() }))

function Wordmark() {
  return (
    <a
      href="#hero"
      className="relative z-20 flex shrink-0 items-center gap-2.5 rounded-lg px-1 py-1 text-gray-900 dark:text-gh-text"
    >
      <Github className="h-6 w-6" aria-hidden="true" />
      <span className="text-[15px] font-extrabold tracking-tight">
        GitHub Community{" "}
        <span className="font-semibold text-gray-500 dark:text-gh-muted">
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
      className={`rounded-full bg-gh-accent-light px-4 py-2 font-mono text-[13px] font-semibold text-white transition duration-200 hover:opacity-90 active:scale-95 dark:bg-gh-accent dark:text-gh-bg ${className ?? ""}`}
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
  "dark:border-gh-border dark:bg-gh-surface/92",
  "dark:shadow-[0_8px_32px_-12px_rgba(1,4,9,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
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
          <ThemeToggle />
          <JoinButton onClick={() => go("join")} />
        </div>
      </NavBody>

      <MobileNav className={SURFACE} visibleClassName={SURFACE_VISIBLE}>
        <MobileNavHeader>
          <Wordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="border border-gray-200 text-gray-600 dark:border-gh-border dark:text-gh-muted"
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          className="border-gray-200 bg-white/95 shadow-[0_8px_32px_-12px_rgba(1,4,9,0.18)] backdrop-blur-xl dark:border-gh-border dark:bg-gh-surface/95 dark:shadow-[0_8px_32px_-12px_rgba(1,4,9,0.9)]"
        >
          {ITEMS.map((item) => (
            <button
              key={item.link}
              type="button"
              onClick={() => go(item.link)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-base font-medium transition duration-200 ${
                activeSection === item.link
                  ? "bg-gray-100 text-gray-900 dark:bg-gh-elevated dark:text-gh-text"
                  : "text-gray-500 dark:text-gh-muted"
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
