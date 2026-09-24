import { getDb } from "./client"

/** A club team. Members point at one through members.team_id. */
export type Team = {
  id: number
  name: string
  description: string
  sort_order: number
  created_at: string
}

export type TeamInput = {
  name: string
  description: string
  sortOrder: number
}

/** Each team with how many members are on it, for the admin list. */
export type TeamWithCount = Team & { member_count: number }

export async function listTeams(): Promise<TeamWithCount[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT t.*, COUNT(m.id) AS member_count
       FROM teams t
       LEFT JOIN members m ON m.team_id = t.id
       GROUP BY t.id
       ORDER BY t.sort_order, t.name`,
    )
    .all<TeamWithCount>()
  return results
}

export async function getTeam(id: number): Promise<Team | null> {
  const db = await getDb()
  return db.prepare("SELECT * FROM teams WHERE id = ?").bind(id).first<Team>()
}

export async function insertTeam(input: TeamInput): Promise<Team> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO teams (name, description, sort_order)
       VALUES (?, ?, ?)
       RETURNING *`,
    )
    .bind(input.name, input.description, input.sortOrder)
    .first<Team>()
  if (!row) throw new Error("insertTeam: insert did not return a row")
  return row
}

export async function updateTeam(
  id: number,
  input: TeamInput,
): Promise<Team | null> {
  const db = await getDb()
  return db
    .prepare(
      `UPDATE teams SET name = ?, description = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(input.name, input.description, input.sortOrder, id)
    .first<Team>()
}

export async function deleteTeam(id: number): Promise<void> {
  const db = await getDb()
  // Members stay; they just lose the team. Done explicitly rather than trusting
  // ON DELETE SET NULL, which needs foreign keys switched on.
  await db.batch([
    db.prepare("UPDATE members SET team_id = NULL WHERE team_id = ?").bind(id),
    db.prepare("DELETE FROM teams WHERE id = ?").bind(id),
  ])
}
