import { redirect } from "next/navigation"
import { getSessionCookie, verifySessionValue } from "@/lib/session"
import { BoardMemberForm } from "@/components/admin/board-member-form"

export default async function NewBoardMemberPage() {
  if (!verifySessionValue(await getSessionCookie())) redirect("/admin/login")

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Add board member</h1>
        <BoardMemberForm />
      </div>
    </main>
  )
}
