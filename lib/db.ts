import { Pool } from "pg"

declare global {
  var pgPool: Pool | undefined
}

export const pool =
  global.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== "production") global.pgPool = pool

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
  const { rows } = await pool.query<Application>(
    `INSERT INTO applications (full_name, email, phone, branch, year, github_username, why_join)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.fullName,
      input.email,
      input.phone,
      input.branch,
      input.year,
      input.githubUsername,
      input.whyJoin,
    ],
  )
  return rows[0]
}

export async function listApplications(): Promise<Application[]> {
  const { rows } = await pool.query<Application>(
    "SELECT * FROM applications ORDER BY created_at DESC",
  )
  return rows
}
