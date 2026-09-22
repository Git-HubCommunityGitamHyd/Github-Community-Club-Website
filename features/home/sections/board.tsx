"use client"

import { BoardMemberPopupCard } from "@/features/board/board-member-popup-card"
import type { BoardMember } from "@/lib/db/board-members"

export function BoardSection({ members }: { members: BoardMember[] }) {
  return (
    <section
      id="board"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
        03 — BOARD
      </span>
      <h2 className="mb-3 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-tight">
        Executive Board.
      </h2>
      <p className="mb-12 text-lg text-gray-600 dark:text-gh-muted">
        Meet the leaders driving our community forward — click any card for the
        full story.
      </p>

      <div className="flex flex-wrap justify-center gap-8">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
          >
            <BoardMemberPopupCard
              index={idx}
              member={{
                name: member.name,
                role: member.role,
                image: member.image_url ?? "/placeholder.svg",
                description: member.description,
                github: member.github ?? undefined,
                linkedin: member.linkedin ?? undefined,
                email: member.email ?? undefined,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
