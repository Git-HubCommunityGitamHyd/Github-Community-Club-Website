import Image from "next/image"
import type { CSSProperties } from "react"
import { ArrowUpRight, GitCommitHorizontal, Github } from "lucide-react"
import type { Project, TeamMember } from "@/lib/db/projects"
import { ProjectStatusBadge } from "@/features/projects/status-badge"
import { CardAvatars } from "@/features/projects/people"
import { TransitionLink, TransitionSettled } from "@/features/site/transition"
import { transitionName } from "@/features/site/transition-name"

/**
 * Every project, as cards.
 *
 * No hover preview here, by the brief: the homepage list is a teaser that
 * benefits from a peek, and this page is the real index where the cover image
 * is already on screen and a preview window would be covering the thing it
 * was previewing.
 *
 * The first project spans the full width rather than sitting in a third of it.
 * Six identical cards in a three-column grid is the most generic layout a
 * project index can have, and giving the lead project its own row costs
 * nothing and gives the page somewhere to start reading.
 */
export function ProjectsGrid({
  projects,
  teams,
}: {
  projects: Project[]
  teams: Map<number, TeamMember[]>
}) {
  const [lead, ...rest] = projects

  return (
    <div className="space-y-6">
      {/* Coming back from a project page lands here. */}
      <TransitionSettled />
      {/* data-mascot-dock: the octocat docks beside the lead project, then
          crosses to the other side for the grid (features/mascot). */}
      {lead && (
        <div data-mascot-dock>
          <ProjectCard
            project={lead}
            team={teams.get(lead.id) ?? []}
            featured
          />
        </div>
      )}
      {rest.length > 0 && (
        <div
          data-mascot-dock
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              team={teams.get(project.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  team,
  featured = false,
}: {
  project: Project
  team: TeamMember[]
  featured?: boolean
}) {
  const href = `/projects/${project.slug}`
  return (
    <article
      className={`group relative flex overflow-hidden rounded-2xl border border-gh-border bg-gh-surface transition-colors duration-300 hover:border-gh-muted/60 ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div
        // Only a real cover travels to the project page; the dot field has
        // nothing to land on there.
        style={
          project.cover_image
            ? ({
                viewTransitionName: transitionName(project.slug, "cover"),
              } as CSSProperties)
            : undefined
        }
        className={`relative shrink-0 overflow-hidden bg-gh-elevated ${
          featured ? "aspect-[16/9] md:aspect-auto md:w-1/2" : "aspect-[16/10]"
        }`}
      >
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt=""
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, 33vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          // No cover is a real state, not an oversight. A dot field keeps the
          // card's shape rather than collapsing the grid row.
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(140,149,159,0.3) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
        )}
      </div>

      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-9" : ""}`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2
            style={{
              viewTransitionName: transitionName(project.slug, "title"),
            }}
            className={`font-extrabold tracking-[-0.02em] ${
              featured ? "text-[clamp(24px,3vw,36px)]" : "text-xl"
            }`}
          >
            <TransitionLink
              href={href}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
            >
              {project.name}
            </TransitionLink>
          </h2>
          <ProjectStatusBadge status={project.status} />
        </div>

        {team.length > 0 && (
          <div className="mt-4">
            <CardAvatars
              team={team}
              projectName={project.name}
              moreHref={`${href}#team`}
            />
          </div>
        )}

        <p
          className={`mt-3 flex-1 text-pretty leading-relaxed text-gh-muted ${
            featured ? "max-w-[52ch] text-lg" : "text-sm"
          }`}
        >
          {project.summary}
        </p>

        {project.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-gh-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gh-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/* Above the card's stretched link so these stay clickable. */}
        {(project.repo_url || project.live_url) && (
          <div className="relative z-10 mt-6 flex items-center gap-2">
            {project.commit_count !== null && (
              <span className="mr-auto inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-gh-muted">
                <GitCommitHorizontal aria-hidden="true" className="h-4 w-4" />
                {project.commit_count.toLocaleString()} commits
              </span>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} source`}
                className="flex size-9 items-center justify-center rounded-full border border-gh-border text-gh-muted transition-colors duration-200 hover:border-gh-accent hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <Github aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} live`}
                className="flex size-9 items-center justify-center rounded-full border border-gh-border text-gh-muted transition-colors duration-200 hover:border-gh-accent hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
