import { listApplications } from "@/lib/db/applications"
import { AdminNav } from "@/features/admin/admin-nav"

export default async function AdminPage() {
  const applications = await listApplications()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin" />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Applications{" "}
            <span className="text-gh-muted">({applications.length})</span>
          </h1>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">GitHub</th>
                <th className="px-4 py-3 font-medium">Why join</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-gh-border">
                  <td className="px-4 py-3">{app.full_name}</td>
                  <td className="px-4 py-3">{app.email}</td>
                  <td className="px-4 py-3">{app.phone}</td>
                  <td className="px-4 py-3">{app.branch}</td>
                  <td className="px-4 py-3">{app.year}</td>
                  <td className="px-4 py-3">{app.github_username ?? "-"}</td>
                  <td className="max-w-xs px-4 py-3">{app.why_join}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gh-muted">
                    {new Date(app.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    No applications yet.
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
