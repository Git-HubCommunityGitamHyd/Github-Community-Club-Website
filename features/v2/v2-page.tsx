"use client"

import { useRef, useState } from "react"
import { MotionConfig } from "framer-motion"
import type { BoardMember } from "@/lib/db/board-members"
import type { Event } from "@/lib/db/events"
import { NAV_ITEMS } from "@/features/home/content"
import { SmoothScroll } from "@/features/v2/smooth-scroll"
import { useActiveSection } from "@/features/v2/use-active-section"
import { GhMarquee } from "@/components/mascot/gh-marquee"
import { QRPopupCard } from "@/features/home/qr-popup-card"

// Sections still on their v1 implementation. Each phase swaps one of these
// imports for its features/v2 replacement, so /v2 stays a working page the whole
// way through rather than going dark mid-redesign. See TODO.md.
import { StatsSection } from "@/features/home/sections/stats"
import { AboutSection } from "@/features/home/sections/about"
import { FooterSection } from "@/features/home/sections/footer"

// Rebuilt for v2.
import { V2Navbar, V2_NAV_OFFSET } from "@/features/v2/sections/navbar"
import { V2HeroSection } from "@/features/v2/sections/hero"
import { V2JourneySection } from "@/features/v2/sections/journey"
import { V2BenefitsSection } from "@/features/v2/sections/benefits"
import { V2BoardSection } from "@/features/v2/sections/board"
import { V2EventsSection } from "@/features/v2/sections/events"
import { V2JoinSection } from "@/features/v2/sections/join"
import { V2Mascot } from "@/features/v2/mascot/v2-mascot"

// Module scope, not rebuilt per render — it is a dependency of the spy's effect.
const SECTION_IDS = ["hero", ...NAV_ITEMS.map((item) => item.toLowerCase())]

export function V2Page(props: {
  boardMembers: BoardMember[]
  events: Event[]
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
}: {
  boardMembers: BoardMember[]
  events: Event[]
}) {
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const activeSection = useActiveSection(SECTION_IDS, V2_NAV_OFFSET)
  const heroSlotRef = useRef<HTMLDivElement>(null)
  const navSlotRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="v2-root relative min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 dark:bg-gh-bg dark:text-gh-text">
      <V2Navbar
        activeSection={activeSection}
        onScrollTo={scrollToSection}
        navSlotRef={navSlotRef}
      />
      <V2Mascot heroSlotRef={heroSlotRef} navSlotRef={navSlotRef} />

      <main>
        <V2HeroSection heroSlotRef={heroSlotRef} onScrollTo={scrollToSection} />
        <GhMarquee />
        <StatsSection />
        <AboutSection />
        <V2JourneySection />
        <V2BoardSection members={boardMembers} />
        <V2EventsSection events={events} />
        <V2BenefitsSection />
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
