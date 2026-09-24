import { getDb } from "./client"
import { RESERVED_BUILD_SLUGS, type Credit } from "@/features/builds/keys"

/** A whole row, private fields included. Only admin screens get this. */
export type Build = {
  id: number
  slug: string
  title: string
  tagline: string
  description: string
  built_with: string
  live_url: string | null
  repo_url: string | null
  images: string[]
  dev_notes: string
  credits: Credit[]
  commit_count: number | null
  commits_synced_at: string | null
  /** The submitter's name and teammates, as they sent them. */
  name: string
  teammates: string
  year: string
  branch: string
  reg_no: string
  phone: string
  status: string
  month: string | null
  week_of: string | null
  admin_note: string
  sort_order: number
  created_at: string
  reviewed_at: string | null
}

/**
 * What the public pages may see. Named columns only, like PublicProposal, so
 * a new private column cannot leak by default.
 */
export type PublicBuild = Pick<
  Build,
  | "id"
  | "slug"
  | "title"
  | "tagline"
  | "description"
  | "built_with"
  | "live_url"
  | "repo_url"
  | "images"
  | "dev_notes"
  | "credits"
  | "commit_count"
  | "commits_synced_at"
  | "month"
  | "week_of"
>

type BuildFields = {
  title: string
  tagline: string
  description: string
  builtWith: string
  liveUrl: string | null
  repoUrl: string | null
  images: string[]
  devNotes: string
}

export type BuildSubmission = BuildFields & {
  name: string
  teammates: string
  year: string
  branch: string
  regNo: string
  phone: string
}

export type BuildReview = BuildFields & {
  slug: string
  credits: Credit[]
  status: string
  month: string | null
  weekOf: string | null
  sortOrder: number
  adminNote: string
}

// images and credits are JSON in TEXT columns, as events.images is.
type Row<T> = Omit<T, "images" | "credits"> & {
  images: string
  credits: string
}

function decode<T>(row: Row<T>): T {
  return {
    ...row,
    images: JSON.parse(row.images),
    credits: JSON.parse(row.credits),
  } as T
}

/** Builder first, then teammates, from what the form collected. */
export function creditsFromSubmission(
  name: string,
  teammates: string,
): Credit[] {
  return [
    { name, role: "lead", contribution: "" },
    ...teammates
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((mate) => ({ name: mate, role: "member", contribution: "" })),
  ]
}

const PUBLIC_COLUMNS =
  "id, slug, title, tagline, description, built_with, live_url, repo_url, images, dev_notes, credits, commit_count, commits_synced_at, month, week_of"

/** Accepted builds, newest month first, in the CMS's order within a month. */
export async function listPublicBuilds(): Promise<PublicBuild[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT ${PUBLIC_COLUMNS} FROM builds
       WHERE status = 'accepted' AND month IS NOT NULL
       ORDER BY month DESC, sort_order, id DESC`,
    )
    .all<Row<PublicBuild>>()
  return results.map((row: Row<PublicBuild>) => decode<PublicBuild>(row))
}

/** One accepted build by its slug, for /builds/<slug>. */
export async function getPublicBuildBySlug(
  slug: string,
): Promise<PublicBuild | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT ${PUBLIC_COLUMNS} FROM builds
       WHERE slug = ? AND status = 'accepted' AND month IS NOT NULL`,
    )
    .bind(slug)
    .first<Row<PublicBuild>>()
  return row ? decode<PublicBuild>(row) : null
}

export async function listBuilds(): Promise<Build[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT * FROM builds
       ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END,
                CASE status WHEN 'pending' THEN created_at END ASC,
                month DESC, sort_order, created_at DESC`,
    )
    .all<Row<Build>>()
  return results.map((row: Row<Build>) => decode<Build>(row))
}

export async function countPendingBuilds(): Promise<number> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM builds WHERE status = 'pending'")
    .first<{ n: number }>()
  return row?.n ?? 0
}

export async function getBuild(id: number): Promise<Build | null> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT * FROM builds WHERE id = ?")
    .bind(id)
    .first<Row<Build>>()
  return row ? decode<Build>(row) : null
}

/**
 * Stores a submission with a slug from its title. A title another build
 * already has gets the new row's id appended, so two "Attendance Tracker"s
 * can both exist without the submitter ever seeing a "slug taken" error.
 */
export async function insertBuild(
  input: BuildSubmission,
  trackHash: string,
  baseSlug: string,
): Promise<void> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO builds
         (title, tagline, description, built_with, live_url, repo_url, images,
          dev_notes, credits, name, teammates, year, branch, reg_no, phone,
          track_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
    )
    .bind(
      input.title,
      input.tagline,
      input.description,
      input.builtWith,
      input.liveUrl,
      input.repoUrl,
      JSON.stringify(input.images),
      input.devNotes,
      JSON.stringify(creditsFromSubmission(input.name, input.teammates)),
      input.name,
      input.teammates,
      input.year,
      input.branch,
      input.regNo,
      input.phone,
      trackHash,
    )
    .first<{ id: number }>()
  if (!row) throw new Error("insertBuild: insert did not return a row")

  const base = baseSlug || "build"
  const taken =
    RESERVED_BUILD_SLUGS.includes(base) ||
    (await db.prepare("SELECT 1 FROM builds WHERE slug = ?").bind(base).first())
  await db
    .prepare("UPDATE builds SET slug = ? WHERE id = ?")
    .bind(taken ? `${base}-${row.id}` : base, row.id)
    .run()
}

export async function updateBuild(
  id: number,
  input: BuildReview,
): Promise<Build | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `UPDATE builds
       SET slug = ?, title = ?, tagline = ?, description = ?, built_with = ?,
           live_url = ?, repo_url = ?, images = ?, dev_notes = ?, credits = ?,
           status = ?, month = ?, week_of = ?, sort_order = ?, admin_note = ?,
           reviewed_at = CASE
             WHEN ? = 'pending' THEN reviewed_at
             ELSE COALESCE(reviewed_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
           END
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.slug,
      input.title,
      input.tagline,
      input.description,
      input.builtWith,
      input.liveUrl,
      input.repoUrl,
      JSON.stringify(input.images),
      input.devNotes,
      JSON.stringify(input.credits),
      input.status,
      input.month,
      input.weekOf,
      input.sortOrder,
      input.adminNote,
      input.status,
      id,
    )
    .first<Row<Build>>()
  return row ? decode<Build>(row) : null
}

export async function setBuildCommitCount(
  id: number,
  count: number | null,
  { keepOnFailure }: { keepOnFailure: boolean },
): Promise<void> {
  const db = await getDb()
  await db
    .prepare(
      `UPDATE builds
       SET commit_count = ${keepOnFailure ? "COALESCE(?, commit_count)" : "?"},
           commits_synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    )
    .bind(count, id)
    .run()
}

export async function deleteBuild(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM builds WHERE id = ?").bind(id).run()
}

/** What the submitter's private link shows. */
export type TrackedBuild = Pick<
  Build,
  | "id"
  | "slug"
  | "title"
  | "status"
  | "month"
  | "week_of"
  | "created_at"
  | "reviewed_at"
>

export async function getBuildByTrackHash(
  hash: string,
): Promise<TrackedBuild | null> {
  const db = await getDb()
  return db
    .prepare(
      `SELECT id, slug, title, status, month, week_of, created_at, reviewed_at
       FROM builds WHERE track_hash = ?`,
    )
    .bind(hash)
    .first<TrackedBuild>()
}
