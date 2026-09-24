"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MemberCard } from "@/components/ui/member-card"
import { MemberAvatar } from "@/features/people/member-avatar"
import { ProfileDialog } from "@/features/people/profile-dialog"
import { displayHandle } from "@/features/people/profile"
import { boardAccent } from "@/features/board/accents"
import type { MemberWithProjects } from "@/lib/db/members"

export type MemberGroup = {
  /** Stable key and the section's id. */
  key: string
  /** Null for a page with no teams at all, where a heading would be noise. */
  name: string | null
  description: string
  members: MemberWithProjects[]
}

/**
 * Everyone, one section per team. The sections carry `data-mascot-dock`, so
 * the octocat walks down the page team by team, and opening someone calls it
 * over to sit on their profile (`perchMascot`).
 */
export function MembersDirectory({ groups }: { groups: MemberGroup[] }) {
  const [selected, setSelected] = useState<MemberWithProjects | null>(null)

  return (
    <>
      <div className="space-y-24">
        {groups.map((group, index) => (
          <section
            key={group.key}
            id={group.key}
            data-mascot-dock
            aria-labelledby={group.name ? `${group.key}-name` : undefined}
            className="relative scroll-mt-32"
          >
            {/* Each team gets its own ground: its name set huge in outline
                behind the section, and a pool of light, alternating sides
                down the page so consecutive teams do not stack identically. */}
            {group.name && (
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -top-16 select-none whitespace-nowrap text-[clamp(88px,13vw,190px)] font-extrabold leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgba(240,246,252,0.07)] ${
                  index % 2 === 0 ? "right-0" : "left-0"
                }`}
              >
                {group.name}
              </span>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-24 -top-24 bottom-0"
              style={{
                background: `radial-gradient(ellipse 40% 55% at ${
                  index % 2 === 0 ? "88%" : "12%"
                } 30%, rgba(63,185,80,0.06) 0%, transparent 70%)`,
              }}
            />
            {group.name && (
              <header className="relative mb-4 max-w-[60ch]">
                <h2
                  id={`${group.key}-name`}
                  className="flex items-baseline gap-3 text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.025em]"
                >
                  {group.name}
                  <span className="font-mono text-sm font-medium tabular-nums text-gh-muted">
                    {group.members.length}
                  </span>
                </h2>
                {group.description && (
                  <p className="mt-2 text-pretty leading-relaxed text-gh-muted">
                    {group.description}
                  </p>
                )}
              </header>
            )}

            <div className="relative grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.members.map((member) => (
                <MemberCard
                  key={member.id}
                  avatar={
                    <MemberAvatar person={member} size={104} spin="hover" />
                  }
                  glow={boardAccent(member.accent).stops[0]}
                  name={member.name}
                  headline={member.role}
                  tagline={member.tagline}
                  handle={displayHandle(member)}
                  onOpen={() => setSelected(member)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ProfileDialog
        member={selected}
        onClose={() => setSelected(null)}
        perchMascot
        after={selected && <WorkedOn member={selected} />}
      />
    </>
  )
}

/** The projects they are tagged on, each a link to its page. */
function WorkedOn({ member }: { member: MemberWithProjects }) {
  if (member.projects.length === 0) return null
  return (
    <div className="mt-8 first:mt-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
        Worked on
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {member.projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-gh-border bg-gh-bg/60 px-3 py-1.5 text-sm font-medium text-gh-text transition-colors hover:border-gh-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
            >
              {project.name}
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 text-gh-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gh-accent"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
