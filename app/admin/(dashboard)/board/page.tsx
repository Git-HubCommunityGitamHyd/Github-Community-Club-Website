import Link from "next/link"
import { listBoardMembers } from "@/lib/db/board-members"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"

export default async function AdminBoardPage() {
  const members = await listBoardMembers()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/board" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Board members{" "}
            <span className="text-gray-400 dark:text-gh-muted">
              ({members.length})
            </span>
          </h1>
          <Link href="/admin/board/new">
            <Button>Add member</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-gray-200 dark:border-gh-border"
                >
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/board/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={`/api/admin/board-members/${member.id}`}
                        confirmMessage={`Delete ${member.name}?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gh-muted"
                  >
                    No board members yet.
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
