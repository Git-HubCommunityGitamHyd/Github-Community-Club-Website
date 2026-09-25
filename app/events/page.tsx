import type { Metadata } from "next"
import { listEvents } from "@/lib/db/events"
import { PageChrome } from "@/features/site/page-chrome"
import { BackLink } from "@/features/site/back-link"
import { EventsGrid } from "@/features/events/events-grid"
import { SectionTexture } from "@/components/ui/texture"
import { MascotSlot } from "@/features/mascot/mascot-slot"

// Same reason as the homepage: without this Next freezes whatever D1 returned
// during `next build`. See CLAUDE.md.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Events | GitHub Community GITAM",
  description:
    "Every workshop, talk and hackathon the GitHub Community club at GITAM has run, with photos.",
}

export default async function EventsPage() {
  const events = await listEvents()

  return (
    <PageChrome activeSection="events">
      <section className="relative">
        <SectionTexture />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
          <BackLink href="/#events">Home</BackLink>

          <div className="mb-14 mt-8 flex items-end justify-between gap-10">
            <div>
              <h1 className="max-w-3xl text-balance text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                Every event so far
              </h1>
              <p className="mt-5 max-w-[56ch] text-pretty text-lg leading-relaxed text-gh-muted">
                The full archive, from the first workshop onwards. Open an event
                for what was covered and the photos from the day.
              </p>
            </div>
            <MascotSlot />
          </div>

          {events.length > 0 ? (
            <div data-mascot-dock>
              <EventsGrid events={events} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gh-border px-8 py-20 text-center">
              <p className="text-lg font-semibold">No events yet.</p>
              <p className="mx-auto mt-2 max-w-[42ch] text-pretty text-gh-muted">
                Past workshops, talks and hackathons show up here once they are
                added.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageChrome>
  )
}
