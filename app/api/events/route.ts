import { NextResponse } from "next/server"
import { listEvents } from "@/lib/db/events"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const events = await listEvents()
  return NextResponse.json(events)
}
