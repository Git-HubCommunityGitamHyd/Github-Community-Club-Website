import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { insertEvent } from "@/lib/db"
import { validateEvent } from "@/lib/validate-event"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { errors: { form: "Invalid request" } },
      { status: 400 },
    )
  }

  const result = validateEvent(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const event = await insertEvent({
    title: result.data.title,
    eventDate: result.data.eventDate,
    location: result.data.location || null,
    attendees: result.data.attendees ? Number(result.data.attendees) : null,
    category: result.data.category,
    duration: result.data.duration || null,
    description: result.data.description,
    images: result.data.images,
    sortOrder: Number(result.data.sortOrder || 0),
  })

  return NextResponse.json(event, { status: 201 })
}
