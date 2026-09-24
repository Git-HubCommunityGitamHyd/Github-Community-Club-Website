"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ImagePlus } from "lucide-react"
import type { PublicBuild } from "@/lib/db/builds"
import { SectionLabel } from "@/features/site/section-label"
import { SectionTexture } from "@/components/ui/texture"
import { creditLine } from "@/features/builds/format"

/** Rotation and offset for each card in the spread, back to front. */
const FAN = [
  { rotate: -7, x: "-34%", y: 18 },
  { rotate: 6, x: "34%", y: 26 },
  { rotate: 0, x: "0%", y: 0 },
]

/**
 * The build showcase on the homepage.
 *
 * Mirrored from the ideas section above it (visual left, words right) so the
 * two read as a pair rather than as the same block twice. The visual is the
 * latest picks fanned out like prints on a desk, straightening and lifting on
 * hover. With nothing picked yet, the prints are empty dashed frames, which
 * is both the empty state and the invitation.
 */
export function BuildsSection({ builds }: { builds: PublicBuild[] }) {
  const latestWeek = builds
    .map((b) => b.week_of)
    .filter((w): w is string => Boolean(w))
    .sort()
    .at(-1)
  const picks = (
    latestWeek ? builds.filter((b) => b.week_of === latestWeek) : builds
  ).slice(0, 3)
  const slots = Array.from({ length: 3 }, (_, i) => picks[i] ?? null)
  // Front card is the first pick, so draw it last.
  const order = [1, 2, 0]

  return (
    <section id="builds" className="relative border-b border-gh-border">
      <SectionTexture />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20 lg:px-8">
        <div className="relative order-2 mx-auto aspect-[4/3] w-full max-w-lg lg:order-1">
          {order.map((slot, i) => {
            const build = slots[slot]
            const fan = FAN[i]
            return (
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: fan.y, rotate: fan.rotate }}
                whileHover={{ rotate: 0, y: fan.y - 14, zIndex: 20 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 20,
                  delay: i * 0.08,
                }}
                style={{ left: "50%", top: "12%", x: `calc(-50% + ${fan.x})` }}
                className="absolute w-[62%]"
              >
                {build ? (
                  <Link
                    href={`/builds/${build.slug}`}
                    className="block overflow-hidden rounded-xl border border-gh-border bg-gh-surface p-2 shadow-[0_24px_50px_-20px_rgba(1,4,9,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gh-elevated">
                      {build.images[0] && (
                        <Image
                          src={build.images[0]}
                          alt=""
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="px-1.5 pb-1 pt-3">
                      <p className="truncate font-semibold text-gh-text">
                        {build.title}
                      </p>
                      <p className="truncate text-xs text-gh-muted">
                        by {creditLine(build)}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-dashed border-gh-border bg-gh-surface/60 p-2 backdrop-blur-sm">
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg bg-gh-bg/50 text-gh-muted">
                      <ImagePlus aria-hidden="true" className="size-6" />
                      <span className="font-mono text-xs">your build here</span>
                    </div>
                    <div className="space-y-1.5 px-1.5 pb-2 pt-3">
                      <div className="h-3 w-2/3 rounded bg-gh-border/60" />
                      <div className="h-2.5 w-1/3 rounded bg-gh-border/40" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="order-1 lg:order-2">
          <SectionLabel index="07">Builds</SectionLabel>
          <h2 className="mb-4 mt-4 text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Made something? Show it off.
          </h2>
          <p className="max-w-[46ch] text-pretty text-lg leading-relaxed text-gh-muted">
            {picks.length > 0 && latestWeek
              ? "These are this week's picks. Every month the club puts together a set of builds by GITAM students, and yours can be in the next one."
              : "Every month the club puts together a set of builds by GITAM students, with a few picked each week. Send yours in, finished or not."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/builds/submit"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-6 py-3 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.97]"
            >
              Submit your build
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/builds"
              className="inline-flex items-center gap-2.5 rounded-full border border-gh-border px-6 py-3 text-[15px] font-semibold text-gh-text transition-colors duration-300 hover:border-gh-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.97]"
            >
              View all builds
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
