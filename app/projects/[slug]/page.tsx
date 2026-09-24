import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { Github, Globe } from "lucide-react"
import { getProjectBySlug, listProjectTeam } from "@/lib/db/projects"
import { parseRepo, refreshStaleCommitCounts } from "@/lib/github/commits"
import { PageChrome } from "@/features/site/page-chrome"
import { BackLink } from "@/features/site/back-link"
import { ProjectStatusBadge } from "@/features/projects/status-badge"
import { ProjectProse } from "@/features/projects/prose"
import { CommitCount } from "@/features/site/commit-count"
import {
  ProjectAvatars,
  ProjectPeople,
  ProjectTeamList,
} from "@/features/projects/people"
import { TransitionSettled } from "@/features/site/transition"
import { transitionName } from "@/features/site/transition-name"
import { Block, NotesFrame, rise } from "@/features/site/page-block"
import { LinkCard } from "@/features/site/link-card"
import { TechStack } from "@/features/tech/tech-stack"
import { SectionTexture } from "@/components/ui/texture"
import { MascotSlot } from "@/features/mascot/mascot-slot"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug)
  if (!project) return { title: "Project not found" }
  return {
    title: `${project.name} | GitHub Community GITAM`,
    description: project.summary,
    openGraph: project.cover_image
      ? { images: [{ url: project.cover_image }] }
      : undefined,
  }
}

/**
 * A project's own page, in the order the CMS form is laid out: name and
 * commits, the people as faces, the brief, the stack, dev notes, links, and
 * everyone who worked on it. Sections with nothing in them are left out and
 * the rest renumber, so an empty "Dev notes" never shows as a heading over
 * nothing.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const project = await getProjectBySlug((await params).slug)
  if (!project) notFound()

  const team = await listProjectTeam(project.id)
  // After the response, so the view never waits on GitHub.
  refreshStaleCommitCounts([project])

  const repo = parseRepo(project.repo_url)
  const liveHost = project.live_url
    ? new URL(project.live_url).host.replace(/^www\./, "")
    : null

  const blocks: { label: string; id?: string; body: ReactNode }[] = [
    {
      label: "Brief",
      body: (
        <>
          <p className="max-w-[60ch] text-pretty text-xl leading-relaxed text-gh-text">
            {project.summary}
          </p>
          {project.cover_image && (
            <div
              style={{
                viewTransitionName: transitionName(project.slug, "cover"),
              }}
              className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gh-border bg-gh-elevated"
            >
              <Image
                src={project.cover_image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 780px"
                className="object-cover"
                priority
              />
            </div>
          )}
          {project.body && (
            <div className="mt-10">
              <ProjectProse body={project.body} />
            </div>
          )}
        </>
      ),
    },
  ]

  if (project.tags.length > 0) {
    blocks.push({
      label: "Tech stack",
      body: <TechStack items={project.tags} />,
    })
  }

  if (project.dev_notes) {
    blocks.push({
      label: "Dev notes",
      body: (
        <NotesFrame>
          <ProjectProse body={project.dev_notes} />
        </NotesFrame>
      ),
    })
  }

  if (project.live_url || project.repo_url) {
    blocks.push({
      label: "Links",
      body: (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          {project.live_url && (
            <LinkCard
              href={project.live_url}
              icon={<Globe aria-hidden="true" className="h-5 w-5" />}
              kicker="Deployed site"
              title={liveHost ?? project.live_url}
              accent
            />
          )}
          {project.repo_url && (
            <LinkCard
              href={project.repo_url}
              icon={<Github aria-hidden="true" className="h-5 w-5" />}
              kicker="Source on GitHub"
              title={repo ?? project.repo_url}
            />
          )}
        </div>
      ),
    })
  }

  if (team.length > 0) {
    blocks.push({ label: "People", id: "team", body: <ProjectTeamList /> })
  }

  return (
    <PageChrome>
      <TransitionSettled />
      <ProjectPeople team={team} projectName={project.name}>
        <article className="relative">
          <SectionTexture />
          <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-36 sm:px-6 lg:px-8">
            <div className="project-rise" style={rise(0)}>
              <BackLink href="/projects">All projects</BackLink>
            </div>

            <header className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="project-rise" style={rise(1)}>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <h1 className="mt-5 text-balance text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[1.03] tracking-[-0.035em]">
                  {/* Inline-block so the box hugs the words. The card's title
                      is sized the same way, and two boxes of the same shape
                      morph as a clean scale rather than a stretch. */}
                  <span
                    className="inline-block"
                    style={{
                      viewTransitionName: transitionName(project.slug, "title"),
                    }}
                  >
                    {project.name}
                  </span>
                </h1>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
                <MascotSlot />
                {project.commit_count !== null && project.repo_url && (
                  <div className="project-rise" style={rise(2)}>
                    <CommitCount
                      count={project.commit_count}
                      repoUrl={project.repo_url}
                    />
                  </div>
                )}
              </div>
            </header>

            <div className="project-rise mt-7" style={rise(3)}>
              <ProjectAvatars />
            </div>

            <div className="mt-16 space-y-16">
              {blocks.map((block, index) => (
                <Block
                  key={block.label}
                  index={index + 1}
                  label={block.label}
                  id={block.id}
                  order={index + 4}
                >
                  {block.body}
                </Block>
              ))}
            </div>
          </div>
        </article>
      </ProjectPeople>
    </PageChrome>
  )
}
