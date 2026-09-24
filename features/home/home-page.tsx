"use client"

import { useMemo, useRef, useState } from "react"
import { MotionConfig } from "framer-motion"
import type { BoardMember } from "@/lib/db/board-members"
import type { Event } from "@/lib/db/events"
import type { JourneyEntry } from "@/lib/db/journey"
import type { Project } from "@/lib/db/projects"
import type { Member } from "@/lib/db/members"
import type { PublicProposal } from "@/lib/db/proposals"
import type { PublicBuild } from "@/lib/db/builds"
import { navItems, spySectionIds } from "@/features/site/nav"
import { SmoothScroll } from "@/features/site/smooth-scroll"
import { useActiveSection } from "@/features/site/use-active-section"
import { SiteNavbar, NAV_OFFSET } from "@/features/site/navbar"
import { SiteFooter } from "@/features/site/footer"
import { HatchBand } from "@/components/ui/texture"
import { GhMarquee } from "@/features/home/gh-marquee"
import { QrDialog } from "@/features/join/qr-dialog"
import { HomeMascot } from "@/features/mascot/home-mascot"
import { HeroSection } from "@/features/home/sections/hero"
import { AboutSection } from "@/features/home/sections/about"
import { JourneySection } from "@/features/home/sections/journey"
import { BoardSection } from "@/features/home/sections/board"
import { EventsSection } from "@/features/home/sections/events"
import { ProjectsSection } from "@/features/home/sections/projects"
import { IdeasSection } from "@/features/home/sections/ideas"
import { BuildsSection } from "@/features/home/sections/builds"
import { BenefitsSection } from "@/features/home/sections/benefits"
import { JoinSection } from "@/features/home/sections/join"

export function HomePage(props: {
  boardMembers: BoardMember[]
  events: Event[]
  journeyEntries: JourneyEntry[]
  projects: Project[]
  members: Member[]
  proposals: PublicProposal[]
  builds: PublicBuild[]
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
        <HomeShell {...props} />
      </SmoothScroll>
    </MotionConfig>
  )
}

function HomeShell({
  boardMembers,
  events,
  journeyEntries,
  projects,
  members,
  proposals,
  builds,
}: {
  boardMembers: BoardMember[]
  events: Event[]
  journeyEntries: JourneyEntry[]
  projects: Project[]
  members: Member[]
  proposals: PublicProposal[]
  builds: PublicBuild[]
}) {
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const hasProjects = projects.length > 0
  // Recomputed only when that boolean flips, so the spy's effect is not
  // handed a fresh array on every render.
  const items = useMemo(() => navItems(hasProjects), [hasProjects])
  const sectionIds = useMemo(() => spySectionIds(hasProjects), [hasProjects])
  const activeSection = useActiveSection(sectionIds, NAV_OFFSET)
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
    <div className="relative min-h-screen overflow-x-clip bg-gh-bg font-sans text-gh-text">
      <SiteNavbar
        items={items}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
      />
      <HomeMascot heroSlotRef={heroSlotRef} />

      <main>
        <HeroSection heroSlotRef={heroSlotRef} onScrollTo={scrollToSection} />
        <GhMarquee />

        {/* The two hatch bands bracket the textured run. Everything between
            them carries the graph-paper grid and the container rules; the
            hero, the marquee and the join band do not, because each of those
            already has a surface of its own. The rule is "the hatch marks
            where the paper starts and stops" — it is deliberately not at
            every seam, which would turn a seam detail into a page motif. */}
        <HatchBand />

        <AboutSection onScrollTo={scrollToSection} />
        <JourneySection entries={journeyEntries} />
        <BoardSection members={boardMembers} clubMembers={members} />
        <EventsSection events={events} />
        {/* Absent, not empty, when there is nothing to show. The nav item and
            the scroll spy entry come and go with it. */}
        {hasProjects && <ProjectsSection projects={projects} />}
        {/* Not in the nav, on purpose: they are ways in for students outside
            the club rather than parts of the club's own story. */}
        <IdeasSection proposals={proposals} />
        <BuildsSection builds={builds} />
        <BenefitsSection />

        <HatchBand />

        <JoinSection onOpenQr={() => setIsQrPopupOpen(true)} />
      </main>

      <SiteFooter />

      <QrDialog
        isOpen={isQrPopupOpen}
        onClose={() => setIsQrPopupOpen(false)}
      />
    </div>
  )
}
