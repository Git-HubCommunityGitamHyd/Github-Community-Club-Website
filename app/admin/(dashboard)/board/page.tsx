import Link from "next/link"
import Image from "next/image"
import { listBoardMembers } from "@/lib/db/board-members"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { adminUrl } from "@/lib/auth/admin-path"

export default async function AdminBoardPage() {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const members = await listBoardMembers()
  const missingPhotos = members.filter((member) => !member.image_url).length

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/board" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Board members{" "}
            <span className="text-gh-muted">({members.length})</span>
          </h1>
          <Link href={adminUrl("/admin/board/new")}>
            <Button>Add member</Button>
          </Link>
        </div>

        {missingPhotos > 0 && (
          <p className="mb-4 rounded-md border border-gh-border bg-gh-surface px-4 py-3 text-sm text-gh-muted">
            {missingPhotos === 1
              ? "1 member has no photo yet"
              : `${missingPhotos} members have no photo yet`}
            . The homepage shows their initials until one is uploaded.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Photo</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-gh-border">
                  <td className="px-4 py-2">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-gh-border text-[10px] text-gh-muted">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={adminUrl(`/admin/board/${member.id}/edit`)}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={adminUrl(`/api/admin/board-members/${member.id}`)}
                        confirmMessage={`Delete ${member.name}?`}
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
