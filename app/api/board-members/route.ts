import { NextResponse } from "next/server"
import { listBoardMembers } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const members = await listBoardMembers()
  return NextResponse.json(members)
}
