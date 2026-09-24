import type { Metadata } from "next"
import Link from "next/link"
import { getBuildByTrackHash } from "@/lib/db/builds"
import { hashTrackToken, isTrackToken } from "@/lib/tracking"
import { monthLabel, weekLabel } from "@/features/v2/builds/keys"
import {
  TrackPage,
  formatWhen,
  type Stage,
} from "@/features/v2/tracking/track-page"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your build | GitHub Community GITAM",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function TrackBuildPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const build = isTrackToken(token)
    ? await getBuildByTrackHash(await hashTrackToken(token))
    : null

  const stages: Stage[] = []
  if (build) {
    stages.push({
      title: "Sent",
      when: formatWhen(build.created_at),
      state: "done",
    })
    if (build.status === "pending") {
      stages.push({
        title: "Waiting to be looked at",
        body: "The club’s admins haven’t gone through it yet. It isn’t public.",
        state: "current",
      })
      stages.push({ title: "Picked for a month", state: "upcoming" })
    } else {
      stages.push({
        title: "Looked at by the admins",
        when: formatWhen(build.reviewed_at),
        state: "done",
      })
      if (build.status === "declined") {
        stages.push({
          title: "Not picked this time",
          body: "It didn’t make this round’s showcase and stays private. Keep building and send the next version.",
          state: "stopped",
        })
      } else {
        stages.push({
          title: build.month
            ? `Picked for ${monthLabel(build.month)}`
            : "Picked for the showcase",
          body: (
            <>
              It’s on the{" "}
              <Link
                href="/builds"
                className="text-gh-text underline decoration-gh-accent/60 underline-offset-4"
              >
                builds page
              </Link>
              {build.week_of
                ? `, and it’s one of the picks for the week of ${weekLabel(build.week_of)}.`
                : "."}
            </>
          ),
          state: "done",
        })
      }
    }
  }

  return (
    <TrackPage
      back={{ href: "/builds", label: "Builds" }}
      kicker="Your build"
      title={build?.title ?? null}
      stages={stages}
    />
  )
}
