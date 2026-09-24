import { notFound } from "next/navigation"
import { getProject, listProjectTeam } from "@/lib/db/projects"
import { listMembers } from "@/lib/db/members"
import { ProjectForm } from "@/features/admin/project-form"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const project = Number.isNaN(id) ? null : await getProject(id)
  if (!project) notFound()
  const [team, members] = await Promise.all([
    listProjectTeam(project.id),
    listMembers(),
  ])

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit project</h1>
        <ProjectForm initial={project} initialTeam={team} members={members} />
      </div>
    </main>
  )
}
