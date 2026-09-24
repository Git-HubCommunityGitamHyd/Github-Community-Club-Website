import { getDb } from "./client"

/**
 * A person who builds club projects. The columns deliberately match
 * board_members (see db/schema.sql), so both render through one profile
 * dialog.
 */
export type Member = {
  id: number
  name: string
  /** One-line headline, e.g. "Backend, third year CSE". */
  role: string
  description: string
  image_url: string | null
  /** A username, not a URL. */
  github: string | null
  linkedin: string | null
  email: string | null
  /** Key into BOARD_ACCENTS. */
  accent: string
  sort_order: number
  created_at: string
}

export type MemberInput = {
  name: string
  role: string
  description: string
  imageUrl: string | null
  github: string | null
  linkedin: string | null
  email: string | null
  accent: string
  sortOrder: number
}

export async function listMembers(): Promise<Member[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM members ORDER BY sort_order, name, id")
    .all<Member>()
  return results
}

export async function getMember(id: number): Promise<Member | null> {
  const db = await getDb()
  return db
    .prepare("SELECT * FROM members WHERE id = ?")
    .bind(id)
    .first<Member>()
}

function bindings(input: MemberInput) {
  return [
    input.name,
    input.role,
    input.description,
    input.imageUrl,
    input.github,
    input.linkedin,
    input.email,
    input.accent,
    input.sortOrder,
  ]
}

export async function insertMember(input: MemberInput): Promise<Member> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO members (name, role, description, image_url, github, linkedin, email, accent, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(...bindings(input))
    .first<Member>()
  if (!row) throw new Error("insertMember: insert did not return a row")
  return row
}

export async function updateMember(
  id: number,
  input: MemberInput,
): Promise<Member | null> {
  const db = await getDb()
  return db
    .prepare(
      `UPDATE members
       SET name = ?, role = ?, description = ?, image_url = ?,
           github = ?, linkedin = ?, email = ?, accent = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(...bindings(input), id)
    .first<Member>()
}

export async function deleteMember(id: number): Promise<void> {
  const db = await getDb()
  // The join rows go explicitly rather than trusting ON DELETE CASCADE, which
  // only fires when the connection has foreign keys switched on.
  await db.batch([
    db.prepare("DELETE FROM project_members WHERE member_id = ?").bind(id),
    db.prepare("DELETE FROM members WHERE id = ?").bind(id),
  ])
}
