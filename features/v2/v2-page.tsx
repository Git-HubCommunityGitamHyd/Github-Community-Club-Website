"use client"

import { useMemo, useRef, useState } from "react"
import { MotionConfig } from "framer-motion"
import type { BoardMember } from "@/lib/db/board-members"
import type { Event } from "@/lib/db/events"
import type { JourneyEntry } from "@/lib/db/journey"
import type { Project } from "@/lib/db/projects"
import { NAV_ITEMS } from "@/features/home/content"
import { SmoothScroll } from "@/features/v2/smooth-scroll"
import { useActiveSection } from "@/features/v2/use-active-section"
import { GhMarquee } from "@/components/mascot/gh-marquee"
import { HatchBand } from "@/components/ui/texture"
import { QRPopupCard } from "@/features/home/qr-popup-card"

// Sections still on their v1 implementation. Each phase swaps one of these
// imports for its features/v2 replacement, so /v2 stays a working page the whole
// way through rather than going dark mid-redesign. See TODO.md.
import { FooterSection } from "@/features/home/sections/footer"

// Rebuilt for v2.
import { V2Navbar, V2_NAV_OFFSET } from "@/features/v2/sections/navbar"
import { V2HeroSection } from "@/features/v2/sections/hero"
import { V2AboutSection } from "@/features/v2/sections/about"
import { V2JourneySection } from "@/features/v2/sections/journey"
import { V2BenefitsSection } from "@/features/v2/sections/benefits"
import { V2BoardSection } from "@/features/v2/sections/board"
import { V2EventsSection } from "@/features/v2/sections/events"
import { V2ProjectsSection } from "@/features/v2/sections/projects"
import { V2JoinSection } from "@/features/v2/sections/join"
import { V2Mascot } from "@/features/v2/mascot/v2-mascot"

/**
 * The nav, and with it the scroll spy, depends on whether there are any
 * projects. An empty projects section is not rendered at all, so a "Projects"
 * nav item would scroll to nothing.
 *
 * Built here rather than added to the shared NAV_ITEMS because that list is
 * still what the v1 homepage renders, and v1 has no projects section.
 */
function navItemsFor(hasProjects: boolean) {
  const names = hasProjects
    ? ["About", "Journey", "Board", "Events", "Projects", "Benefits"]
    : NAV_ITEMS
  return names.map((name) => ({ name, link: name.toLowerCase() }))
}

function sectionIdsFor(hasProjects: boolean) {
  return ["hero", ...navItemsFor(hasProjects).map((item) => item.link)]
}

export function V2Page(props: {
  boardMembers: BoardMember[]
  events: Event[]
  journeyEntries: JourneyEntry[]
  projects: Project[]
}) {
  // The shell sits inside the provider so the scroll spy can read the page's
  // single Lenis instance rather than racing it.
  // reducedMotion="user" makes framer-motion drop transform and layout
  // animations for anyone who asks for reduced motion, across every section at
  // once, while leaving opacity fades alone. Doing it per-component means one
  // new `whileInView` somewhere eventually forgets, and there are a lot of them
  // on this page now.
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <V2Shell {...props} />
      </SmoothScroll>
    </MotionConfig>
  )
}

function V2Shell({
  boardMembers,
  events,
  journeyEntries,
  projects,
}: {
  boardMembers: BoardMember[]
  events: Event[]
  journeyEntries: JourneyEntry[]
  projects: Project[]
}) {
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const hasProjects = projects.length > 0
  // Recomputed only when that boolean flips, so the spy's effect is not
  // handed a fresh array on every render.
  const navItems = useMemo(() => navItemsFor(hasProjects), [hasProjects])
  const sectionIds = useMemo(() => sectionIdsFor(hasProjects), [hasProjects])
  const activeSection = useActiveSection(sectionIds, V2_NAV_OFFSET)
  const heroSlotRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  // `overflow-x-clip` below, not `overflow-x-hidden`: `hidden` on one axis
  // forces the other to `auto`, which makes that div a scroll container — and
  // every `position: sticky` inside then resolves against a scrollport that
  // never moves, so nothing sticks (the journey year rail sat 600px above the
  // viewport). `clip` clips the same overflow without creating one.
  return (
    <div className="v2-root relative min-h-screen overflow-x-clip bg-gh-bg font-sans text-gh-text">
      <V2Navbar
        items={navItems}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
      />
      <V2Mascot heroSlotRef={heroSlotRef} />

      <main>
        <V2HeroSection heroSlotRef={heroSlotRef} onScrollTo={scrollToSection} />
        <GhMarquee />

        {/* The two hatch bands bracket the textured run. Everything between
            them carries the graph-paper grid and the container rules; the
            hero, the marquee and the join band do not, because each of those
            already has a surface of its own. The rule is "the hatch marks
            where the paper starts and stops" — it is deliberately not at
            every seam, which would turn a seam detail into a page motif. */}
        <HatchBand />

        <V2AboutSection onScrollTo={scrollToSection} />
        <V2JourneySection entries={journeyEntries} />
        <V2BoardSection members={boardMembers} />
        <V2EventsSection events={events} />
        {/* Absent, not empty, when there is nothing to show. The nav item and
            the scroll spy entry come and go with it. */}
        {hasProjects && <V2ProjectsSection projects={projects} />}
        <V2BenefitsSection />

        <HatchBand />

        <V2JoinSection onOpenQr={() => setIsQrPopupOpen(true)} />
      </main>

      <FooterSection />

      <QRPopupCard
        isOpen={isQrPopupOpen}
        onClose={() => setIsQrPopupOpen(false)}
      />
    </div>
  )
}
