import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { listApplications } from "@/lib/db"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) redirect("/admin/login")

  const applications = await listApplications()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Applications{" "}
            <span className="text-gray-400 dark:text-gh-muted">
              ({applications.length})
            </span>
          </h1>
          <form action="/api/admin/logout" method="POST">
            <Button variant="outline" type="submit">
              Log out
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gh-surface">
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
                <tr
                  key={app.id}
                  className="border-t border-gray-200 dark:border-gh-border"
                >
                  <td className="px-4 py-3">{app.full_name}</td>
                  <td className="px-4 py-3">{app.email}</td>
                  <td className="px-4 py-3">{app.phone}</td>
                  <td className="px-4 py-3">{app.branch}</td>
                  <td className="px-4 py-3">{app.year}</td>
                  <td className="px-4 py-3">{app.github_username ?? "—"}</td>
                  <td className="max-w-xs px-4 py-3">{app.why_join}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gh-muted">
                    {new Date(app.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gh-muted"
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
