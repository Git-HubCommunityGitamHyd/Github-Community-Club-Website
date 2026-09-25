import { NextRequest, NextResponse } from "next/server"
import { deleteBoardMember, updateBoardMember } from "@/lib/db/board-members"
import { validateBoardMember } from "@/lib/validation/board-member"
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
    accent: result.data.accent,
    sortOrder: Number(result.data.sortOrder || 0),
  })

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
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await deleteBoardMember(id)
  return NextResponse.json({ ok: true })
}
