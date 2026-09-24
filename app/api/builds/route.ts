import { NextRequest, NextResponse } from "next/server"
import { insertBuild } from "@/lib/db/builds"
import { validateBuildSubmission } from "@/lib/validation/build"

import { hashTrackToken, newTrackToken } from "@/lib/tracking"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, errors: { form: "Invalid request" } },
      { status: 400 },
    )
  }

  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const result = validateBuildSubmission(body)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 },
    )
  }

  // Shown once on the thank-you screen; only its hash is kept.
  const track = newTrackToken()
  await insertBuild(result.data, await hashTrackToken(track))
  return NextResponse.json({ ok: true, track }, { status: 201 })
}
