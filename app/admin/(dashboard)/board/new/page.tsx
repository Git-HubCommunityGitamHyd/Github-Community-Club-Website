import { BoardMemberForm } from "@/features/admin/board-member-form"

export default async function NewBoardMemberPage() {
  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Add board member</h1>
        <BoardMemberForm />
      </div>
    </main>
  )
}
