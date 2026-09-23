import { NextRequest, NextResponse } from "next/server"
import { deleteJourneyEntry, updateJourneyEntry } from "@/lib/db/journey"
import { validateJourneyEntry } from "@/lib/validation/journey"
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

  const result = validateJourneyEntry(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const entry = await updateJourneyEntry(id, {
    entryDate: result.data.entryDate,
    title: result.data.title,
    description: result.data.description,
    icon: result.data.icon,
    sortOrder: Number(result.data.sortOrder || 0),
  })

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(entry)
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

  await deleteJourneyEntry(id)
  return NextResponse.json({ ok: true })
}
