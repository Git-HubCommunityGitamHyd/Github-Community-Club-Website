import { notFound } from "next/navigation"
import { getBoardMember } from "@/lib/db/board-members"
import { BoardMemberForm } from "@/features/admin/board-member-form"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function EditBoardMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const id = Number((await params).id)
  const member = Number.isNaN(id) ? null : await getBoardMember(id)
  if (!member) notFound()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit board member</h1>
        <BoardMemberForm initial={member} />
      </div>
    </main>
  )
}
