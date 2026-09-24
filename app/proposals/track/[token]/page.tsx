import type { Metadata } from "next"
import Link from "next/link"
import { getProposalByTrackHash } from "@/lib/db/proposals"
import { hashTrackToken, isTrackToken } from "@/lib/tracking"
import {
  TrackPage,
  formatWhen,
  type Stage,
} from "@/features/tracking/track-page"

export const dynamic = "force-dynamic"

// Private per-person pages: keep them out of search results, and don't send
// the token-bearing URL to other sites as a referrer.
export const metadata: Metadata = {
  title: "Your proposal | GitHub Community GITAM",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

const ORDER = ["accepted", "building", "built"]

export default async function TrackProposalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const proposal = isTrackToken(token)
    ? await getProposalByTrackHash(await hashTrackToken(token))
    : null

  const stages: Stage[] = []
  if (proposal) {
    const reached = ORDER.indexOf(proposal.status)
    stages.push({
      title: "Sent",
      when: formatWhen(proposal.created_at),
      state: "done",
    })
    if (proposal.status === "pending") {
      stages.push({
        title: "Waiting to be read",
        body: "The club’s admins haven’t reviewed it yet. Nothing about it is public.",
        state: "current",
      })
    } else {
      stages.push({
        title: "Read by the admins",
        when: formatWhen(proposal.reviewed_at),
        state: "done",
      })
    }
    if (proposal.status === "declined") {
      stages.push({
        title: "Not taken on this time",
        body: "The club can’t build everything it’s sent, and this one didn’t make it. It stays private. Thank you for sending it; propose another any time.",
        state: "stopped",
      })
    } else {
      const steps = [
        {
          title: "Accepted",
          body: (
            <>
              Listed on the{" "}
              <Link
                href="/proposals"
                className="text-gh-text underline decoration-gh-accent/60 underline-offset-4"
              >
                proposals page
              </Link>{" "}
              as proposed by {proposal.public_name}.
            </>
          ),
        },
        { title: "Being built", body: "The club has started work on it." },
        { title: "Built", body: "It shipped." },
      ]
      steps.forEach((step, i) =>
        stages.push({
          ...step,
          state:
            reached < 0 || i > reached
              ? "upcoming"
              : i === reached && i < 2
                ? "current"
                : "done",
        }),
      )
    }
  }

  return (
    <TrackPage
      back={{ href: "/proposals", label: "Proposals" }}
      kicker={proposal ? `Proposal #${proposal.id}` : "Proposal"}
      title={proposal?.title ?? null}
      stages={stages}
    />
  )
}
