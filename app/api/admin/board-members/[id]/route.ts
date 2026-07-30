import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { deleteBoardMember, updateBoardMember } from "@/lib/db"
import { validateBoardMember } from "@/lib/validate-board-member"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"

export const runtime = "nodejs"

function requireSession(): boolean {
  const session = cookies().get(COOKIE_NAME)?.value
  return verifySessionValue(session)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!requireSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = Number(params.id)
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

  const result = validateBoardMember(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const member = await updateBoardMember(id, {
    name: result.data.name,
    role: result.data.role,
    imageUrl: result.data.imageUrl || null,
    description: result.data.description,
    github: result.data.github || null,
    linkedin: result.data.linkedin || null,
    email: result.data.email || null,
    sortOrder: Number(result.data.sortOrder || 0),
  })

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(member)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!requireSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await deleteBoardMember(id)
  return NextResponse.json({ ok: true })
}
