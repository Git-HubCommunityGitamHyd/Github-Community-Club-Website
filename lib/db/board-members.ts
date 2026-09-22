import { getDb } from "./client"

export type BoardMember = {
  id: number
  name: string
  role: string
  image_url: string | null
  description: string
  github: string | null
  linkedin: string | null
  email: string | null
  sort_order: number
  created_at: string
}

export type BoardMemberInput = {
  name: string
  role: string
  imageUrl: string | null
  description: string
  github: string | null
  linkedin: string | null
  email: string | null
  sortOrder: number
}

export async function listBoardMembers(): Promise<BoardMember[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM board_members ORDER BY sort_order, id")
    .all<BoardMember>()
  return results
}

export async function getBoardMember(id: number): Promise<BoardMember | null> {
  const db = await getDb()
  return db
    .prepare("SELECT * FROM board_members WHERE id = ?")
    .bind(id)
    .first<BoardMember>()
}

export async function insertBoardMember(
  input: BoardMemberInput,
): Promise<BoardMember> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO board_members (name, role, image_url, description, github, linkedin, email, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.name,
      input.role,
      input.imageUrl,
      input.description,
      input.github,
      input.linkedin,
      input.email,
      input.sortOrder,
    )
    .first<BoardMember>()
  if (!row) throw new Error("insertBoardMember: insert did not return a row")
  return row
}

export async function updateBoardMember(
  id: number,
  input: BoardMemberInput,
): Promise<BoardMember | null> {
  const db = await getDb()
  return db
    .prepare(
      `UPDATE board_members
       SET name = ?, role = ?, image_url = ?, description = ?,
           github = ?, linkedin = ?, email = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.name,
      input.role,
      input.imageUrl,
      input.description,
      input.github,
      input.linkedin,
      input.email,
      input.sortOrder,
      id,
    )
    .first<BoardMember>()
}

export async function deleteBoardMember(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM board_members WHERE id = ?").bind(id).run()
}
