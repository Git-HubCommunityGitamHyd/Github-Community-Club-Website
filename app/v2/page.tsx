import { V2Page } from "@/features/v2/v2-page"
import { listBoardMembers } from "@/lib/db/board-members"
import { listEvents } from "@/lib/db/events"

// Same reason as app/page.tsx: without this Next prerenders at build time and
// freezes whatever D1 returned during `next build`.
export const dynamic = "force-dynamic"

export default async function Page() {
  const [boardMembers, events] = await Promise.all([
    listBoardMembers(),
    listEvents(),
  ])

  return <V2Page boardMembers={boardMembers} events={events} />
}
