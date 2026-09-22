"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Mail, MapPin, Instagram, Menu, X } from "lucide-react"
import { EnhancedButton } from "@/components/enhanced-button"
import ScrollStack, { ScrollStackItem } from "@/components/scroll-stack"
import ParticleText from "@/components/particle-text"
import { BoardMemberPopupCard } from "@/components/board-member-popup-card"
import { EventPopupCard } from "@/components/event-popup-card"
import { EnhancedTimeline } from "@/components/enhanced-timeline"
import { QRPopupCard } from "@/components/qr-popup-card"
import { JoinForm } from "@/components/join-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { GhMascotToggle } from "@/components/gh-mascot-toggle"
import { GhMarquee } from "@/components/gh-marquee"
import { JoinSquares } from "@/components/join-squares"
import { PageSkeleton } from "@/components/page-skeleton"
import { useMounted } from "@/lib/use-mounted"

const NAV_ITEMS = ["About", "Journey", "Board", "Events", "Benefits"]

const STATS = [
  { value: "2022", label: "Founded" },
  { value: "700+", label: "Members" },
  { value: "30+", label: "Events hosted" },
  { value: "3", label: "Campuses" },
]

const PILLARS = [
  {
    code: "</>",
    title: "Open Source",
    desc: "Contributing to and maintaining open source projects",
  },
  {
    code: "CM",
    title: "Community",
    desc: "Building connections and fostering collaboration",
  },
  {
    code: "IN",
    title: "Innovation",
    desc: "Driving technological innovation and learning",
  },
]

const BENEFITS = [
  {
    title: "Skill Development",
    desc: "Learn cutting-edge technologies and best practices through workshops and peer learning",
  },
  {
    title: "Networking",
    desc: "Connect with like-minded developers, industry professionals, and potential collaborators",
  },
  {
    title: "Recognition",
    desc: "Showcase your contributions and achievements within the community and beyond",
  },
  {
    title: "Open Source",
    desc: "Contribute to meaningful projects and build a strong portfolio of open source work",
  },
  {
    title: "Mentorship",
    desc: "Get guidance from experienced developers and mentor newcomers to the field",
  },
  {
    title: "Innovation",
    desc: "Work on cutting-edge projects and stay ahead of technology trends",
  },
]

type BoardMemberRecord = {
  id: number
  name: string
  role: string
  image_url: string | null
  description: string
  github: string | null
  linkedin: string | null
  email: string | null
}

type EventRecord = {
  id: number
  title: string
  event_date: string
  location: string | null
  attendees: number | null
  category: string
  duration: string | null
  description: string
  images: string[]
}

export default function GitHubCommunityPortfolio() {
  const mounted = useMounted()
  const [activeSection, setActiveSection] = useState("hero")
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [boardMembers, setBoardMembers] = useState<BoardMemberRecord[]>([])
  const [events, setEvents] = useState<EventRecord[]>([])
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
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gh-border dark:bg-gh-bg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Github className="h-7 w-7" />
              <span className="text-base font-extrabold tracking-tight sm:text-[17px]">
                GitHub Community{" "}
                <span className="font-semibold text-gray-500 dark:text-gh-muted">
                  GITAM
                </span>
              </span>
            </div>

            <div className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    activeSection === item.toLowerCase()
                      ? "text-black dark:text-gh-text"
                      : "text-gray-500 hover:text-black dark:text-gh-muted dark:hover:text-gh-text"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => scrollToSection("join")}
                className="rounded-md bg-gh-accent-light px-4 py-2 font-mono text-[13px] font-semibold text-white hover:opacity-90 dark:bg-gh-accent dark:text-gh-bg"
              >
                Join →
              </button>
              {/* Reserves the docked spot — the real mascot floats above it
                  as a fixed-position element (see GhMascotToggle below). */}
              <div ref={navSlotRef} className="h-16 w-20" />
            </div>

            {/* Mobile: theme toggle stays reachable, links collapse into a menu */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 dark:border-gh-border dark:text-gh-muted"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="overflow-hidden border-t border-gray-200 dark:border-gh-border md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col px-4 py-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`py-3 text-left text-base font-medium ${
                      activeSection === item.toLowerCase()
                        ? "text-black dark:text-gh-text"
                        : "text-gray-500 dark:text-gh-muted"
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection("join")}
                  className="mt-3 rounded-md bg-gh-accent-light px-4 py-3 text-center font-mono text-sm font-semibold text-white dark:bg-gh-accent dark:text-gh-bg"
                >
                  Join Community →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <GhMascotToggle heroSlotRef={heroSlotRef} navSlotRef={navSlotRef} />

      {/* Hero */}
      <section
        id="hero"
        className="relative overflow-hidden pt-16"
        style={{ minHeight: "480px" }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:pt-32 lg:px-8">
          {/* Marks where the big mascot sits at rest — GhMascotToggle
              measures this and animates toward navSlotRef on scroll. It
              lives INSIDE the max-w-7xl container, with insets matching the
              container's own padding, so it lines up with the right edge of
              the content. Anchored to the section instead, it hugged the
              viewport edge and left a dead gap beside the headline.
              Aspect ratio must stay 1.25 to match navSlotRef (h-16 w-20). */}
          <div
            ref={heroSlotRef}
            className="pointer-events-none absolute right-4 top-16 hidden h-[176px] w-[220px] sm:right-6 md:block lg:right-8 lg:h-[288px] lg:w-[360px]"
            aria-hidden="true"
          />
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-7 text-[clamp(44px,8vw,108px)] font-extrabold leading-[0.96] tracking-tight"
          >
            GitHub
            <br />
            Community
            <span className="text-black dark:text-gh-accent">.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pt-4"
          >
            <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gh-muted sm:text-xl">
              Empowering developers, fostering collaboration, and building the
              future of open source at GITAM University.
            </p>
            <div className="flex flex-wrap gap-3">
              <EnhancedButton
                size="lg"
                type="primary"
                onClick={() => scrollToSection("journey")}
              >
                Our Story
              </EnhancedButton>
              <EnhancedButton
                size="lg"
                variant="outline"
                type="secondary"
                colorScheme="community"
                onClick={() => scrollToSection("join")}
              >
                Join Community
              </EnhancedButton>
            </div>
          </motion.div>
        </div>
      </section>

      <GhMarquee />

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-l border-gray-200 pl-4 dark:border-gh-border"
            >
              <div className="font-mono text-[clamp(28px,4vw,44px)] font-bold tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gh-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
          01 — ABOUT
        </span>
        <h2 className="mb-5 mt-4 max-w-3xl text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-tight tracking-tight">
          A community of builders, designers, and open-source contributors.
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
          We are a vibrant community of developers, designers, and tech
          enthusiasts at GITAM University, dedicated to promoting open source
          culture and collaborative development.
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-gh-border dark:bg-gh-border sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="bg-white p-7 dark:bg-gh-bg">
              <div className="mb-3 font-mono text-lg font-bold text-black dark:text-gh-accent">
                {pillar.code}
              </div>
              <div className="mb-2 text-lg font-bold">{pillar.title}</div>
              <div className="text-sm leading-relaxed text-gray-600 dark:text-gh-muted">
                {pillar.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey / Timeline */}
      <section
        id="journey"
        className="border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
      >
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
            02 — JOURNEY
          </span>
          <h2 className="mb-14 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
            From the start.
          </h2>

          <EnhancedTimeline
            items={[
              {
                date: "February 2022",
                title: "Community Founded",
                description:
                  "GitHub in GITAM was initiated by Srinija Dharani. She was the campus expert from GitHub and the pioneer of GitHub in GITAM.",
              },
              {
                date: "February 2023",
                title: "First Flagship Event",
                description:
                  "Conducted our first major event, EPOCH, with participants from multiple colleges",
              },
              {
                date: "May 2023",
                title: "GITAM Ace Award",
                description:
                  "We were awarded the GITAM Ace Award for outstanding contributions to the tech community and got promoted from SIG to Club",
              },
              {
                date: "July 2023",
                title: "New Executive Board",
                description:
                  "One president from Vizag and 3 vice presidents from Vizag, Hyderabad and Bengaluru were appointed",
              },
              {
                date: "December 2023",
                title: "Second Flagship Event",
                description:
                  "Hosted our second flagship event, EPOCH 2.0, with over 200 participants with multiple workshops and competitions across three campuses.",
              },
              {
                date: "July 2024",
                title: "New Club Structure and Executive Board",
                description:
                  "Decentralized the club structure with each campus having it's own executive board",
              },
              {
                date: "October 2024",
                title: "700+ Members",
                description:
                  "The community reached over 700 members across all campuses",
              },
              {
                date: "December 2024",
                title: "Third Flagship Event",
                description:
                  "Hosted our third flagship event, EPOCH 3.0, with over 200 participants and multiple workshops and competitions in the Hyderabad campus.",
              },
            ]}
          />
        </div>
      </section>

      {/* Executive Board */}
      <section
        id="board"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
          03 — BOARD
        </span>
        <h2 className="mb-3 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
          Executive Board.
        </h2>
        <p className="mb-12 text-lg text-gray-600 dark:text-gh-muted">
          Meet the leaders driving our community forward — click any card for
          the full story.
        </p>

        {/* Wraps to 3 + 2 centered on desktop, 2 up on tablet, 1 up on phones */}
        <div className="flex flex-wrap justify-center gap-8">
          {contentLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
                >
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 p-8 dark:border-gh-border">
                    <div className="skeleton h-20 w-20 rounded-full" />
                    <div className="skeleton h-5 w-32 rounded-lg" />
                    <div className="skeleton h-4 w-24 rounded-lg" />
                  </div>
                </div>
              ))
            : boardMembers.map((member, idx) => (
                <div
                  key={member.id}
                  className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
                >
                  <BoardMemberPopupCard
                    index={idx}
                    member={{
                      name: member.name,
                      role: member.role,
                      image: member.image_url ?? "/placeholder.svg",
                      description: member.description,
                      github: member.github ?? undefined,
                      linkedin: member.linkedin ?? undefined,
                      email: member.email ?? undefined,
                    }}
                  />
                </div>
              ))}
        </div>
      </section>

      {/* Events */}
      <section
        id="events"
        className="border-y border-gray-200 bg-gray-50 dark:border-gh-border dark:bg-gh-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
            04 — EVENTS
          </span>
          <h2 className="mb-3 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
            Events from last year.
          </h2>
          <p className="mb-12 text-lg text-gray-600 dark:text-gh-muted">
            Highlights from our community gatherings and workshops.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contentLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-80 flex-col items-center gap-4 rounded-2xl border border-gray-200 p-8 dark:border-gh-border"
                  >
                    <div className="skeleton h-16 w-16 rounded-full" />
                    <div className="skeleton h-5 w-40 rounded-lg" />
                    <div className="skeleton h-4 w-32 rounded-lg" />
                  </div>
                ))
              : events.map((event, index) => (
                  <EventPopupCard
                    key={event.id}
                    index={index}
                    event={{
                      title: event.title,
                      date: event.event_date,
                      location: event.location ?? undefined,
                      attendees: event.attendees ?? undefined,
                      category: event.category,
                      duration: event.duration ?? undefined,
                      description: event.description,
                      images: event.images,
                    }}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="benefits"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
          05 — BENEFITS
        </span>
        <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
          Why join us?
        </h2>

        <ScrollStack
          useWindowScroll
          itemDistance={60}
          itemStackDistance={24}
          // Fixed pixels, not percentages: a "%" value is a fraction of
          // window.innerHeight, so on a tall/large monitor it keeps growing
          // even though the card itself (h-80, a fixed 320px) doesn't — the
          // gap above the stack was scaling with the user's screen while
          // the content stayed the same size, which is exactly why it kept
          // reading as "huge" on a large display no matter how small a
          // percentage was chosen. Must stay <= the scroll-stack inner's
          // leading pt (see scroll-stack.tsx) or the first card's trigger
          // point goes negative and it pins at full displacement before any
          // real scrolling happens — parsePercentage() (scroll-stack.tsx)
          // treats a plain number-as-string like this as absolute px.
          stackPosition="110"
          scaleEndPosition="40"
          baseScale={0.88}
        >
          {BENEFITS.map((benefit, index) => (
            <ScrollStackItem
              key={benefit.title}
              itemClassName="flex flex-col justify-between border border-l-4 border-gray-200 border-l-black bg-white dark:border-gh-border dark:border-l-gh-accent dark:bg-gh-surface"
            >
              <span className="font-mono text-sm font-bold text-gray-300 dark:text-gh-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {benefit.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600 dark:text-gh-muted sm:text-lg">
                  {benefit.desc}
                </p>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </section>

      {/* Join */}
      <section id="join" className="relative">
        <div className="relative overflow-hidden bg-black text-white">
          <JoinSquares />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
            <div className="inline-block rounded-3xl bg-black/70 p-10 backdrop-blur-md sm:p-14">
              <span className="font-mono text-[13px] font-bold text-gh-accent">
                06 — JOIN
              </span>
              <h2 className="mb-5 mt-4 text-[clamp(36px,6vw,72px)] font-extrabold tracking-tight">
                Build what&apos;s next with us.
              </h2>
              <p className="mx-auto mb-2 max-w-lg text-lg text-gray-400">
                Open to every student at GITAM — no experience required, just
                curiosity.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("join-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="mx-auto block w-full max-w-md cursor-pointer"
                aria-label="Join Our Community"
              >
                <ParticleText
                  text="Join Our Community"
                  trigger="hover"
                  color="#ffffff"
                  highlightColor="#3fb950"
                  fontSize="clamp(1.75rem, 4.5vw, 2.75rem)"
                  fontWeight={800}
                  particleSize={2}
                  density={3}
                  scatter={120}
                  gatherDuration={1000}
                  stagger={280}
                  pointerRepel={30}
                  repelRadius={90}
                  idleDrift={0.4}
                  glow
                />
              </button>
            </div>
          </div>
        </div>

        <div id="join-form" className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                Apply to join
              </h3>
              <p className="text-gray-600 dark:text-gh-muted">
                Fill out the form and we&apos;ll be in touch —{" "}
                <button
                  onClick={() => setIsQrPopupOpen(true)}
                  className="font-medium text-black underline underline-offset-2 dark:text-gh-accent"
                >
                  prefer WhatsApp instead?
                </button>
              </p>
            </motion.div>

            <JoinForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-gray-800 pb-10 sm:grid-cols-3">
            <div>
              <div className="mb-3.5 flex items-center gap-2.5">
                <Github className="h-7 w-7" />
                <span className="text-base font-extrabold">
                  GitHub Community GITAM
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-gray-400">
                Empowering the next generation of developers through
                collaboration and open source.
              </p>
            </div>

            <div>
              <div className="mb-4 font-mono text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Quick Links
              </div>
              <div className="flex flex-col gap-2.5">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 font-mono text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Contact
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:github.gitamhyd@gmail.com">
                    github.gitamhyd@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>GITAM University, Hyderabad</span>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <a
                    href="https://instagram.com/github.gitam.hyd"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @github.gitam.hyd
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-7 text-center font-mono text-xs text-gray-500">
            <div>© 2026 GitHub Community GITAM. All rights reserved.</div>
            <div>
              <a
                href="https://skfb.ly/oHnR9"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
              >
                &quot;GitHub Octocat&quot;
              </a>{" "}
              by pissang is licensed under{" "}
              <a
                href="http://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-300"
              >
                Creative Commons Attribution
              </a>
            </div>
          </div>
        </div>
      </footer>

      <QRPopupCard
        isOpen={isQrPopupOpen}
        onClose={() => setIsQrPopupOpen(false)}
      />
    </div>
  )
}
