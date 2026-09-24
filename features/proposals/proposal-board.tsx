"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { PublicProposal } from "@/lib/db/proposals"
import {
  PROPOSAL_AUDIENCES,
  PROPOSAL_FORMATS,
  PUBLIC_PROPOSAL_STATUSES,
  labelOf,
  proposalStatus,
} from "@/features/proposals/keys"
import { cn } from "@/lib/utils"

const LONG = 260

/**
 * Accepted proposals, laid out like a repository's issue list: tabs with
 * counts along the top, then one row per idea with its number, status and who
 * suggested it. The club's own vocabulary is GitHub's, and an issue is what a
 * proposal is: a request someone filed that the maintainers took on.
 */
export function ProposalBoard({ proposals }: { proposals: PublicProposal[] }) {
  const [filter, setFilter] = useState<string>("all")
  const counts = Object.fromEntries(
    PUBLIC_PROPOSAL_STATUSES.map((key) => [
      key,
      proposals.filter((p) => p.status === key).length,
    ]),
  )
  const shown =
    filter === "all" ? proposals : proposals.filter((p) => p.status === filter)

  const tabs = [
    { key: "all", label: "All", count: proposals.length },
    ...PUBLIC_PROPOSAL_STATUSES.map((key) => ({
      key,
      label: proposalStatus(key).label,
      count: counts[key],
    })),
  ]

  return (
    <div
      data-mascot-dock
      className="overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/70"
    >
      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex flex-wrap gap-1 border-b border-gh-border bg-gh-elevated/40 px-3 py-2.5 sm:px-4"
      >
        {tabs.map((tab) => {
          const active = filter === tab.key
          const Icon = tab.key === "all" ? null : proposalStatus(tab.key).icon
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
                active
                  ? "bg-gh-bg font-semibold text-gh-text ring-1 ring-gh-border"
                  : "text-gh-muted hover:text-gh-text",
              )}
            >
              {Icon && <Icon aria-hidden="true" className="size-3.5" />}
              {tab.label}
              <span className="rounded-full bg-gh-border/70 px-1.5 font-mono text-[11px] tabular-nums text-gh-text">
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {shown.length === 0 ? (
        <p className="px-6 py-16 text-center text-gh-muted">
          Nothing here yet.
        </p>
      ) : (
        <ul className="divide-y divide-gh-border">
          {shown.map((proposal, index) => (
            <ProposalRow key={proposal.id} proposal={proposal} index={index} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ProposalRow({
  proposal,
  index,
}: {
  proposal: PublicProposal
  index: number
}) {
  const [open, setOpen] = useState(false)
  const { icon: Icon, tone } = proposalStatus(proposal.status)
  const long = proposal.idea.length > LONG
  const date = new Date(proposal.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group flex gap-4 px-5 py-5 transition-colors hover:bg-gh-elevated/30 sm:px-6"
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-1 size-[18px] shrink-0",
          tone === "accent" ? "text-gh-accent" : "text-gh-muted",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-pretty text-[17px] font-semibold leading-snug text-gh-text">
            {proposal.title}
          </h3>
          <span className="font-mono text-xs text-gh-muted">
            {proposalStatus(proposal.status).label}
          </span>
        </div>
        <p
          className={cn(
            "mt-2 max-w-[75ch] whitespace-pre-line text-pretty text-[15px] leading-relaxed text-gh-muted",
            long && !open && "line-clamp-3",
          )}
        >
          {proposal.idea}
        </p>
        {long && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-1.5 text-sm font-medium text-gh-text underline decoration-gh-border underline-offset-4 hover:decoration-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
          >
            {open ? "Show less" : "Read all of it"}
          </button>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-gh-muted">
          <span className="text-gh-text/80">#{proposal.id}</span>
          <span aria-hidden="true">·</span>
          <span>
            proposed by{" "}
            <span className="text-gh-text/90">{proposal.public_name}</span> on{" "}
            {date}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            for {labelOf(PROPOSAL_AUDIENCES, proposal.audience).toLowerCase()}
          </span>
          {proposal.format !== "unsure" && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {labelOf(PROPOSAL_FORMATS, proposal.format).toLowerCase()}
              </span>
            </>
          )}
        </p>
      </div>
    </motion.li>
  )
}
