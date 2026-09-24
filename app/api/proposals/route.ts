import { NextRequest, NextResponse } from "next/server"
import { insertProposal } from "@/lib/db/proposals"
import { validateProposal } from "@/lib/validation/proposal"

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

  // Honeypot, as on the join form: a field people never see. Pretend it
  // worked so a bot learns nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const result = validateProposal(body)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 },
    )
  }

  // Shown once on the thank-you screen; only its hash is kept.
  const track = newTrackToken()
  await insertProposal(result.data, await hashTrackToken(track))
  return NextResponse.json({ ok: true, track }, { status: 201 })
}
