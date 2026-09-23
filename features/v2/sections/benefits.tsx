"use client"

import { ScrollStack, ScrollStackItem } from "@/components/ui/scroll-stack"
import { BenefitCard } from "@/features/v2/benefits/benefit-card"
import { V2_BENEFITS } from "@/features/v2/benefits/content"
import { SectionLabel } from "@/features/v2/section-label"

export function V2BenefitsSection() {
  return (
    <section
      id="benefits"
      className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <SectionLabel index="05">Benefits</SectionLabel>
      <h2 className="mb-4 mt-5 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
        Why join us?
      </h2>
      <p className="mb-14 max-w-[52ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
        Six reasons students stay after their first workshop.
      </p>

      <ScrollStack
        // Pixels, not percentages — see the note in components/ui/scroll-stack.
        stackPosition={130}
        scaleEndPosition={40}
        itemDistance={80}
        itemStackDistance={22}
        // 1 - (6 benefits - 1) * itemScale(0.03): the bottom card rests at 0.85
        // and the top one lands at exactly 1.
        baseScale={0.85}
      >
        {V2_BENEFITS.map((benefit, index) => (
          <ScrollStackItem
            key={benefit.title}
            itemClassName="h-72 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_24px_60px_-32px_rgba(1,4,9,0.25)] transition-colors duration-300 hover:border-gh-accent-light/35 dark:border-gh-border dark:bg-gh-surface dark:shadow-[0_24px_60px_-32px_rgba(1,4,9,0.9)] dark:hover:border-gh-accent/35"
          >
            <BenefitCard benefit={benefit} index={index} />
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  )
}
