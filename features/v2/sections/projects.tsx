"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Github } from "lucide-react"
import type { Project } from "@/lib/db/projects"
import { SectionTexture } from "@/components/ui/texture"
import { SectionLabel } from "@/features/v2/section-label"
import { ProjectStatusBadge } from "@/features/v2/projects/status-badge"
import {
  ProjectHoverPreview,
  type PreviewTarget,
} from "@/features/v2/projects/project-hover-preview"

/**
 * The homepage project list.
 *
 * A row per project rather than a card grid, for two reasons. The projects
 * page already uses a grid, and repeating it here would make the two read as
 * the same screen twice. And a list is what the hover preview needs: rows give
 * the cursor a long, unambiguous target to travel along, where a grid makes
 * the preview jump around the screen chasing tiles.
 *
 * At most five. The sixth project is what the projects page is for.
 */
const HOME_LIMIT = 5

export function V2ProjectsSection({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<PreviewTarget | null>(null)

  // The caller already guards this, but a section that renders its heading
  // and then nothing is worse than a section that is absent, so it refuses
  // twice.
  if (projects.length === 0) return null

  const shown = projects.slice(0, HOME_LIMIT)
  const hasMore = projects.length > HOME_LIMIT

  return (
    // The hairline is the section's closing edge. Without it the project list
    // ran straight into the benefits stack with nothing between them, so the
    // two read as one long run. A hatch band would also divide them, but the
    // hatch is reserved for the start and end of the textured middle of the
    // page (see the comment in v2-page.tsx) and putting one mid-run turns a
    // seam detail into a page motif. A rule matches the language this section
    // already speaks: its own rows are separated the same way.
    <section id="projects" className="relative border-b border-gh-border">
      <SectionTexture />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionLabel index="05">Projects</SectionLabel>
        <h2 className="mb-4 mt-4 text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
          What we are building
        </h2>
        <p className="mb-14 max-w-[52ch] text-pretty text-lg leading-relaxed text-gh-muted">
          Some of it is running on campus today. Some of it is half-finished in
          a branch. Both are public.
        </p>

        <div ref={listRef} onPointerLeave={() => setPreview(null)}>
          {shown.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              onEnter={setPreview}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-12">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2.5 rounded-full border border-gh-border px-6 py-3 text-[15px] font-semibold text-gh-text transition-colors duration-300 hover:border-gh-accent hover:bg-gh-accent hover:text-gh-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
            >
              View all {projects.length} projects
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        )}
      </div>

      <ProjectHoverPreview target={preview} containerRef={listRef} />
    </section>
  )
}

function ProjectRow({
  project,
  index,
  onEnter,
}: {
  project: Project
  index: number
  onEnter: (target: PreviewTarget | null) => void
}) {
  // A preview needs somewhere to go and something to show. Either missing and
  // the row simply behaves like a normal row, which is the brief's own rule.
  const previewable =
    project.live_url && project.preview_image
      ? {
          id: project.id,
          name: project.name,
          image: project.preview_image,
          href: project.live_url,
        }
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      onPointerEnter={() => onEnter(previewable)}
      className="group/row relative border-t border-gh-border last:border-b"
    >
      {/* A wash that enters under the row on hover, so the whole row reads as
          one target rather than only the link inside it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gh-elevated/40 opacity-0 transition-all duration-300 ease-out group-hover/row:scale-x-100 group-hover/row:opacity-100"
      />

      <div className="relative flex flex-col gap-4 px-2 py-7 sm:flex-row sm:items-center sm:gap-7">
        <span className="font-mono text-[13px] font-bold tabular-nums text-gh-border transition-colors duration-300 group-hover/row:text-gh-accent">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[clamp(20px,2.2vw,28px)] font-extrabold tracking-[-0.02em]">
              <Link
                href={`/projects/${project.slug}`}
                className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
              >
                {project.name}
              </Link>
            </h3>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-2 max-w-[62ch] text-pretty leading-relaxed text-gh-muted">
            {project.summary}
          </p>
        </div>

        {/* Above the row's own stretched link, or these would be unclickable. */}
        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {project.repo_url && (
            <IconLink href={project.repo_url} label={`${project.name} source`}>
              <Github aria-hidden="true" className="h-4 w-4" />
            </IconLink>
          )}
          {project.live_url && (
            <IconLink href={project.live_url} label={`${project.name} live`}>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </IconLink>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-gh-border text-gh-muted transition-colors duration-200 hover:border-gh-accent hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
    >
      {children}
    </a>
  )
}
