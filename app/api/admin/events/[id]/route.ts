import { NextRequest, NextResponse } from "next/server"
import { deleteEvent, updateEvent } from "@/lib/db/events"
import { validateEvent } from "@/lib/validation/event"
import { requireAdminApi } from "@/lib/auth/require-admin"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const id = Number((await params).id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
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

  const event = await updateEvent(id, {
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

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(event)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const id = Number((await params).id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await deleteEvent(id)
  return NextResponse.json({ ok: true })
}
