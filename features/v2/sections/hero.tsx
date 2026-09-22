"use client"

import type { RefObject } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const ENTRY = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export function V2HeroSection({
  heroSlotRef,
  onScrollTo,
}: {
  heroSlotRef: RefObject<HTMLDivElement | null>
  onScrollTo: (sectionId: string) => void
}) {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Soft plate behind the mascot. The model is near-black; on the dark
          canvas it needs something a few percent lighter behind it to sit
          against, and this is cheaper and calmer than raising the whole
          section. Sized and placed to sit under the mascot slot. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden h-[560px] w-[720px] md:block"
        style={{
          background:
            "radial-gradient(ellipse at 62% 42%, rgba(63,185,80,0.10) 0%, rgba(63,185,80,0.04) 38%, rgba(63,185,80,0) 68%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-20 pt-40 sm:px-6 md:grid-cols-12 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="md:col-span-7"
        >
          <motion.p
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mb-6 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-gh-accent-light dark:text-gh-accent"
          >
            GITAM Hyderabad
          </motion.p>

          <motion.h1
            variants={ENTRY}
            transition={{ duration: 0.7 }}
            className="text-balance text-[clamp(44px,7.2vw,104px)] font-extrabold leading-[0.92] tracking-[-0.03em]"
          >
            GitHub
            <br />
            Community
            <span className="text-gh-accent-light dark:text-gh-accent">.</span>
          </motion.h1>

          <motion.p
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mt-8 max-w-[52ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted"
          >
            Empowering developers, fostering collaboration, and building the
            future of open source at GITAM University.
          </motion.p>

          <motion.div
            variants={ENTRY}
            transition={{ duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => onScrollTo("join")}
              className="group inline-flex items-center gap-2 rounded-full bg-gh-accent-light px-6 py-3 text-[15px] font-semibold text-white transition duration-200 hover:opacity-90 active:scale-[0.98] dark:bg-gh-accent dark:text-gh-bg"
            >
              Join the community
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => onScrollTo("journey")}
              className="rounded-full border border-gray-300 px-6 py-3 text-[15px] font-semibold text-gray-700 transition duration-200 hover:border-gray-900 hover:text-gray-900 active:scale-[0.98] dark:border-gh-border dark:text-gh-muted dark:hover:border-gh-accent/60 dark:hover:text-gh-text"
            >
              Our story
            </button>
          </motion.div>
        </motion.div>

        {/* Where the big mascot rests. V2Mascot measures this and animates
            toward the pill's slot as you scroll. Aspect ratio must stay 1.25
            to match the nav slot — the dock scale is derived from height
            alone, so a mismatch stretches the model on the way down. */}
        <div className="relative md:col-span-5">
          <div
            ref={heroSlotRef}
            className="pointer-events-none mx-auto hidden h-[240px] w-[300px] md:block lg:h-[300px] lg:w-[375px]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
