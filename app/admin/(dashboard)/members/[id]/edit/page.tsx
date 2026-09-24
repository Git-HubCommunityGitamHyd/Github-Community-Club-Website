import { notFound } from "next/navigation"
import { getMember } from "@/lib/db/members"
import { MemberForm } from "@/features/admin/member-form"
import { listTeams } from "@/lib/db/teams"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const id = Number((await params).id)
  const member = Number.isNaN(id) ? null : await getMember(id)
  if (!member) notFound()
  const teams = await listTeams()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit member</h1>
        <MemberForm initial={member} teams={teams} />
      </div>
    </main>
  )
}
