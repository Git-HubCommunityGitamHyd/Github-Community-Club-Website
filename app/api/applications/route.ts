import { NextRequest, NextResponse } from "next/server"
import { insertApplication } from "@/lib/db"
import { validateApplication } from "@/lib/validate-application"

export const runtime = "nodejs"

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, errors: { form: "Invalid request" } },
      { status: 400 },
    )
  }

  // Honeypot: bots fill every field, humans never see this one. Silently
  // "succeed" without writing anything so we don't tip off scrapers.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const result = validateApplication(body)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 },
    )
  }

  try {
    await insertApplication({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      branch: result.data.branch,
      year: result.data.year,
      githubUsername: result.data.githubUsername || null,
      whyJoin: result.data.whyJoin,
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          ok: false,
          errors: { email: "You've already applied with this email" },
        },
        { status: 409 },
      )
    }
    throw error
  }
}
