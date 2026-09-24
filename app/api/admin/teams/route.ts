import { NextRequest, NextResponse } from "next/server"
import { insertTeam } from "@/lib/db/teams"
import { toTeamInput, validateTeam } from "@/lib/validation/team"
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

  const result = validateTeam(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  try {
    const team = await insertTeam(toTeamInput(result.data))
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    // `name` is UNIQUE; D1 reports it in the message, not a `.code`.
    if (String(error).includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { errors: { name: "There is already a team with that name" } },
        { status: 409 },
      )
    }
    throw error
  }
}
