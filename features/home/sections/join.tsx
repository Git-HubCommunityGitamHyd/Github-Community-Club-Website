"use client"

import { motion } from "framer-motion"
import ParticleText from "@/components/motion/particle-text"
import { JoinForm } from "@/features/join/join-form"
import { JoinSquares } from "@/features/join/join-squares"

export function JoinSection({ onOpenQr }: { onOpenQr: () => void }) {
  return (
    <section id="join" className="relative">
      <div className="relative overflow-hidden bg-black text-white">
        <JoinSquares />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="inline-block rounded-3xl bg-black/70 p-10 backdrop-blur-md sm:p-14">
            <span className="font-mono text-[13px] font-bold text-gh-accent">
              06 / JOIN
            </span>
            <h2 className="mb-5 mt-4 text-[clamp(36px,6vw,72px)] font-extrabold tracking-tight">
              Build what&apos;s next with us.
            </h2>
            <p className="mx-auto mb-2 max-w-lg text-lg text-gray-400">
              The community group is open to every student at GITAM. Club
              membership is a separate application, with an interview.
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
            <p className="text-gh-muted">
              Fill out the form and we&apos;ll be in touch.{" "}
              <button
                onClick={onOpenQr}
                className="font-medium text-gh-accent underline underline-offset-2"
              >
                prefer WhatsApp instead?
              </button>
            </p>
          </motion.div>

          <JoinForm />
        </div>
      </div>
    </section>
  )
}
