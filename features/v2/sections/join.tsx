"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"
import { JoinSquares } from "@/features/join/join-squares"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { V2JoinForm } from "@/features/v2/join/join-form"

/**
 * The turning-tile background (`JoinSquares`) is deliberately untouched.
 *
 * What changed is everything sitting on top of it. The banner was a centred
 * stack inside a translucent slab with a `ParticleText` headline that was also
 * the only way to reach the form; the form below it was a single narrow column
 * with an ocean of empty space either side. Now the banner is the pitch plus one
 * magnetic CTA, and the form sits in a two-column split with the reasons to
 * apply beside it, so the page is never a lone field column in the middle of
 * nothing.
 */

const REASONS = [
  {
    title: "No experience needed",
    body: "Most people who join have never opened a pull request. That is the point of the workshops.",
  },
  {
    title: "Ship something real",
    body: "Club projects are public repositories. What you build is yours to show, with your commits on it.",
  },
  {
    title: "Every branch welcome",
    body: "The board has people from CSE, ECE and IT. Curiosity is the only requirement we actually check.",
  },
]

export function V2JoinSection({ onOpenQr }: { onOpenQr: () => void }) {
  const formRef = useRef<HTMLDivElement>(null)

  return (
    <section id="join" className="relative">
      <div className="relative overflow-hidden bg-gh-deep text-white">
        <JoinSquares />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gh-deep/60" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="font-mono text-[13px] font-bold text-gh-accent">
              06 — JOIN
            </span>
            <h2 className="mb-5 mt-4 text-[clamp(36px,6vw,72px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              Build what&apos;s next with us.
            </h2>
            <p className="mb-10 max-w-lg text-pretty text-lg leading-relaxed text-gray-300">
              Open to every student at GITAM — no experience required, just
              curiosity.
            </p>

            <MagneticButton
              onClick={() =>
                formRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Join our community
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <div ref={formRef} id="join-form" className="scroll-mt-28 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className="lg:col-span-5">
            <h3 className="text-[clamp(26px,3vw,38px)] font-extrabold leading-[1.1] tracking-[-0.02em]">
              Apply to join
            </h3>
            <p className="mt-4 text-pretty leading-relaxed text-gray-600 dark:text-gh-muted">
              Applications are read by the board, not a filter. Tell us what you
              are curious about and we will point you at the right first step.
            </p>

            <ul className="mt-10 space-y-7">
              {REASONS.map((reason) => (
                <li key={reason.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gh-accent-light dark:bg-gh-accent"
                  />
                  <div>
                    <h4 className="font-semibold">{reason.title}</h4>
                    <p className="mt-1.5 max-w-[42ch] text-pretty text-sm leading-relaxed text-gray-600 dark:text-gh-muted">
                      {reason.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onOpenQr}
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-2 dark:border-gh-border dark:text-gh-text dark:hover:border-gh-muted dark:hover:bg-gh-elevated dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-bg"
            >
              <FaWhatsapp aria-hidden="true" className="h-4 w-4" />
              Prefer WhatsApp? Scan the group QR
            </button>
          </div>

          <div className="lg:col-span-7">
            <V2JoinForm />
          </div>
        </div>
      </div>
    </section>
  )
}
