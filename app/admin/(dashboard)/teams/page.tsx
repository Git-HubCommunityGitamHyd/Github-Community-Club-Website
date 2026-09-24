import Link from "next/link"
import { listTeams } from "@/lib/db/teams"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { adminUrl } from "@/lib/auth/admin-path"

export default async function AdminTeamsPage() {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const teams = await listTeams()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/teams" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Teams <span className="text-gh-muted">({teams.length})</span>
          </h1>
          <Link href={adminUrl("/admin/teams/new")}>
            <Button>Add team</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-gh-border">
                  <td className="px-4 py-3">{team.name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {team.member_count}
                  </td>
                  <td className="px-4 py-3">{team.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={adminUrl(`/admin/teams/${team.id}/edit`)}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={adminUrl(`/api/admin/teams/${team.id}`)}
                        confirmMessage={`Delete the ${team.name} team? Its ${team.member_count} member(s) stay, without a team.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    No teams yet. Members without a team are listed together at
                    the end of the members page.
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
