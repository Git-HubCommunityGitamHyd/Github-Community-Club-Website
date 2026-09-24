import type { Metadata } from "next"
import { listProjects, listTeamsByProject } from "@/lib/db/projects"
import { refreshStaleCommitCounts } from "@/lib/github/commits"
import { ProjectsPageChrome } from "@/features/v2/projects/page-chrome"
import { ProjectsBackLink } from "@/features/v2/projects/back-link"
import { ProjectsGrid } from "@/features/v2/projects/projects-grid"
import { SectionTexture } from "@/components/ui/texture"

// Same reason as the homepage: without this Next freezes whatever D1 returned
// during `next build`. See CLAUDE.md.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Projects | GitHub Community GITAM",
  description:
    "What the GitHub Community club at GITAM is building, live and in progress.",
}

export default async function ProjectsPage() {
  const [projects, teams] = await Promise.all([
    listProjects(),
    listTeamsByProject(),
  ])
  refreshStaleCommitCounts(projects)

  return (
    <ProjectsPageChrome>
      <section className="relative">
        <SectionTexture />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
          {/* Back to the section this page was reached from, not to "/". The
              visitor arrived from the homepage's projects list, and dropping
              them at the top of a very long page would lose their place. */}
          <ProjectsBackLink href="/#projects">Home</ProjectsBackLink>

          <h1 className="mt-8 max-w-3xl text-balance text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
            Everything we are building
          </h1>
          <p className="mb-14 mt-5 max-w-[56ch] text-pretty text-lg leading-relaxed text-gh-muted">
            Club projects are public repositories. Some are running on campus
            today, some are half-finished in a branch, and the history of both
            is readable.
          </p>

          {projects.length > 0 ? (
            <ProjectsGrid projects={projects} teams={teams} />
          ) : (
            /* An empty state rather than a blank page. This route is reachable
               directly, so it has to say something when the homepage section
               is hidden for having nothing to show. */
            <div className="rounded-2xl border border-dashed border-gh-border px-8 py-20 text-center">
              <p className="text-lg font-semibold">Nothing published yet.</p>
              <p className="mx-auto mt-2 max-w-[42ch] text-pretty text-gh-muted">
                The club&apos;s work lives in public repositories. This page
                fills up as projects are written down.
              </p>
            </div>
          )}
        </div>
      </section>
    </ProjectsPageChrome>
  )
}
