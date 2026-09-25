import { NextRequest, NextResponse } from "next/server"
import { deleteBuild, updateBuild } from "@/lib/db/builds"
import { validateBuildReview } from "@/lib/validation/build"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { syncBuildCommitCount } from "@/lib/github/commits"

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

  const result = validateBuildReview(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  try {
    const build = await updateBuild(id, result.data)
    if (!build) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    // Read the commit count now, as a project save does, so the page shows
    // it straight away rather than after the first daily refresh.
    await syncBuildCommitCount(build)
    return NextResponse.json(build)
  } catch (error) {
    // `slug` is UNIQUE; D1 reports it in the message, not a `.code`.
    if (String(error).includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { errors: { slug: "Another build already uses this address" } },
        { status: 409 },
      )
    }
    throw error
  }
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

  await deleteBuild(id)
  return NextResponse.json({ ok: true })
}
