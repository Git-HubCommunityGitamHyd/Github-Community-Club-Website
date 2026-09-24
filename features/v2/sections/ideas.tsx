"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, GitCommitVertical, Plus } from "lucide-react"
import type { PublicProposal } from "@/lib/db/proposals"
import { proposalStatus } from "@/features/v2/proposals/keys"
import { SectionLabel } from "@/features/v2/section-label"
import { SectionTexture } from "@/components/ui/texture"
import { cn } from "@/lib/utils"

const SHOWN = 3

/**
 * Project proposals on the homepage.
 *
 * The visual is a `git log`: the latest ideas the club took on as commits
 * down a branch line, newest at the top, each with its status, and at the
 * foot an uncommitted, dashed node that is the link to propose one. The point
 * it makes without a sentence is that these came from students and the next
 * one is theirs to add. With nothing accepted yet the log shows the stages an
 * idea goes through instead, so the section never renders empty.
 */
export function V2IdeasSection({ proposals }: { proposals: PublicProposal[] }) {
  const latest = proposals.slice(0, SHOWN)

  return (
    <section id="ideas" className="relative border-b border-gh-border">
      <SectionTexture />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20 lg:px-8">
        <div>
          <SectionLabel index="06">Ideas</SectionLabel>
          <h2 className="mb-4 mt-4 text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Spot a problem? Propose the fix.
          </h2>
          <p className="max-w-[48ch] text-pretty text-lg leading-relaxed text-gh-muted">
            If something on campus should exist and doesn’t, tell us. You only
            need the idea, not the code. If the club takes it on, you can help
            build it or simply hand it over.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/proposals/new"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-6 py-3 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.97]"
            >
              Propose an idea
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/proposals"
              className="inline-flex items-center gap-2.5 rounded-full border border-gh-border px-6 py-3 text-[15px] font-semibold text-gh-text transition-colors duration-300 hover:border-gh-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.97]"
            >
              View project proposals
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gh-border bg-gh-surface/75 p-6 font-mono shadow-[0_30px_60px_-35px_rgba(1,4,9,0.9)] sm:p-8">
          <p className="mb-6 flex items-center gap-2 text-xs text-gh-muted">
            <span className="text-gh-accent">$</span> git log --ideas
          </p>
          <ol className="relative">
            {/* The branch line, running behind every node. */}
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[11px] top-3 w-px bg-gradient-to-b from-gh-accent/70 via-gh-border to-gh-border"
            />
            {latest.length > 0
              ? latest.map((proposal, i) => (
                  <LogEntry key={proposal.id} index={i}>
                    <Node status={proposal.status} />
                    <div className="min-w-0 pb-7">
                      <p className="flex flex-wrap items-center gap-x-2 text-xs text-gh-muted">
                        <span className="text-gh-text/80">#{proposal.id}</span>
                        <span
                          className={cn(
                            proposalStatus(proposal.status).tone === "accent"
                              ? "text-gh-accent"
                              : "text-gh-muted",
                          )}
                        >
                          {proposalStatus(proposal.status).label.toLowerCase()}
                        </span>
                      </p>
                      <p className="mt-1 truncate font-sans text-[17px] font-semibold text-gh-text">
                        {proposal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gh-muted">
                        proposed by {proposal.public_name}
                      </p>
                    </div>
                  </LogEntry>
                ))
              : ["Proposed", "Accepted", "Being built", "Built"].map(
                  (stage, i) => (
                    <LogEntry key={stage} index={i}>
                      <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-gh-border bg-gh-bg">
                        <GitCommitVertical
                          aria-hidden="true"
                          className="size-3.5 text-gh-muted"
                        />
                      </span>
                      <p className="pb-6 font-sans text-[15px] text-gh-text">
                        {stage}
                      </p>
                    </LogEntry>
                  ),
                )}

            <LogEntry index={latest.length || 4}>
              <Link
                href="/proposals/new"
                className="group -m-2 flex flex-1 items-start gap-4 rounded-xl p-2 transition-colors hover:bg-gh-accent/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-gh-accent/70 bg-gh-bg text-gh-accent transition-colors group-hover:bg-gh-accent group-hover:text-gh-deep">
                  <Plus aria-hidden="true" className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-gh-muted">
                    uncommitted
                  </span>
                  <span className="mt-1 block font-sans text-[17px] font-semibold text-gh-text">
                    Your idea goes here
                  </span>
                </span>
              </Link>
            </LogEntry>
          </ol>
        </div>
      </div>
    </section>
  )
}

function LogEntry({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="relative flex items-start gap-4"
    >
      {children}
    </motion.li>
  )
}

function Node({ status }: { status: string }) {
  const { icon: Icon, tone } = proposalStatus(status)
  return (
    <span
      className={cn(
        "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-gh-bg",
        tone === "accent" ? "border-gh-accent" : "border-gh-border",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3.5",
          tone === "accent" ? "text-gh-accent" : "text-gh-muted",
        )}
      />
    </span>
  )
}
