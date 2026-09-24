import Link from "next/link"
import { notFound } from "next/navigation"
import { getProposal } from "@/lib/db/proposals"
import { PROPOSAL_HELP, labelOf } from "@/features/proposals/keys"
import { studentYear } from "@/features/forms/student"
import { ProposalReviewForm } from "@/features/admin/proposal-review-form"
import { SubmitterCard } from "@/features/admin/status-tabs"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function ReviewProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const id = Number((await params).id)
  const proposal = Number.isNaN(id) ? null : await getProposal(id)
  if (!proposal) notFound()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/proposals"
          className="text-sm text-gh-muted hover:text-gh-text"
        >
          Back to proposals
        </Link>
        <h1 className="mb-1 mt-3 text-2xl font-semibold">
          Proposal #{proposal.id}
        </h1>
        <p className="mb-8 text-sm text-gh-muted">
          Received{" "}
          {new Date(proposal.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ProposalReviewForm proposal={proposal} />
          <SubmitterCard
            rows={[
              { label: "Name", value: proposal.name },
              {
                label: "Year and branch",
                value: `${studentYear(proposal.year)}, ${proposal.branch}`,
              },
              { label: "Registration no.", value: proposal.reg_no },
              {
                label: "Phone",
                value: (
                  <a
                    href={`tel:${proposal.phone}`}
                    className="text-gh-accent hover:underline"
                  >
                    {proposal.phone}
                  </a>
                ),
              },
              {
                label: "Wants to help",
                value: labelOf(PROPOSAL_HELP, proposal.help),
              },
            ]}
          />
        </div>
      </div>
    </main>
  )
}
