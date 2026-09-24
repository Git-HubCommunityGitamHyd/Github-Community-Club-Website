import Link from "next/link"
import { listProposals } from "@/lib/db/proposals"
import {
  PROPOSAL_HELP,
  PROPOSAL_STATUS_KEYS,
  labelOf,
  proposalStatus,
} from "@/features/proposals/keys"
import { studentYear } from "@/features/forms/student"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { StatusTabs } from "@/features/admin/status-tabs"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const { status = "all" } = await searchParams
  const all = await listProposals()
  const proposals =
    status === "all" ? all : all.filter((p) => p.status === status)

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/proposals" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Proposals <span className="text-gh-muted">({all.length})</span>
          </h1>
          <Link href="/proposals" target="_blank">
            <Button variant="outline">Public page</Button>
          </Link>
        </div>
        <p className="mb-6 max-w-2xl text-sm text-gh-muted">
          Ideas sent through /proposals/new. New ones are private. Setting a
          proposal to Accepted, Being built or Built lists it on the public page
          with the title, idea and public name only; New and Declined stay
          private.
        </p>

        <StatusTabs
          base="/admin/proposals"
          active={status}
          tabs={[
            { key: "all", label: "All", count: all.length },
            ...PROPOSAL_STATUS_KEYS.map((key) => ({
              key,
              label: proposalStatus(key).label,
              count: all.filter((p) => p.status === key).length,
            })),
          ]}
        />

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Idea</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Wants to help</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => {
                const { label, public: isPublic } = proposalStatus(
                  proposal.status,
                )
                return (
                  <tr
                    key={proposal.id}
                    className="border-t border-gh-border align-top"
                  >
                    <td className="px-4 py-3 tabular-nums text-gh-muted">
                      {proposal.id}
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="font-medium">{proposal.title}</p>
                      <p className="mt-1 line-clamp-2 text-gh-muted">
                        {proposal.idea}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {proposal.name}
                      <p className="text-gh-muted">
                        {studentYear(proposal.year)}, {proposal.branch}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gh-muted">
                      {labelOf(PROPOSAL_HELP, proposal.help)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          proposal.status === "pending"
                            ? "border-gh-accent text-gh-accent"
                            : "border-gh-border text-gh-muted"
                        }`}
                      >
                        {label}
                      </span>
                      <p className="mt-1 text-xs text-gh-muted">
                        {isPublic ? "Public" : "Private"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/proposals/${proposal.id}`}>
                          <Button variant="outline" size="sm">
                            {proposal.status === "pending" ? "Review" : "Edit"}
                          </Button>
                        </Link>
                        <DeleteButton
                          url={`/api/admin/proposals/${proposal.id}`}
                          confirmMessage={`Delete "${proposal.title}" for good? Declining keeps a record; deleting does not.`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {proposals.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    Nothing here.
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
