import { NextRequest, NextResponse } from "next/server"
import { deleteProposal, updateProposal } from "@/lib/db/proposals"
import { validateProposalReview } from "@/lib/validation/proposal"
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

  const result = validateProposalReview(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const proposal = await updateProposal(id, result.data)
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(proposal)
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

  await deleteProposal(id)
  return NextResponse.json({ ok: true })
}
