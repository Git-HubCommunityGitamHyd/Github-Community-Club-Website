"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import Image from "next/image"
import { AvatarCircles, initialsOf } from "@/components/ui/avatar-circles"
import { ProfileDialog } from "@/features/v2/people/profile-dialog"
import { profilePhoto, toAvatar } from "@/features/v2/people/profile"
import { PROJECT_ROLES, projectRole } from "@/features/v2/projects/roles"
import type { TeamMember } from "@/lib/db/projects"

/**
 * The people on one project page: the faces under the title and the full list
 * at the bottom. Both open the same profile, so they share one dialog through
 * this provider instead of each owning a copy, and a page never has two
 * profiles open at once.
 */
const PeopleContext = createContext<{
  team: TeamMember[]
  open: (person: TeamMember) => void
} | null>(null)

function usePeople() {
  const context = useContext(PeopleContext)
  if (!context) throw new Error("usePeople outside ProjectPeople")
  return context
}

export function ProjectPeople({
  team,
  projectName,
  children,
}: {
  team: TeamMember[]
  projectName: string
  children: ReactNode
}) {
  const [selected, setSelected] = useState<TeamMember | null>(null)

  return (
    <PeopleContext.Provider value={{ team, open: setSelected }}>
      {children}
      <ProfileDialog member={selected} onClose={() => setSelected(null)}>
        {selected && (
          <OnThisProject person={selected} projectName={projectName} />
        )}
      </ProfileDialog>
    </PeopleContext.Provider>
  )
}

/** What they did here, above their general bio in the profile. */
export function OnThisProject({
  person,
  projectName,
}: {
  person: TeamMember
  projectName: string
}) {
  return (
    <div className="mb-6 rounded-xl border border-gh-border bg-gh-bg/60 px-5 py-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
        {projectRole(person.project_role).label} on {projectName}
      </p>
      {person.contribution && (
        <p className="mt-2 text-pretty leading-relaxed text-gh-text">
          {person.contribution}
        </p>
      )}
    </div>
  )
}

/** The faces under the project name. "+N" jumps to the full list. */
export function ProjectAvatars() {
  const { team, open } = usePeople()
  if (team.length === 0) return null

  return (
    <div className="flex items-center gap-4">
      <AvatarCircles
        people={team.map(toAvatar)}
        max={6}
        onSelect={(index) => open(team[index])}
        moreHref="#team"
      />
      <a
        href="#team"
        className="text-sm text-gh-muted underline-offset-4 transition-colors hover:text-gh-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
      >
        Built by {team.length} {team.length === 1 ? "person" : "people"}
      </a>
    </div>
  )
}

/**
 * Everyone, grouped maintainers, then lead, then members (PROJECT_ROLES
 * order; lib/db/projects.ts already sorted them). Each row is a button that
 * opens the profile.
 */
export function ProjectTeamList() {
  const { team, open } = usePeople()

  const groups = Object.entries(PROJECT_ROLES)
    .map(([key, role]) => ({
      key,
      role,
      people: team.filter(
        (person) => projectRole(person.project_role) === role,
      ),
    }))
    .filter((group) => group.people.length > 0)

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gh-muted">
            {group.people.length === 1 ? group.role.label : group.role.plural}
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {group.people.map((person) => (
              <li key={person.id}>
                <PersonRow person={person} onOpen={() => open(person)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function PersonRow({
  person,
  onOpen,
}: {
  person: TeamMember
  onOpen: () => void
}) {
  const photo = profilePhoto(person)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full items-start gap-4 rounded-2xl border border-gh-border bg-gh-surface/70 p-4 text-left transition-[border-color,background-color,transform] duration-200 hover:border-gh-muted/60 hover:bg-gh-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent active:scale-[0.99]"
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gh-elevated text-sm font-semibold text-gh-muted ring-1 ring-gh-border">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          initialsOf(person.name)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-gh-text">{person.name}</span>
          {person.github && (
            <span className="font-mono text-xs text-gh-muted">
              @{person.github}
            </span>
          )}
        </span>
        {person.contribution ? (
          <span className="mt-1.5 block text-pretty text-sm leading-relaxed text-gh-muted">
            {person.contribution}
          </span>
        ) : (
          person.role && (
            <span className="mt-1.5 block text-sm text-gh-muted">
              {person.role}
            </span>
          )
        )}
      </span>
    </button>
  )
}

/**
 * The faces on a `/projects` card. A card has no provider around it, so it
 * owns its dialog; only one card's can be open at a time since opening one
 * needs a click outside any other. Sits above the card's stretched link
 * (`relative z-10`) so a face opens the profile rather than the project.
 */
export function CardAvatars({
  team,
  projectName,
  moreHref,
}: {
  team: TeamMember[]
  projectName: string
  moreHref: string
}) {
  const [selected, setSelected] = useState<TeamMember | null>(null)
  if (team.length === 0) return null

  return (
    <div className="relative z-10 w-fit">
      <AvatarCircles
        people={team.map(toAvatar)}
        max={5}
        size="sm"
        onSelect={(index) => setSelected(team[index])}
        moreHref={moreHref}
      />
      <ProfileDialog member={selected} onClose={() => setSelected(null)}>
        {selected && (
          <OnThisProject person={selected} projectName={projectName} />
        )}
      </ProfileDialog>
    </div>
  )
}
