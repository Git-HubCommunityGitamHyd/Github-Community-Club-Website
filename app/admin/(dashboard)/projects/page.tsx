import Link from "next/link"
import { listProjects } from "@/lib/db/projects"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { projectStatus } from "@/features/v2/projects/statuses"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function AdminProjectsPage() {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const projects = await listProjects()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/projects" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Projects <span className="text-gh-muted">({projects.length})</span>
          </h1>
          <Link href="/admin/projects/new">
            <Button>Add project</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Live</th>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                const status = projectStatus(project.status)
                const Icon = status.icon
                return (
                  <tr key={project.id} className="border-t border-gh-border">
                    <td className="px-4 py-3">
                      {project.name}
                      {/* The homepage takes the first five by order, so the
                          editor can see where the line falls without having
                          to count rows. */}
                      {index === 5 && (
                        <span className="ml-2 rounded bg-gh-elevated px-1.5 py-0.5 text-[11px] text-gh-muted">
                          below the homepage cut
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        <span className="text-gh-muted">{status.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gh-muted">
                      {project.live_url ? "Yes" : "-"}
                    </td>
                    <td className="px-4 py-3 text-gh-muted">
                      {project.preview_image ? "Yes" : "-"}
                    </td>
                    <td className="px-4 py-3">{project.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <DeleteButton
                          url={`/api/admin/projects/${project.id}`}
                          confirmMessage={`Delete ${project.name}?`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    No projects yet. The projects section stays hidden on the
                    site until there is at least one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
