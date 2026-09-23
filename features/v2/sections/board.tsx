"use client"

import { useState } from "react"
import type { BoardMember } from "@/lib/db/board-members"
import { TeamShowcase, type TeamMember } from "@/components/ui/team-showcase"
import { MemberDialog } from "@/features/v2/board/member-dialog"
import { SectionLabel } from "@/features/v2/section-label"
import { SectionTexture } from "@/components/ui/texture"

function toTeamMember(member: BoardMember): TeamMember {
  return {
    id: String(member.id),
    name: member.name,
    role: member.role,
    image: member.image_url,
    social: {
      github: member.github ?? undefined,
      linkedin: member.linkedin ?? undefined,
      email: member.email ?? undefined,
    },
  }
}

export function V2BoardSection({ members }: { members: BoardMember[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selected, setSelected] = useState<BoardMember | null>(null)

  return (
    <section id="board" className="relative">
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="03">Board</SectionLabel>
        <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          The people behind it
        </h2>
        <p className="mb-14 max-w-[52ch] text-pretty text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
          Students who run the workshops, review the pull requests and keep the
          community going. Pick a name to read their story.
        </p>

        {members.length > 0 ? (
          <TeamShowcase
            members={members.map(toTeamMember)}
            activeId={hoveredId}
            onHover={setHoveredId}
            onSelect={(member) =>
              setSelected(
                members.find((row) => String(row.id) === member.id) ?? null,
              )
            }
          />
        ) : (
          // The board is CMS-driven and can legitimately be empty between
          // handovers. An empty grid would read as a broken page.
          <p className="rounded-3xl border border-dashed border-gray-300 px-8 py-14 text-center text-gray-500 dark:border-gh-border dark:text-gh-muted">
            The board for this term has not been published yet.
          </p>
        )}
      </div>

      <MemberDialog member={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
