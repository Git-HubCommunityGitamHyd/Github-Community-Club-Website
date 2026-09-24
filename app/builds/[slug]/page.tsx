import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { CalendarCheck, Github, Globe, Star } from "lucide-react"
import { getPublicBuildBySlug } from "@/lib/db/builds"
import { parseRepo, refreshStaleBuildCommitCounts } from "@/lib/github/commits"
import { monthLabel, weekLabel } from "@/features/builds/keys"
import { stackOf } from "@/features/builds/format"
import { BuildGallery } from "@/features/builds/build-gallery"
import { BuildFaces, BuildPeople } from "@/features/builds/build-people"
import { PageChrome } from "@/features/site/page-chrome"
import { BackLink } from "@/features/site/back-link"
import { ProjectProse } from "@/features/projects/prose"
import { CommitCount } from "@/features/site/commit-count"
import { TransitionSettled } from "@/features/site/transition"
import { buildTransitionName } from "@/features/site/transition-name"
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
  const build = await getPublicBuildBySlug((await params).slug)
  if (!build) return { title: "Build not found" }
  return {
    title: `${build.title} | Student builds | GitHub Community GITAM`,
    description: build.tagline,
    openGraph: build.images[0]
      ? { images: [{ url: build.images[0] }] }
      : undefined,
  }
}

/**
 * A student build's own page, laid out exactly like a club project's: name
 * and commits, the people as faces, then numbered blocks (brief, screenshots,
 * stack, dev notes, links, people), each left out when it has nothing in it.
 * Only accepted builds have a page; anything else is a 404.
 */
export default async function BuildPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const build = await getPublicBuildBySlug((await params).slug)
  if (!build) notFound()

  refreshStaleBuildCommitCounts([build])

  const repo = parseRepo(build.repo_url)
  const liveHost = build.live_url
    ? new URL(build.live_url).host.replace(/^www\./, "")
    : null
  const stack = stackOf(build)
  const cover = build.images[0]

  const blocks: { label: string; id?: string; body: ReactNode }[] = [
    {
      label: "Brief",
      body: (
        <>
          <p className="max-w-[60ch] text-pretty text-xl leading-relaxed text-gh-text">
            {build.tagline}
          </p>
          {cover && (
            <div
              style={{
                viewTransitionName: buildTransitionName(build.slug, "cover"),
              }}
              className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gh-border bg-gh-elevated"
            >
              <Image
                src={cover}
                alt={`${build.title}, cover`}
                fill
                sizes="(max-width: 1024px) 100vw, 780px"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="mt-10">
            <ProjectProse body={build.description} />
          </div>
        </>
      ),
    },
  ]

  if (build.images.length > 1) {
    blocks.push({
      label: "Screenshots",
      body: <BuildGallery images={build.images} title={build.title} />,
    })
  }

  if (stack.length > 0) {
    blocks.push({ label: "Tech stack", body: <TechStack items={stack} /> })
  }

  if (build.dev_notes) {
    blocks.push({
      label: "Dev notes",
      body: (
        <NotesFrame>
          <ProjectProse body={build.dev_notes} />
        </NotesFrame>
      ),
    })
  }

  if (build.live_url || build.repo_url) {
    blocks.push({
      label: "Links",
      body: (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          {build.live_url && (
            <LinkCard
              href={build.live_url}
              icon={<Globe aria-hidden="true" className="h-5 w-5" />}
              kicker="Try it"
              title={liveHost ?? build.live_url}
              accent
            />
          )}
          {build.repo_url && (
            <LinkCard
              href={build.repo_url}
              icon={<Github aria-hidden="true" className="h-5 w-5" />}
              kicker="Source"
              title={repo ?? build.repo_url}
            />
          )}
        </div>
      ),
    })
  }

  if (build.credits.length > 0) {
    blocks.push({
      label: "People",
      id: "people",
      body: <BuildPeople credits={build.credits} />,
    })
  }

  return (
    <PageChrome>
      <TransitionSettled />
      <article className="relative">
        <SectionTexture />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-36 sm:px-6 lg:px-8">
          <div className="project-rise" style={rise(0)}>
            <BackLink href="/builds">All builds</BackLink>
          </div>

          <header className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div
                className="project-rise flex flex-wrap gap-2"
                style={rise(1)}
              >
                {build.month && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gh-border bg-gh-elevated/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gh-muted">
                    <CalendarCheck aria-hidden="true" className="size-3" />
                    {monthLabel(build.month)} builds
                  </span>
                )}
                {build.week_of && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gh-accent/40 bg-gh-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gh-accent">
                    <Star aria-hidden="true" className="size-3" />
                    Pick of the week of {weekLabel(build.week_of)}
                  </span>
                )}
              </div>
              <h1 className="mt-5 text-balance text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[1.03] tracking-[-0.035em]">
                <span
                  className="inline-block"
                  style={{
                    viewTransitionName: buildTransitionName(
                      build.slug,
                      "title",
                    ),
                  }}
                >
                  {build.title}
                </span>
              </h1>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
              <MascotSlot />
              {build.commit_count !== null && build.repo_url && (
                <div className="project-rise" style={rise(2)}>
                  <CommitCount
                    count={build.commit_count}
                    repoUrl={build.repo_url}
                  />
                </div>
              )}
            </div>
          </header>

          {build.credits.length > 0 && (
            <div className="project-rise mt-7" style={rise(3)}>
              <BuildFaces credits={build.credits} />
            </div>
          )}

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
    </PageChrome>
  )
}
