"use client"

import { useState, useEffect, useRef } from "react"
import { GhMascotDock } from "@/components/mascot/gh-mascot-dock"
import { MascotGlow } from "@/components/mascot/mascot-glow"
import { GhMarquee } from "@/components/mascot/gh-marquee"
import type { BoardMember } from "@/lib/db/board-members"
import type { Event } from "@/lib/db/events"
import { NAV_ITEMS } from "@/features/home/content"
import { HomeNav } from "@/features/home/home-nav"
import { QRPopupCard } from "@/features/home/qr-popup-card"
import { HeroSection } from "@/features/home/sections/hero"
import { StatsSection } from "@/features/home/sections/stats"
import { AboutSection } from "@/features/home/sections/about"
import { JourneySection } from "@/features/home/sections/journey"
import { BoardSection } from "@/features/home/sections/board"
import { EventsSection } from "@/features/home/sections/events"
import { BenefitsSection } from "@/features/home/sections/benefits"
import { JoinSection } from "@/features/home/sections/join"
import { FooterSection } from "@/features/home/sections/footer"

export function HomePage({
  boardMembers,
  events,
}: {
  boardMembers: BoardMember[]
  events: Event[]
}) {
  const [activeSection, setActiveSection] = useState("hero")
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const heroSlotRef = useRef<HTMLDivElement>(null)
  const navSlotRef = useRef<HTMLDivElement>(null)

  // Scroll spy. The active section is whichever one spans the line 100px
  // down the viewport — the same test this always used. What changed is
  // when that test runs: it used to be an unthrottled `scroll` listener
  // measuring every section on every event, competing with the mascot's
  // WebGL canvas and the benefits ScrollStack for the same frames. Now an
  // IntersectionObserver watches a 1px band pinned at that line and only
  // wakes us when a section boundary actually crosses it.
  useEffect(() => {
    const elements = ["hero", ...NAV_ITEMS.map((i) => i.toLowerCase())]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    // Deliberately re-measures instead of trusting the entries handed to
    // the callback. A jump that clears several sections at once (nav
    // click, Home/End, a fast wheel flick) delivers their enter and leave
    // records in one batch, and the section that ends up under the line
    // may have no `isIntersecting` record in it at all — reading the
    // batch would then leave the nav stuck on a section already scrolled
    // past. Measuring here costs a handful of rects per crossing rather
    // than per scroll event.
    const resolve = () => {
      const current = elements.find((el) => {
        const rect = el.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 100
      })
      if (current) setActiveSection(current.id)
    }

    let observer: IntersectionObserver | null = null

    // rootMargin takes no calc(), so the bottom inset that collapses the
    // root box down to that 1px band has to be recomputed from the live
    // viewport height whenever it changes.
    const observe = () => {
      observer?.disconnect()
      const bottom = Math.max(window.innerHeight - 101, 0)
      observer = new IntersectionObserver(resolve, {
        rootMargin: `-100px 0px -${bottom}px 0px`,
      })
      for (const el of elements) observer.observe(el)
    }

    observe()
    window.addEventListener("resize", observe)
    return () => {
      window.removeEventListener("resize", observe)
      observer?.disconnect()
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gh-bg text-gh-text">
      <HomeNav
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((open) => !open)}
        onScrollTo={scrollToSection}
        navSlotRef={navSlotRef}
      />

      <MascotGlow />
      <GhMascotDock heroSlotRef={heroSlotRef} navSlotRef={navSlotRef} />
      <HeroSection heroSlotRef={heroSlotRef} onScrollTo={scrollToSection} />
      <GhMarquee />
      <StatsSection />
      <AboutSection />
      <JourneySection />
      <BoardSection members={boardMembers} />
      <EventsSection events={events} />
      <BenefitsSection />
      <JoinSection onOpenQr={() => setIsQrPopupOpen(true)} />
      <FooterSection />

      <QRPopupCard
        isOpen={isQrPopupOpen}
        onClose={() => setIsQrPopupOpen(false)}
      />
    </div>
  )
}
