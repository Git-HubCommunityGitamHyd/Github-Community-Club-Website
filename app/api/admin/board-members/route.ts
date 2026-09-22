import { NextRequest, NextResponse } from "next/server"
import { insertBoardMember } from "@/lib/db/board-members"
import { validateBoardMember } from "@/lib/validation/board-member"
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

  const result = validateBoardMember(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const member = await insertBoardMember({
    name: result.data.name,
    role: result.data.role,
    imageUrl: result.data.imageUrl || null,
    description: result.data.description,
    github: result.data.github || null,
    linkedin: result.data.linkedin || null,
    email: result.data.email || null,
    sortOrder: Number(result.data.sortOrder || 0),
  })

  return NextResponse.json(member, { status: 201 })
}
