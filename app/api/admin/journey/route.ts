import { NextRequest, NextResponse } from "next/server"
import { insertJourneyEntry } from "@/lib/db/journey"
import { validateJourneyEntry } from "@/lib/validation/journey"
import { requireAdminApi } from "@/lib/auth/require-admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

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

  const entry = await insertJourneyEntry({
    entryDate: result.data.entryDate,
    title: result.data.title,
    description: result.data.description,
    icon: result.data.icon,
    sortOrder: Number(result.data.sortOrder || 0),
  })

  return NextResponse.json(entry, { status: 201 })
}
