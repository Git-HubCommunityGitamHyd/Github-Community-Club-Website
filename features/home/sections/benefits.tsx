"use client"

import ScrollStack, { ScrollStackItem } from "@/components/motion/scroll-stack"
import { BENEFITS } from "@/features/home/content"

export function BenefitsSection() {
  return (
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
  )
}
