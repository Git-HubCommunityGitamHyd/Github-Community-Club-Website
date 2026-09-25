import { NextRequest, NextResponse } from "next/server"
import { deleteTeam, updateTeam } from "@/lib/db/teams"
import { toTeamInput, validateTeam } from "@/lib/validation/team"
import { requireAdminApi } from "@/lib/auth/require-admin"

export const runtime = "nodejs"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { errors: { form: "Invalid request" } },
      { status: 400 },
    )
  }

  const result = validateTeam(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  try {
    const team = await updateTeam(id, toTeamInput(result.data))
    if (!team) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(team)
  } catch (error) {
    if (String(error).includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { errors: { name: "There is already a team with that name" } },
        { status: 409 },
      )
    }
    throw error
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const id = Number((await params).id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await deleteTeam(id)
  return NextResponse.json({ ok: true })
}
