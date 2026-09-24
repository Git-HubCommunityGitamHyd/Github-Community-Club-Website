import type { Metadata } from "next"
import Link from "next/link"
import { Upload } from "lucide-react"
import { listPublicBuilds } from "@/lib/db/builds"
import { mondayOf } from "@/features/v2/builds/keys"
import { ProjectsPageChrome } from "@/features/v2/projects/page-chrome"
import { ProjectsBackLink } from "@/features/v2/projects/back-link"
import { MascotSlot } from "@/features/v2/mascot/mascot-slot"
import { SectionTexture } from "@/components/ui/texture"
import { BuildsShowcase } from "@/features/v2/builds/builds-showcase"

// Reads D1 per request; see CLAUDE.md.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Student builds | GitHub Community GITAM",
  description:
    "Things students at GITAM Hyderabad built, picked each month by the GitHub Community club.",
}

export default async function BuildsPage() {
  const builds = await listPublicBuilds()

  return (
    <ProjectsPageChrome>
      <section className="relative">
        <SectionTexture />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 80% 30%, rgba(63,185,80,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-40 sm:px-6 lg:px-8">
          <ProjectsBackLink href="/#builds">Home</ProjectsBackLink>

          <div className="mb-16 mt-8 flex items-end justify-between gap-10">
            <div>
              <h1 className="max-w-3xl text-balance text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                Built by students
              </h1>
              <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-gh-muted">
                Apps, sites and tools GITAM students made on their own time. The
                club picks a set every month, and a few each week.
              </p>
              <Link
                href="/builds/submit"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-5 py-2.5 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.97]"
              >
                <Upload aria-hidden="true" className="size-4" />
                Submit your build
              </Link>
            </div>
            <MascotSlot />
          </div>

          {builds.length > 0 ? (
            <BuildsShowcase
              builds={builds}
              currentWeek={mondayOf(new Date())}
            />
          ) : (
            <div
              data-mascot-dock
              className="rounded-2xl border border-dashed border-gh-border px-8 py-20 text-center"
            >
              <p className="text-lg font-semibold">No builds picked yet.</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-pretty text-gh-muted">
                The first month’s picks will show up here. Made something? Send
                it in.
              </p>
              <Link
                href="/builds/submit"
                className="mt-6 inline-flex rounded-full border border-gh-border px-5 py-2.5 text-sm font-semibold text-gh-text transition-colors hover:border-gh-accent hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                Submit a build
              </Link>
            </div>
          )}
        </div>
      </section>
    </ProjectsPageChrome>
  )
}
