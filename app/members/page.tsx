import type { Metadata } from "next"
import { listMembersWithProjects } from "@/lib/db/members"
import { listTeams } from "@/lib/db/teams"
import { ProjectsPageChrome } from "@/features/v2/projects/page-chrome"
import { ProjectsBackLink } from "@/features/v2/projects/back-link"
import {
  MembersDirectory,
  type MemberGroup,
} from "@/features/v2/members/members-directory"
import { MascotSlot } from "@/features/v2/mascot/mascot-slot"
import { SectionTexture } from "@/components/ui/texture"
import { IdenticonWall } from "@/features/v2/members/identicon-wall"

// Same reason as the homepage: without this Next freezes whatever D1 returned
// during `next build`. See CLAUDE.md.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Members | GitHub Community GITAM",
  description:
    "The members of the GitHub Community club at GITAM Hyderabad, by team.",
}

export default async function MembersPage() {
  const [members, teams] = await Promise.all([
    listMembersWithProjects(),
    listTeams(),
  ])

  // One group per team that has anyone on it, in the CMS's team order, then
  // everyone without a team. With no teams defined at all there is a single
  // unheaded group rather than a lone "Other members" heading.
  const groups: MemberGroup[] = teams
    .map((team) => ({
      key: `team-${team.id}`,
      name: team.name,
      description: team.description,
      members: members.filter((member) => member.team_id === team.id),
    }))
    .filter((group) => group.members.length > 0)

  const teamless = members.filter(
    (member) =>
      member.team_id === null || !teams.some((t) => t.id === member.team_id),
  )
  if (teamless.length > 0) {
    groups.push({
      key: "team-none",
      name: groups.length > 0 ? "Across teams" : null,
      description: "",
      members: teamless,
    })
  }

  const teamCount = groups.filter((group) => group.key !== "team-none").length
  const intro =
    members.length === 0
      ? "Members are listed here as each recruitment round finishes."
      : `${members.length} members${
          teamCount > 0
            ? ` across ${teamCount} ${teamCount === 1 ? "team" : "teams"}`
            : ""
        }. Select anyone to see their team, what they have built and where to find them.`

  return (
    <ProjectsPageChrome activeSection="board">
      <section className="relative">
        <SectionTexture />
        <IdenticonWall people={members} />
        {/* A soft green light behind the header, where the mascot sits. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 80% 30%, rgba(63,185,80,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-40 sm:px-6 lg:px-8">
          {/* Back to the board section, where the link to this page lives. */}
          <ProjectsBackLink href="/#board">Home</ProjectsBackLink>

          <div className="mb-12 mt-8 flex items-end justify-between gap-10">
            <div>
              <h1 className="max-w-3xl text-balance text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                Everyone in the club
              </h1>
              <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-gh-muted">
                {intro}
              </p>
            </div>
            <MascotSlot />
          </div>

          {members.length > 0 ? (
            <MembersDirectory groups={groups} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gh-border px-8 py-20 text-center">
              <p className="text-lg font-semibold">No members listed yet.</p>
              <p className="mx-auto mt-2 max-w-[42ch] text-pretty text-gh-muted">
                This page fills up as members are added.
              </p>
            </div>
          )}
        </div>
      </section>
    </ProjectsPageChrome>
  )
}
