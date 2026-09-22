"use client"

import type { RefObject } from "react"
import { motion } from "framer-motion"
import { EnhancedButton } from "@/components/motion/enhanced-button"

export function HeroSection({
  heroSlotRef,
  onScrollTo,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  onScrollTo: (sectionId: string) => void
}) {
  return (
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
              onClick={() => onScrollTo("journey")}
            >
              Our Story
            </EnhancedButton>
            <EnhancedButton
              size="lg"
              variant="outline"
              type="secondary"
              colorScheme="community"
              onClick={() => onScrollTo("join")}
            >
              Join Community
            </EnhancedButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
