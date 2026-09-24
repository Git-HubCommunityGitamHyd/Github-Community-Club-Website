import { NextResponse } from "next/server"
import { listMembers } from "@/lib/db/members"

// Queried per request; without this Next.js freezes the build-time result.
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await listMembers())
}
