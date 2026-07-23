"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Github,
  Users,
  Star,
  GitBranch,
  Code,
  Zap,
  Trophy,
  ChevronDown,
  Mail,
  MapPin,
  Instagram,
  Menu,
  X,
} from "lucide-react"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnimatedBackground } from "@/components/animated-background"
import { EnhancedButton } from "@/components/enhanced-button"
import { PopupCard } from "@/components/popup-card"
import { InteractiveCard } from "@/components/interactive-card"
import Image from "next/image"
import { FloatingGitHubElements } from "@/components/floating-github-elements"
import { BoardMemberPopupCard } from "@/components/board-member-popup-card"
import { EventPopupCard } from "@/components/event-popup-card"
import { EnhancedTimeline } from "@/components/enhanced-timeline"
import { QRPopupCard } from "@/components/qr-popup-card"
import { JoinForm } from "@/components/join-form"
import { EnhancedBackgroundElements } from "@/components/enhanced-background-elements"
import { ThemeToggle } from "@/components/theme-toggle"
import { PageSkeleton } from "@/components/page-skeleton"

const NAV_ITEMS = ["About", "Board", "Events", "Timeline", "Join", "Benefits"]

export default function GitHubCommunityPortfolio() {
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [isQrPopupOpen, setIsQrPopupOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  useEffect(() => setMounted(true), [])
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

  // Board members data with detailed information
  const boardMembers = [
    {
      name: "K Shreya",
      role: "President",
      image: "/images/board/k-shreya.jpeg",
      description:
        "B.Tech student with a passion for UX/UI designing and crafting impactful digital experiences. She currently serves as the President of the GitHub Community at GITAM, leading tech initiatives and creative collaborations. With a strong focus on user-centered design, she builds intuitive and functional interfaces. Always curious and driven, she blends design thinking with leadership to bring ideas to life.",
      github: "shreyak-1",
      linkedin: "shreya-kondur-0291a0293",
      email: "skondur2@gitam.in",
    },
    {
      name: "C Harshavardhan Reddy",
      role: "Vice President",
      image: "/images/board/c-harshavardhan.jpeg",
      description:
        "B.Tech CSE (AI/ML) student with a passion for Full Stack Development and AI-driven innovation. He actively explores Web3, Blockchain, and the future of intelligent systems. With a strong interest in building impactful tech, he blends software engineering with machine learning to solve real-world problems. Always curious and hands-on, he enjoys gaming, creative editing, and collaborating on projects that make a difference.",
      github: "igharsha7",
      linkedin: "igharsha7",
      email: "hchallap@gitam.in",
    },
    {
      name: "Inukurthi Sri Venkata Sai Guru",
      role: "Secretary",
      image: "/images/board/i-saiguru.jpeg",
      description:
        "A driven and curious techie with a strong focus on AI/ML, Data structures, and automation. As Secretary of the GitHub Community Club at GITAM, he leads with a mission to foster innovation, peer learning, and open-source collaboration. With hands-on experience in building intelligent applications and guiding community initiatives, he bridges the gap between learning and real-world impact. Known for his enthusiasm and creative mindset, he’s passionate about empowering fellow students through projects, workshops, and impactful technical events. Always exploring, always building — with purpose and passion.",
      github: "SaiGuruInukurthi",
      linkedin: "inukurthisaiguru",
      email: "sinukurt@gitam.in",
    },
    {
      name: "P Vihaan Rao",
      role: "Event Coordinator",
      image: "/images/board/p-vihaan.png",
      description:
        "Tech enthusiast with a passion for coding, web development, and organizing impactful events. He enjoys building innovative, user-friendly solutions that blend technology with creativity. With hands-on experience in both development and event coordination, he thrives in collaborative environments that drive meaningful impact. Always eager to learn and grow, he brings energy and purpose to every project he’s part of.",
      github: "PVihaan",
      linkedin: "vihaan-rao-paidipelly-43608828b",
      email: "vpaidipe@gitam.in",
    },
    {
      name: "Arushi Deshpande",
      role: "Head of Operations",
      image: "/images/board/arushi.png",
      description:
        "B.Tech CSE student with a growing passion for tech and a strong belief in the power of teamwork. She thrives in collaborative spaces leading projects, learning alongside peers, and bringing ideas to life. Driven by personal growth and open conversations, she aims to create environments where everyone feels valued and heard. Still exploring, always evolving and committed to giving her best every step of the way.",
      github: "ArushiDeshpande27",
      linkedin: "arushi-deshpande-1b2752319",
      email: "adeshpan2@gitam.in",
    },
  ]

  // Events data with detailed information
  const events = [
    {
      title: "Intro to Web Frameworks",
      date: "August 12, 2024",
      location: "J Block - 311",
      attendees: 45,
      category: "Workshop",
      duration: "2 hours",
      description:
        "This hands-on workshop, facilitated by Eshway, introduced participants to modern web frameworks. Students explored both frontend and backend technologies, gaining insights into the MVC architecture, server-client interactions, and deployment strategies. By the end of the session, attendees had built functional web applications, making them industry-ready for real-world development projects.",
      images: [
        "/images/events/eshway-1.jpg",
        "/images/events/eshway-2.jpg",
        "/images/events/eshway-3.jpg",
        "/images/events/eshway-4.jpg",
        "/images/events/eshway-5.jpg",
        "/images/events/eshway-6.jpg",
      ],
    },
    {
      title: "Git Set Go",
      date: "September 26, 2024",
      location: "J Block - 311",
      attendees: 50,
      category: "Theory Session",
      duration: "2 hours",
      description:
        "Git Set Go served as an introductory workshop on Git and GitHub. Tailored for beginners, the session covered essential version control concepts, including repository creation, branching, pull requests, and collaborative workflows. The practical exercises enabled students to navigate Git commands and understand open-source contribution pipelines, laying a strong foundation for collaborative coding.",
      images: [
        "/images/events/gsg-1.jpg",
        "/images/events/gsg-2.jpg",
        "/images/events/gsg-3.jpeg",
        "/images/events/gsg-4.jpg",
        "/images/events/gsg-5.jpg",
        "/images/events/gsg-6.jpg",
      ],
    },
    {
      title: "UX/UI Redesign Challenge",
      date: "October 20–26, 2024",
      location: "Virtual Competition",
      attendees: 30,
      category: "Competition",
      duration: "7 Days",
      description:
        "The UX/UI Redesign Challenge was a week-long initiative focused on enhancing user experience in real-world applications. Participants engaged in identifying usability flaws in existing apps and applied principles of wireframing, prototyping, and user testing. The event emphasized accessibility, responsiveness, and human-centered design, allowing students to develop a critical eye for effective UI/UX.",
      images: [
        "/images/events/urc-1.png",
        "/images/events/urc-2.png",
        "/images/events/urc-3.png",
        "/images/events/urc-4.jpeg",
      ],
    },
    {
      title: "CodeCraft",
      date: "October 28, 2024",
      location: "J Block - 311",
      attendees: 60,
      category: "Theory Session",
      duration: "2 hours",
      description:
        "Focused on competitive programming and problem-solving, CodeCraft introduced students to Data Structures and Algorithms (DSA) in a practical context. The event included live coding rounds, mentorship from experienced programmers, and algorithmic challenges. Participants enhanced their analytical thinking and improved their preparedness for technical interviews and hackathons.",
      images: [
        "/images/events/cc-1.jpg",
        "/images/events/cc-2.jpg",
        "/images/events/cc-3.jpg",
        "/images/events/cc-4.jpg",
        "/images/events/cc-5.jpg",
        "/images/events/cc-6.png",
      ],
    },
    {
      title: "Introduction to AIML with Python",
      date: "December 18, 2024",
      location: "J Block - 311",
      attendees: 80,
      category: "Theory Session",
      duration: "2 hours",
      description:
        "The Introduction to AIML with Python session offered students a beginner-friendly overview of Artificial Intelligence and Machine Learning. Participants learned about core ML and DL concepts, Python libraries, and how to set up their development environments. It served as a foundational step for those aiming to explore real-world AIML projects in both academia and industry.",
      images: [],
    },
    {
      title: "Git It Done: Advanced Git Operations",
      date: "December 18, 2024",
      location: "J Block - 311",
      attendees: 60,
      category: "Theory Session",
      duration: "2 hours",
      description:
        "The Git It Done: Advanced Git Operations workshop focused on version control using Git and GitHub. Attendees practiced branching strategies, pull requests, conflict resolution, and workflow automation with GitHub Actions. The session also highlighted ways to enhance GitHub profiles, offering practical insights for students to showcase their work professionally.",
      images: [],
    },
  ]

  return (
    // overflow-x-hidden: slide-in reveals animate from ±100px and would otherwise
    // hand phones a horizontal scrollbar
    <div className="relative min-h-screen overflow-x-hidden bg-white text-gray-900 dark:bg-gh-bg dark:text-gh-text">
      {/* Animated Background Elements */}
      <AnimatedBackground />
      <FloatingGitHubElements />
      <EnhancedBackgroundElements />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gh-border dark:bg-gh-surface/90"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Github className="h-8 w-8" />
              </motion.div>
              <span className="text-base font-bold sm:text-xl">
                GitHub Community GITAM
              </span>
            </motion.div>
            <div className="hidden items-center space-x-8 md:flex">
              {NAV_ITEMS.map((item) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    activeSection === item.toLowerCase()
                      ? "text-black dark:text-gh-text"
                      : "text-gray-500 dark:text-gh-muted"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                  {activeSection === item.toLowerCase() && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black dark:bg-gh-accent"
                      layoutId="activeSection"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
              <ThemeToggle />
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      >
        <motion.div className="absolute inset-0 opacity-5" style={{ y }}>
          <div className="absolute left-10 top-20 h-32 w-32 rounded-full border-2 border-gray-300 dark:border-gh-elevated" />
          <div className="absolute right-20 top-40 h-24 w-24 rounded-full border-2 border-gray-300 dark:border-gh-elevated" />
          <div className="absolute bottom-40 left-1/4 h-16 w-16 rounded-full border-2 border-gray-300 dark:border-gh-elevated" />
          <GitBranch className="absolute right-1/3 top-1/3 h-20 w-20 text-gray-300 dark:text-gh-elevated" />
          <Code className="absolute bottom-1/3 left-1/3 h-16 w-16 text-gray-300 dark:text-gh-elevated" />
        </motion.div>

        <div className="z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            className="mb-8"
            whileHover={{
              scale: 1.1,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 },
            }}
          >
            <Github className="mx-auto mb-6 h-24 w-24 cursor-pointer" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 text-4xl font-bold sm:text-5xl md:text-7xl"
          >
            <motion.span
              whileHover={{
                scale: 1.05,
                textShadow: "0px 0px 8px rgba(0,0,0,0.3)",
              }}
              transition={{ duration: 0.3 }}
            >
              GitHub Community
            </motion.span>
            <motion.span
              className="block text-gray-600 dark:text-gh-muted"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              GITAM
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gh-muted md:text-2xl"
          >
            Empowering developers, fostering collaboration, and building the
            future of open source at GITAM University
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <EnhancedButton
              size="lg"
              type="primary"
              onClick={() => scrollToSection("about")}
            >
              Learn More
            </EnhancedButton>
            <EnhancedButton
              size="lg"
              variant="outline"
              type="secondary"
              onClick={() => setIsQrPopupOpen(true)}
            >
              Join Community
            </EnhancedButton>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          whileHover={{ scale: 1.2 }}
          onClick={() => scrollToSection("about")}
        >
          <ChevronDown className="h-6 w-6 text-gray-400 dark:text-gh-muted" />
        </motion.div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative z-10 bg-gray-50 py-20 dark:bg-gh-surface"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              About Our Community
            </motion.h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gh-muted">
              We are a vibrant community of developers, designers, and tech
              enthusiasts at GITAM University, dedicated to promoting open
              source culture and collaborative development.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Code,
                title: "Open Source",
                description:
                  "Contributing to and maintaining open source projects",
              },
              {
                icon: Users,
                title: "Community",
                description: "Building connections and fostering collaboration",
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "Driving technological innovation and learning",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <InteractiveCard className="h-full text-center" glowEffect>
                  <CardHeader>
                    <motion.div
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.2,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="mx-auto mb-4 h-12 w-12" />
                    </motion.div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Board Section */}
      <section id="board" className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Executive Board
            </motion.h2>
            <p className="mb-4 text-xl text-gray-600 dark:text-gh-muted">
              Meet the leaders driving our community forward
            </p>
            <motion.p
              className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:bg-gh-elevated dark:text-gh-muted"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              ✨ Click on any card to learn more about our team members
            </motion.p>
          </motion.div>

          {/* Wraps to 3 + 2 centered on desktop, 2 up on tablet, 1 up on phones */}
          <div className="flex flex-wrap justify-center gap-8">
            {boardMembers.map((member, idx) => (
              <div
                key={idx}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
              >
                <BoardMemberPopupCard member={member} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Gallery */}
      <section
        id="events"
        className="relative z-10 bg-gray-50 py-20 dark:bg-gh-surface"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Events from last year
            </motion.h2>
            <p className="mb-4 text-xl text-gray-600 dark:text-gh-muted">
              Highlights from our community gatherings and workshops
            </p>
            <motion.p
              className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:bg-gh-elevated dark:text-gh-muted"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              📸 Click on any event card to see detailed information and photo
              gallery
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <EventPopupCard key={index} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="relative z-10 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Our Journey
            </motion.h2>
            <p className="text-xl text-gray-600 dark:text-gh-muted">
              From the start
            </p>
          </motion.div>

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

      {/* Join Section */}
      <section id="join" className="relative z-10 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Join Us
            </motion.h2>
            <p className="text-xl text-gray-600 dark:text-gh-muted">
              Apply to become a member of the community
            </p>
          </motion.div>

          <JoinForm />
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="relative z-10 bg-gray-50 py-20 dark:bg-gh-surface"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2
              className="mb-6 text-3xl font-bold md:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Why Join Us?
            </motion.h2>
            <p className="text-xl text-gray-600 dark:text-gh-muted">
              Discover the benefits of being part of our community
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Code,
                title: "Skill Development",
                description:
                  "Learn cutting-edge technologies and best practices through workshops and peer learning",
              },
              {
                icon: Users,
                title: "Networking",
                description:
                  "Connect with like-minded developers, industry professionals, and potential collaborators",
              },
              {
                icon: Trophy,
                title: "Recognition",
                description:
                  "Showcase your contributions and achievements within the community and beyond",
              },
              {
                icon: GitBranch,
                title: "Open Source",
                description:
                  "Contribute to meaningful projects and build a strong portfolio of open source work",
              },
              {
                icon: Star,
                title: "Mentorship",
                description:
                  "Get guidance from experienced developers and mentor newcomers to the field",
              },
              {
                icon: Zap,
                title: "Innovation",
                description:
                  "Work on cutting-edge projects and stay ahead of technology trends",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <InteractiveCard
                  className="h-full border-l-4 border-l-black dark:border-l-gh-accent"
                  hoverScale={1.05}
                  glowEffect
                >
                  <CardHeader>
                    <motion.div
                      whileHover={{
                        rotate: [0, -15, 15, 0],
                        scale: 1.2,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <benefit.icon className="mb-4 h-10 w-10" />
                    </motion.div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </InteractiveCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <EnhancedButton
              size="lg"
              type="primary"
              colorScheme="community"
              onClick={() => setIsQrPopupOpen(true)}
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 10px rgba(255,255,255,0.5)",
                    "0 0 0px rgba(255,255,255,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                🚀 Join Our Community
              </motion.span>
            </EnhancedButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-transparent bg-black py-12 text-white dark:border-gh-border dark:bg-gh-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <motion.div
                className="mb-4 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Github className="h-8 w-8" />
                </motion.div>
                <span className="text-xl font-bold">
                  GitHub Community GITAM
                </span>
              </motion.div>
              <p className="text-gray-400">
                Empowering the next generation of developers through
                collaboration and open source.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                {NAV_ITEMS.map((link) => (
                  <motion.li key={link}>
                    <motion.a
                      href={`#${link.toLowerCase()}`}
                      className="transition-colors hover:text-white"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link === "Board" ? "Executive Board" : link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="h-4 w-4" />
                  <span>github.gitamhyd@gmail.com</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="h-4 w-4" />
                  <span>GITAM University, Hyderabad</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Instagram className="h-4 w-4" />
                  <span>@github.gitam.hyd</span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400 dark:border-gh-border dark:text-gh-muted">
            <p>&copy; 2025 GitHub Community GITAM. All rights reserved.</p>
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
