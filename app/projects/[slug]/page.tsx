import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { CSSProperties, ReactNode } from "react"
import { ArrowUpRight, Github, Globe } from "lucide-react"
import { getProjectBySlug, listProjectTeam } from "@/lib/db/projects"
import { parseRepo, refreshStaleCommitCounts } from "@/lib/github/commits"
import { ProjectsPageChrome } from "@/features/v2/projects/page-chrome"
import { ProjectsBackLink } from "@/features/v2/projects/back-link"
import { ProjectStatusBadge } from "@/features/v2/projects/status-badge"
import { ProjectProse } from "@/features/v2/projects/prose"
import { CommitCount } from "@/features/v2/projects/commit-count"
import {
  ProjectAvatars,
  ProjectPeople,
  ProjectTeamList,
} from "@/features/v2/projects/people"
import { TransitionSettled } from "@/features/v2/projects/transition"
import { transitionName } from "@/features/v2/projects/transition-name"
import { SectionLabel } from "@/features/v2/section-label"
import { SectionTexture } from "@/components/ui/texture"
import { MascotSlot } from "@/features/v2/mascot/mascot-slot"

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

/** Place in the staggered arrival (globals.css `.project-rise`). */
function rise(i: number): CSSProperties {
  return { "--i": String(i) } as CSSProperties
}

/**
 * One block of the page below the header. The label sits in its own column on
 * wide screens so every block starts its content on the same vertical line,
 * which is what makes six differently shaped sections read as one document.
 */
function Block({
  index,
  label,
  id,
  order,
  children,
}: {
  index: number
  label: string
  id?: string
  order: number
  children: ReactNode
}) {
  return (
    <section
      id={id}
      data-mascot-dock
      style={rise(order)}
      className="project-rise grid scroll-mt-32 gap-6 border-t border-gh-border pt-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10"
    >
      <SectionLabel index={String(index).padStart(2, "0")} className="h-fit">
        {label}
      </SectionLabel>
      <div className="min-w-0">{children}</div>
    </section>
  )
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
      body: (
        <ul className="flex flex-wrap gap-2.5">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-lg border border-gh-border bg-gh-surface/70 px-3.5 py-2 font-mono text-sm text-gh-text"
            >
              {tag}
            </li>
          ))}
        </ul>
      ),
    })
  }

  if (project.dev_notes) {
    blocks.push({
      label: "Dev notes",
      body: (
        // Framed like a file in a repository, because that is where notes
        // like these usually live, and so the section reads as a different
        // voice from the brief above it.
        <div className="overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/70">
          <div className="flex items-center gap-2 border-b border-gh-border px-5 py-3 font-mono text-xs text-gh-muted">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-gh-accent"
            />
            NOTES.md
          </div>
          <div className="px-5 py-6 sm:px-7">
            <ProjectProse body={project.dev_notes} />
          </div>
        </div>
      ),
    })
  }

  if (project.live_url || project.repo_url) {
    blocks.push({
      label: "Links",
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
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
    <ProjectsPageChrome>
      <TransitionSettled />
      <ProjectPeople team={team} projectName={project.name}>
        <article className="relative">
          <SectionTexture />
          <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-36 sm:px-6 lg:px-8">
            <div className="project-rise" style={rise(0)}>
              <ProjectsBackLink href="/projects">All projects</ProjectsBackLink>
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
    </ProjectsPageChrome>
  )
}

function LinkCard({
  href,
  icon,
  kicker,
  title,
  accent = false,
}: {
  href: string
  icon: ReactNode
  kicker: string
  title: string
  accent?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-4 rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.99] ${
        accent
          ? "border-gh-accent/40 bg-gh-accent/[0.07] hover:border-gh-accent/70 hover:bg-gh-accent/[0.12]"
          : "border-gh-border bg-gh-surface/70 hover:border-gh-muted/60 hover:bg-gh-elevated"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          accent
            ? "bg-gh-accent text-gh-deep"
            : "bg-gh-elevated text-gh-text ring-1 ring-inset ring-gh-border"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
          {kicker}
        </span>
        <span className="mt-1 block truncate font-semibold text-gh-text">
          {title}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-gh-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gh-text"
      />
    </a>
  )
}
