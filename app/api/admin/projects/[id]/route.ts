import { NextRequest, NextResponse } from "next/server"
import { deleteProject, setProjectTeam, updateProject } from "@/lib/db/projects"
import { toProjectInput, validateProject } from "@/lib/validation/project"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { listMembers } from "@/lib/db/members"
import { syncCommitCount } from "@/lib/github/commits"

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

  const result = validateProject(body)
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  const { data } = result
  // A member deleted in another tab while this form was open. Caught here as
  // a form error; the foreign key would otherwise surface it as a 500.
  const known = new Set((await listMembers()).map((member) => member.id))
  if (data.team.some((entry) => !known.has(entry.memberId))) {
    return NextResponse.json(
      { errors: { team: "Someone on the team no longer exists. Reload." } },
      { status: 400 },
    )
  }

  try {
    const project = await updateProject(id, toProjectInput(data))
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await setProjectTeam(project.id, data.team)
    // On every save, not only when the repo changes: saving is also how an
    // editor asks for a fresh number without waiting a day.
    await syncCommitCount(project)
    return NextResponse.json(project)
  } catch (error) {
    if (String(error).includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { errors: { slug: "A project already uses that slug" } },
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
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await deleteProject(id)
  return NextResponse.json({ ok: true })
}
