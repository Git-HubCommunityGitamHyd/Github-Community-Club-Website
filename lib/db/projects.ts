import { cache } from "react"
import { getDb } from "./client"
import type { Member } from "./members"
import { projectRole } from "@/features/projects/roles"

/**
 * `tags` is stored as JSON-encoded TEXT because SQLite has no array type. The
 * encode and decode live here and nowhere else, so every caller sees a plain
 * string[], exactly as events.images works.
 */
type ProjectRow = {
  id: number
  name: string
  slug: string
  summary: string
  body: string
  status: string
  live_url: string | null
  repo_url: string | null
  preview_image: string | null
  cover_image: string | null
  tags: string
  dev_notes: string
  /** Commits on the default branch; null when never synced or no repo. */
  commit_count: number | null
  commits_synced_at: string | null
  sort_order: number
  created_at: string
}

export type Project = Omit<ProjectRow, "tags"> & { tags: string[] }

export type ProjectInput = {
  name: string
  slug: string
  summary: string
  body: string
  status: string
  liveUrl: string | null
  repoUrl: string | null
  previewImage: string | null
  coverImage: string | null
  tags: string[]
  devNotes: string
  sortOrder: number
}

function decode(row: ProjectRow): Project {
  let tags: string[] = []
  try {
    const parsed = JSON.parse(row.tags)
    if (Array.isArray(parsed)) tags = parsed.map(String)
  } catch {
    // A malformed value is a row that predates this column or was written by
    // hand. An empty list renders; a thrown parse error takes the page down.
  }
  return { ...row, tags }
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM projects ORDER BY sort_order, id")
    .all<ProjectRow>()
  return results.map(decode)
}

export async function getProject(id: number): Promise<Project | null> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .bind(id)
    .first<ProjectRow>()
  return row ? decode(row) : null
}

export const getProjectBySlug = cache(async function getProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT * FROM projects WHERE slug = ?")
    .bind(slug)
    .first<ProjectRow>()
  return row ? decode(row) : null
})

const COLUMNS = `name, slug, summary, body, status, live_url, repo_url,
                 preview_image, cover_image, tags, dev_notes, sort_order`

function bindings(input: ProjectInput) {
  return [
    input.name,
    input.slug,
    input.summary,
    input.body,
    input.status,
    input.liveUrl,
    input.repoUrl,
    input.previewImage,
    input.coverImage,
    JSON.stringify(input.tags),
    input.devNotes,
    input.sortOrder,
  ]
}

export async function insertProject(input: ProjectInput): Promise<Project> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO projects (${COLUMNS})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(...bindings(input))
    .first<ProjectRow>()
  if (!row) throw new Error("insertProject: insert did not return a row")
  return decode(row)
}

export async function updateProject(
  id: number,
  input: ProjectInput,
): Promise<Project | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `UPDATE projects
       SET name = ?, slug = ?, summary = ?, body = ?, status = ?,
           live_url = ?, repo_url = ?, preview_image = ?, cover_image = ?,
           tags = ?, dev_notes = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(...bindings(input), id)
    .first<ProjectRow>()
  return row ? decode(row) : null
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb()
  // Explicit rather than trusting ON DELETE CASCADE; see deleteMember.
  await db.batch([
    db.prepare("DELETE FROM project_members WHERE project_id = ?").bind(id),
    db.prepare("DELETE FROM projects WHERE id = ?").bind(id),
  ])
}

/**
 * Stores a synced commit count and stamps the time. With `keepOnFailure` a
 * null count (GitHub unreachable) leaves the previous number in place; without
 * it null clears the number, which is what a changed or removed repo needs.
 */
export async function setCommitCount(
  id: number,
  count: number | null,
  { keepOnFailure }: { keepOnFailure: boolean },
): Promise<void> {
  const db = await getDb()
  await db
    .prepare(
      `UPDATE projects
       SET commit_count = ${keepOnFailure ? "COALESCE(?, commit_count)" : "?"},
           commits_synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    )
    .bind(count, id)
    .run()
}

/** A member as they appear on one project: their profile plus their part in it. */
export type TeamMember = Member & {
  /** Key into PROJECT_ROLES. Not `role`, which is the member's own headline. */
  project_role: string
  contribution: string
}

export type TeamEntry = {
  memberId: number
  role: string
  contribution: string
}

type TeamRow = TeamMember & { project_id: number; team_order: number }

const TEAM_SELECT = `
  SELECT m.*, t.name AS team_name, pm.project_id,
         pm.role AS project_role, pm.contribution, pm.sort_order AS team_order
  FROM project_members pm
  JOIN members m ON m.id = pm.member_id
  LEFT JOIN teams t ON t.id = m.team_id`

/**
 * Maintainers, then the lead, then members; within a role, the order the CMS
 * listed them in. Sorted here rather than in SQL so the order has one source,
 * PROJECT_ROLES.
 */
function byRole(a: TeamRow, b: TeamRow) {
  return (
    projectRole(a.project_role).rank - projectRole(b.project_role).rank ||
    a.team_order - b.team_order
  )
}

function strip(row: TeamRow): TeamMember {
  const member: Partial<TeamRow> = { ...row }
  delete member.project_id
  delete member.team_order
  return member as TeamMember
}

export async function listProjectTeam(
  projectId: number,
): Promise<TeamMember[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(`${TEAM_SELECT} WHERE pm.project_id = ?`)
    .bind(projectId)
    .all<TeamRow>()
  return results.sort(byRole).map(strip)
}

/** Every project's team in one query, for the listing page. */
export async function listTeamsByProject(): Promise<Map<number, TeamMember[]>> {
  const db = await getDb()
  const { results } = await db.prepare(TEAM_SELECT).all<TeamRow>()
  const teams = new Map<number, TeamMember[]>()
  for (const row of results.sort(byRole)) {
    const team = teams.get(row.project_id) ?? []
    team.push(strip(row))
    teams.set(row.project_id, team)
  }
  return teams
}

/** Replaces a project's whole team; the CMS always sends the full list. */
export async function setProjectTeam(
  projectId: number,
  team: TeamEntry[],
): Promise<void> {
  const db = await getDb()
  await db.batch([
    db
      .prepare("DELETE FROM project_members WHERE project_id = ?")
      .bind(projectId),
    ...team.map((entry, index) =>
      db
        .prepare(
          `INSERT INTO project_members (project_id, member_id, role, contribution, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(projectId, entry.memberId, entry.role, entry.contribution, index),
    ),
  ])
}
