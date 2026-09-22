import { getDb } from "./client"

export type Application = {
  id: number
  full_name: string
  email: string
  phone: string
  branch: string
  year: string
  github_username: string | null
  why_join: string
  created_at: string
}

export type ApplicationInput = {
  fullName: string
  email: string
  phone: string
  branch: string
  year: string
  githubUsername: string | null
  whyJoin: string
}

export async function insertApplication(
  input: ApplicationInput,
): Promise<Application> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO applications (full_name, email, phone, branch, year, github_username, why_join)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.fullName,
      input.email,
      input.phone,
      input.branch,
      input.year,
      input.githubUsername,
      input.whyJoin,
    )
    .first<Application>()
  if (!row) throw new Error("insertApplication: insert did not return a row")
  return row
}

export async function listApplications(): Promise<Application[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM applications ORDER BY created_at DESC")
    .all<Application>()
  return results
}
