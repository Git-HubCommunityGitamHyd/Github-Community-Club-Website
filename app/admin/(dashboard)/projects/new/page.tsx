import { ProjectForm } from "@/features/admin/project-form"
import { listMembers } from "@/lib/db/members"

export default async function NewProjectPage() {
  const members = await listMembers()
  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Add project</h1>
        <ProjectForm members={members} />
      </div>
    </main>
  )
}
