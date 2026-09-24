import { NextRequest, NextResponse } from "next/server"
import { deleteMember, updateMember } from "@/lib/db/members"
import { toMemberInput, validateMember } from "@/lib/validation/member"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { getTeam } from "@/lib/db/teams"

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

  const member = await updateMember(id, toMemberInput(result.data))
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(member)
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

  await deleteMember(id)
  return NextResponse.json({ ok: true })
}
