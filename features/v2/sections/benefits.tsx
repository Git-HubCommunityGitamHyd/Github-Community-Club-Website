"use client"

import { ScrollStack, ScrollStackItem } from "@/components/ui/scroll-stack"
import { BENEFITS } from "@/features/home/content"

export function V2BenefitsSection() {
  return (
    <section
      id="benefits"
      className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <span className="font-mono text-[13px] font-bold text-gh-accent-light dark:text-gh-accent">
        05 — BENEFITS
      </span>
      <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
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
        {BENEFITS.map((benefit, index) => (
          <ScrollStackItem
            key={benefit.title}
            itemClassName="flex h-72 flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-10 shadow-[0_24px_60px_-32px_rgba(1,4,9,0.25)] dark:border-gh-border dark:bg-gh-surface dark:shadow-[0_24px_60px_-32px_rgba(1,4,9,0.9)]"
          >
            <div className="flex items-start justify-between gap-6">
              <span className="font-mono text-sm font-bold tabular-nums text-gray-400 dark:text-gh-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-gh-accent-light dark:bg-gh-accent"
              />
            </div>
            <div>
              <h3 className="text-[clamp(26px,3vw,40px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
                {benefit.title}
              </h3>
              <p className="mt-4 max-w-[48ch] text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted sm:text-lg">
                {benefit.desc}
              </p>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  )
}
