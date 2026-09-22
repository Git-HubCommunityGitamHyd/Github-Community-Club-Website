"use client"

import { useState, useEffect, useRef } from "react"
import { GhMascotToggle } from "@/components/mascot/gh-mascot-toggle"
import { GhMarquee } from "@/components/mascot/gh-marquee"
import { useMounted } from "@/lib/use-mounted"
import type { BoardMember } from "@/lib/db/board-members"
import type { Event } from "@/lib/db/events"
import { NAV_ITEMS } from "@/features/home/content"
import { HomeNav } from "@/features/home/home-nav"
import { PageSkeleton } from "@/features/home/page-skeleton"
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

export function HomePage() {
  const mounted = useMounted()
  const [activeSection, setActiveSection] = useState("hero")
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [contentLoading, setContentLoading] = useState(true)
  const heroSlotRef = useRef<HTMLDivElement>(null)
  const navSlotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mounted) return
    Promise.all([
      fetch("/api/board-members").then((res) => res.json()),
      fetch("/api/events").then((res) => res.json()),
    ])
      .then(([membersData, eventsData]) => {
        setBoardMembers(membersData)
        setEvents(eventsData)
      })
      .finally(() => setContentLoading(false))
  }, [mounted])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", ...NAV_ITEMS.map((i) => i.toLowerCase())]
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      if (currentSection) setActiveSection(currentSection)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return <PageSkeleton />

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-gray-900 dark:bg-gh-bg dark:text-gh-text">
      <HomeNav
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((open) => !open)}
        onScrollTo={scrollToSection}
        navSlotRef={navSlotRef}
      />

      <GhMascotToggle heroSlotRef={heroSlotRef} navSlotRef={navSlotRef} />
      <HeroSection heroSlotRef={heroSlotRef} onScrollTo={scrollToSection} />
      <GhMarquee />
      <StatsSection />
      <AboutSection />
      <JourneySection />
      <BoardSection members={boardMembers} loading={contentLoading} />
      <EventsSection events={events} loading={contentLoading} />
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
