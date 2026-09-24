import { NextResponse } from "next/server"
import { listTeams } from "@/lib/db/teams"

// Queried per request; without this Next.js freezes the build-time result.
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await listTeams())
}
