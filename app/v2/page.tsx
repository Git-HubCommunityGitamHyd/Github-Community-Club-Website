import { V2Page } from "@/features/v2/v2-page"
import { listBoardMembers } from "@/lib/db/board-members"
import { listEvents } from "@/lib/db/events"
import { listJourneyEntries } from "@/lib/db/journey"
import { listProjects } from "@/lib/db/projects"
import { listMembers } from "@/lib/db/members"
import { listPublicProposals } from "@/lib/db/proposals"
import { listPublicBuilds } from "@/lib/db/builds"

// Same reason as app/page.tsx: without this Next prerenders at build time and
// freezes whatever D1 returned during `next build`.
export const dynamic = "force-dynamic"

export default async function Page() {
  const [
    boardMembers,
    events,
    journeyEntries,
    projects,
    members,
    proposals,
    builds,
  ] = await Promise.all([
    listBoardMembers(),
    listEvents(),
    listJourneyEntries(),
    listProjects(),
    listMembers(),
    listPublicProposals(),
    listPublicBuilds(),
  ])

  return (
    <V2Page
      boardMembers={boardMembers}
      events={events}
      journeyEntries={journeyEntries}
      projects={projects}
      members={members}
      proposals={proposals}
      builds={builds}
    />
  )
}
