import { HomePage } from "@/features/home/home-page"
import { listBoardMembers } from "@/lib/db/board-members"
import { listEvents } from "@/lib/db/events"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [boardMembers, events] = await Promise.all([
    listBoardMembers(),
    listEvents(),
  ])

  return <HomePage boardMembers={boardMembers} events={events} />
}
