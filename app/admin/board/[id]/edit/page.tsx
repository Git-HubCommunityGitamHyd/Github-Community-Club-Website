import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getBoardMember } from "@/lib/db"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"
import { BoardMemberForm } from "@/components/admin/board-member-form"

export default async function EditBoardMemberPage({
  params,
}: {
  params: { id: string }
}) {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) redirect("/admin/login")

  const id = Number(params.id)
  const member = Number.isNaN(id) ? null : await getBoardMember(id)
  if (!member) notFound()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit board member</h1>
        <BoardMemberForm initial={member} />
      </div>
    </main>
  )
}
