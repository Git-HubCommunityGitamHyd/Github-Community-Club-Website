import { after } from "next/server"
import { setCommitCount, type Project } from "@/lib/db/projects"
import { setBuildCommitCount, type PublicBuild } from "@/lib/db/builds"

/** How old a cached count may get before a page view refreshes it. */
const STALE_MS = 24 * 60 * 60 * 1000

/** `owner/repo` from a GitHub URL, or null for anything else. */
export function parseRepo(url: string | null): string | null {
  if (!url) return null
  try {
    const { hostname, pathname } = new URL(url)
    if (hostname !== "github.com" && hostname !== "www.github.com") return null
    const [owner, repo] = pathname.split("/").filter(Boolean)
    if (!owner || !repo) return null
    return `${owner}/${repo.replace(/\.git$/, "")}`
  } catch {
    return null
  }
}

/**
 * Commits on the repository's default branch.
 *
 * One request whatever the size of the repo: ask for one commit per page, and
 * the `Link` header's `rel="last"` page number is then the commit count. With
 * no `Link` header everything fitted on the first page, so the count is the
 * length of that page. GitHub answers 409 for an empty repository.
 *
 * Resolves to null when the count cannot be known (no such repo, rate limit,
 * network), never throws.
 */
export async function fetchCommitCount(repoUrl: string | null) {
  const repo = parseRepo(repoUrl)
  if (!repo) return null

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "github-community-gitam",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  // Optional. Unauthenticated calls get 60 an hour per IP, plenty for a
  // once-a-day refresh of a handful of projects, but a Worker shares its IP.
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=1`,
      // A slow GitHub must not hold up a CMS save.
      { headers, cache: "no-store", signal: AbortSignal.timeout(5000) },
    )
    if (res.status === 409) return 0
    if (!res.ok) return null

    const last = res.headers.get("link")?.match(/[?&]page=(\d+)>;\s*rel="last"/)
    if (last) return Number(last[1])
    const page = (await res.json()) as unknown[]
    return Array.isArray(page) ? page.length : null
  } catch {
    return null
  }
}

/** Anything with a repository and a cached count: a project or a build. */
type Countable = Pick<Project, "id" | "repo_url" | "commits_synced_at">
type Save = (
  id: number,
  count: number | null,
  options: { keepOnFailure: boolean },
) => Promise<void>

/** Fetches and stores the count now. Used when the CMS saves a project. */
export async function syncCommitCount(project: Project) {
  const count = await fetchCommitCount(project.repo_url)
  await setCommitCount(project.id, count, { keepOnFailure: false })
  return count
}

/** Same, for a build saved in the CMS. */
export async function syncBuildCommitCount(
  build: Pick<PublicBuild, "id" | "repo_url">,
) {
  const count = await fetchCommitCount(build.repo_url)
  await setBuildCommitCount(build.id, count, { keepOnFailure: false })
  return count
}

function isStale(item: Countable, now: number) {
  if (!parseRepo(item.repo_url)) return false
  if (!item.commits_synced_at) return true
  return now - Date.parse(item.commits_synced_at) > STALE_MS
}

/**
 * Refreshes stale counts after the response has been sent, so a page view
 * never waits on GitHub: this view shows the cached number and the next one
 * shows the fresh one. A failed refresh keeps the old number and still
 * stamps the time, so an unreachable repo is retried daily, not per view.
 */
function refreshStale(items: Countable[], save: Save) {
  const now = Date.now()
  const stale = items.filter((item) => isStale(item, now))
  if (stale.length === 0) return
  after(async () => {
    for (const item of stale) {
      const count = await fetchCommitCount(item.repo_url)
      await save(item.id, count, { keepOnFailure: true })
    }
  })
}

export function refreshStaleCommitCounts(projects: Project[]) {
  refreshStale(projects, setCommitCount)
}

export function refreshStaleBuildCommitCounts(builds: PublicBuild[]) {
  refreshStale(builds, setBuildCommitCount)
}
