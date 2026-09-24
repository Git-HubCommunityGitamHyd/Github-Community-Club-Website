import Link from "next/link"
import { listMembers } from "@/lib/db/members"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { MemberAvatar } from "@/features/v2/people/member-avatar"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function AdminMembersPage() {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const members = await listMembers()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/members" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Members <span className="text-gh-muted">({members.length})</span>
          </h1>
          <Link href="/admin/members/new">
            <Button>Add member</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">GitHub</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-gh-border">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <MemberAvatar person={member} size={36} />
                      {member.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gh-muted">
                    {member.team_name ?? "none"}
                  </td>
                  <td className="px-4 py-3 font-mono text-gh-muted">
                    {member.github ? `@${member.github}` : "none"}
                  </td>
                  <td className="px-4 py-3">{member.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/members/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={`/api/admin/members/${member.id}`}
                        confirmMessage={`Delete ${member.name}? They are removed from every project they are tagged on.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    No members yet. Add people here, then tag them on projects.
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
