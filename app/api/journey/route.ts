import { NextResponse } from "next/server"
import { listJourneyEntries } from "@/lib/db/journey"

export const runtime = "nodejs"
// Without this Next prerenders at build time and freezes whatever the DB
// returned during `next build`. See CLAUDE.md.
export const dynamic = "force-dynamic"

export async function GET() {
  const entries = await listJourneyEntries()
  return NextResponse.json(entries)
}
