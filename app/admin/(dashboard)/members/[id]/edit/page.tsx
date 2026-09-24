import { notFound } from "next/navigation"
import { getMember } from "@/lib/db/members"
import { MemberForm } from "@/features/admin/member-form"

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const member = Number.isNaN(id) ? null : await getMember(id)
  if (!member) notFound()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit member</h1>
        <MemberForm initial={member} />
      </div>
    </main>
  )
}
