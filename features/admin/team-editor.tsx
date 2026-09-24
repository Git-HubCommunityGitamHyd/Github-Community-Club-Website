"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PROJECT_ROLES, PROJECT_ROLE_KEYS } from "@/features/v2/projects/roles"
import type { Member } from "@/lib/db/members"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const iconButton =
  "flex size-8 items-center justify-center rounded-md border border-gh-border text-gh-muted transition hover:border-gh-muted hover:text-gh-text disabled:opacity-30 disabled:hover:border-gh-border disabled:hover:text-gh-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"

/** One person on the project, as the form holds it (strings, like every field). */
export type TeamRow = {
  /** Stable React key; a new row has no member yet, so it cannot use that. */
  key: string
  memberId: string
  role: string
  contribution: string
}

let nextKey = 0

/**
 * The people who worked on a project.
 *
 * Members are picked from the members table rather than typed, so a name is
 * one row everywhere it appears and clicking it opens the same profile. The
 * arrows order people within their role; the page groups by role itself
 * (maintainers, then lead, then members), so moving a member above a
 * maintainer here changes nothing there.
 */
export function TeamEditor({
  members,
  rows,
  onChange,
}: {
  members: Member[]
  rows: TeamRow[]
  onChange: (rows: TeamRow[]) => void
}) {
  if (members.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gh-border px-4 py-6 text-center text-sm text-gh-muted">
        Nobody to tag yet.{" "}
        <Link
          href="/admin/members/new"
          className="font-medium text-gh-accent underline-offset-4 hover:underline"
        >
          Add members
        </Link>{" "}
        first, then come back to put them on this project.
      </p>
    )
  }

  const taken = new Set(rows.map((row) => row.memberId))

  function update(index: number, patch: Partial<TeamRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function move(index: number, by: number) {
    const next = [...rows]
    const [row] = next.splice(index, 1)
    next.splice(index + by, 0, row)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={row.key}
          className="space-y-3 rounded-lg border border-gh-border bg-gh-surface p-4"
        >
          <div className="flex gap-3">
            <select
              aria-label="Person"
              className={inputClass}
              value={row.memberId}
              onChange={(e) => update(index, { memberId: e.target.value })}
            >
              <option value="">Pick a person</option>
              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                  // Someone already on the team, in another row. The API
                  // rejects duplicates too; this just stops the mistake.
                  disabled={
                    taken.has(String(member.id)) &&
                    row.memberId !== String(member.id)
                  }
                >
                  {member.name}
                  {member.github ? ` (@${member.github})` : ""}
                </option>
              ))}
            </select>
            <select
              aria-label="Role on this project"
              className={`${inputClass} max-w-[11rem]`}
              value={row.role}
              onChange={(e) => update(index, { role: e.target.value })}
            >
              {PROJECT_ROLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {PROJECT_ROLES[key].label}
                </option>
              ))}
            </select>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className={iconButton}
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label="Move down"
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label="Remove from project"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <textarea
            aria-label="Contribution"
            rows={2}
            maxLength={400}
            className={inputClass}
            value={row.contribution}
            onChange={(e) => update(index, { contribution: e.target.value })}
            placeholder="What they did on this project, in a sentence or two."
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={rows.length >= members.length}
        onClick={() =>
          onChange([
            ...rows,
            {
              key: `new-${nextKey++}`,
              memberId: "",
              role: rows.length === 0 ? "maintainer" : "member",
              contribution: "",
            },
          ])
        }
      >
        <Plus className="size-4" />
        Add person
      </Button>
    </div>
  )
}
