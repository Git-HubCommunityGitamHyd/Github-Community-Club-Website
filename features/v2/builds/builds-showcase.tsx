"use client"

import { useState } from "react"
import { Tag } from "lucide-react"
import type { PublicBuild } from "@/lib/db/builds"
import { BuildCard } from "@/features/v2/builds/build-card"
import { BuildDialog } from "@/features/v2/builds/build-dialog"
import { monthLabel, weekLabel } from "@/features/v2/builds/keys"
import { cn } from "@/lib/utils"

/**
 * The builds page body.
 *
 * The week's picks lead, large. Under them each month is laid out like a
 * release on GitHub: a tag down the left ("2026.09") with the month and a
 * count, the newest marked Latest, and that month's builds beside it. The
 * builds page is a changelog of what students shipped, and a releases list is
 * the shape the club's audience already reads that way.
 *
 * `currentWeek` comes from the server so the "this week" heading does not
 * change between the server render and hydration.
 */
export function BuildsShowcase({
  builds,
  currentWeek,
}: {
  builds: PublicBuild[]
  currentWeek: string
}) {
  const [open, setOpen] = useState<PublicBuild | null>(null)

  const latestWeek = builds
    .map((b) => b.week_of)
    .filter((w): w is string => Boolean(w))
    .sort()
    .at(-1)
  const weekly = latestWeek
    ? builds.filter((b) => b.week_of === latestWeek)
    : []

  const months: { month: string; builds: PublicBuild[] }[] = []
  for (const build of builds) {
    if (!build.month) continue
    const group = months.find((m) => m.month === build.month)
    if (group) group.builds.push(build)
    else months.push({ month: build.month, builds: [build] })
  }

  return (
    <>
      {weekly.length > 0 && latestWeek && (
        <section
          data-mascot-dock
          aria-labelledby="week-heading"
          className="mb-24"
        >
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="week-heading"
              className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.02em]"
            >
              {latestWeek === currentWeek
                ? "This week's builds"
                : `Picked the week of ${weekLabel(latestWeek)}`}
            </h2>
            <span className="font-mono text-xs text-gh-muted">
              {weekly.length} {weekly.length === 1 ? "pick" : "picks"}
            </span>
          </div>
          <div
            className={cn(
              "grid gap-5",
              weekly.length === 1
                ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]"
                : weekly.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {weekly.map((build, i) => (
              <div
                key={build.id}
                className={cn(
                  weekly.length >= 3 &&
                    i === 0 &&
                    "lg:col-span-2 lg:row-span-2",
                )}
              >
                <BuildCard
                  build={build}
                  size={i === 0 ? "feature" : "regular"}
                  onOpen={() => setOpen(build)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-20">
        {months.map((group, index) => (
          <section
            key={group.month}
            data-mascot-dock
            aria-labelledby={`month-${group.month}`}
            className="grid gap-8 border-t border-gh-border pt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12"
          >
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gh-border bg-gh-surface/70 px-2.5 py-1 font-mono text-xs text-gh-text">
                <Tag aria-hidden="true" className="size-3.5 text-gh-accent" />
                {group.month.replace("-", ".")}
              </span>
              <h2
                id={`month-${group.month}`}
                className="mt-4 text-2xl font-extrabold tracking-[-0.02em]"
              >
                {monthLabel(group.month)}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-gh-muted">
                {group.builds.length}{" "}
                {group.builds.length === 1 ? "build" : "builds"}
                {index === 0 && (
                  <span className="rounded-full border border-gh-accent/50 px-2 py-px font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-gh-accent">
                    Latest
                  </span>
                )}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.builds.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  onOpen={() => setOpen(build)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <BuildDialog build={open} onClose={() => setOpen(null)} />
    </>
  )
}
