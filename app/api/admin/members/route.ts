import { NextRequest, NextResponse } from "next/server"
import { insertMember } from "@/lib/db/members"
import { toMemberInput, validateMember } from "@/lib/validation/member"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { getTeam } from "@/lib/db/teams"

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

  const result = validateMember(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }
  // A team deleted in another tab while this form was open.
  if (result.data.teamId && !(await getTeam(Number(result.data.teamId)))) {
    return NextResponse.json(
      { errors: { teamId: "That team no longer exists. Reload." } },
      { status: 400 },
    )
  }

  const member = await insertMember(toMemberInput(result.data))
  return NextResponse.json(member, { status: 201 })
}
