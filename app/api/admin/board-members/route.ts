import { NextRequest, NextResponse } from "next/server"
import { insertBoardMember } from "@/lib/db"
import { validateBoardMember } from "@/lib/validate-board-member"
import { getSessionCookie, verifySessionValue } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!verifySessionValue(await getSessionCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
