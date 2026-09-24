import { getDb } from "./client"

/** A whole row, private fields included. Only admin screens get this. */
export type Build = {
  id: number
  title: string
  tagline: string
  description: string
  built_with: string
  live_url: string | null
  repo_url: string | null
  images: string[]
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

/** What /builds may see. Named columns only, like PublicProposal. */
export type PublicBuild = Pick<
  Build,
  | "id"
  | "title"
  | "tagline"
  | "description"
  | "built_with"
  | "live_url"
  | "repo_url"
  | "images"
  | "name"
  | "teammates"
  | "month"
  | "week_of"
>

export type BuildInput = {
  title: string
  tagline: string
  description: string
  builtWith: string
  liveUrl: string | null
  repoUrl: string | null
  images: string[]
  name: string
  teammates: string
}

export type BuildSubmission = BuildInput & {
  year: string
  branch: string
  regNo: string
  phone: string
}

export type BuildReview = BuildInput & {
  status: string
  month: string | null
  weekOf: string | null
  sortOrder: number
  adminNote: string
}

// images is JSON in a TEXT column, as in events.ts.
type Row<T extends { images: string[] }> = Omit<T, "images"> & {
  images: string
}

function decode<T extends { images: string[] }>(row: Row<T>): T {
  return { ...row, images: JSON.parse(row.images) } as T
}

const PUBLIC_COLUMNS =
  "id, title, tagline, description, built_with, live_url, repo_url, images, name, teammates, month, week_of"

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

export async function insertBuild(
  input: BuildSubmission,
  trackHash: string,
): Promise<void> {
  const db = await getDb()
  await db
    .prepare(
      `INSERT INTO builds
         (title, tagline, description, built_with, live_url, repo_url, images,
          name, teammates, year, branch, reg_no, phone, track_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.title,
      input.tagline,
      input.description,
      input.builtWith,
      input.liveUrl,
      input.repoUrl,
      JSON.stringify(input.images),
      input.name,
      input.teammates,
      input.year,
      input.branch,
      input.regNo,
      input.phone,
      trackHash,
    )
    .run()
}

/** What the submitter's private link shows. */
export type TrackedBuild = Pick<
  Build,
  "id" | "title" | "status" | "month" | "week_of" | "created_at" | "reviewed_at"
>

export async function getBuildByTrackHash(
  hash: string,
): Promise<TrackedBuild | null> {
  const db = await getDb()
  return db
    .prepare(
      `SELECT id, title, status, month, week_of, created_at, reviewed_at
       FROM builds WHERE track_hash = ?`,
    )
    .bind(hash)
    .first<TrackedBuild>()
}

export async function updateBuild(
  id: number,
  input: BuildReview,
): Promise<Build | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `UPDATE builds
       SET title = ?, tagline = ?, description = ?, built_with = ?,
           live_url = ?, repo_url = ?, images = ?, name = ?, teammates = ?,
           status = ?, month = ?, week_of = ?, sort_order = ?, admin_note = ?,
           reviewed_at = CASE
             WHEN ? = 'pending' THEN reviewed_at
             ELSE COALESCE(reviewed_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
           END
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.title,
      input.tagline,
      input.description,
      input.builtWith,
      input.liveUrl,
      input.repoUrl,
      JSON.stringify(input.images),
      input.name,
      input.teammates,
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

export async function deleteBuild(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM builds WHERE id = ?").bind(id).run()
}
