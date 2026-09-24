import { getDb } from "./client"

/**
 * A club member. The columns deliberately match board_members (see
 * db/schema.sql), so both render through one profile dialog.
 */
export type MemberRow = {
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
  /** Key into BOARD_ACCENTS: the ring around their avatar. */
  accent: string
  /** One line in their own words, on their card. Empty when unset. */
  tagline: string
  /** Shown as "@handle" on their card. Null falls back to github. */
  handle: string | null
  team_id: number | null
  sort_order: number
  created_at: string
}

/** As read for display: with their team's name joined in. */
export type Member = MemberRow & { team_name: string | null }

/** For the members page: what they worked on, newest project order first. */
export type MemberWithProjects = Member & {
  projects: { name: string; slug: string }[]
}

/** Every read goes through this, so every caller gets the team name. */
const MEMBER_SELECT = `
  SELECT m.*, t.name AS team_name
  FROM members m
  LEFT JOIN teams t ON t.id = m.team_id`

export type MemberInput = {
  name: string
  role: string
  description: string
  imageUrl: string | null
  github: string | null
  linkedin: string | null
  email: string | null
  accent: string
  tagline: string
  handle: string | null
  teamId: number | null
  sortOrder: number
}

export async function listMembers(): Promise<Member[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(`${MEMBER_SELECT} ORDER BY m.sort_order, m.name, m.id`)
    .all<Member>()
  return results
}

/**
 * Members with the projects they are tagged on, in two queries rather than
 * one per member.
 */
export async function listMembersWithProjects(): Promise<MemberWithProjects[]> {
  const db = await getDb()
  const [members, links] = await Promise.all([
    listMembers(),
    db
      .prepare(
        `SELECT pm.member_id, p.name, p.slug
         FROM project_members pm
         JOIN projects p ON p.id = pm.project_id
         ORDER BY p.sort_order, p.id`,
      )
      .all<{ member_id: number; name: string; slug: string }>(),
  ])
  const byMember = new Map<number, { name: string; slug: string }[]>()
  for (const { member_id, name, slug } of links.results) {
    const list = byMember.get(member_id) ?? []
    list.push({ name, slug })
    byMember.set(member_id, list)
  }
  return members.map((member: Member) => ({
    ...member,
    projects: byMember.get(member.id) ?? [],
  }))
}

export async function getMember(id: number): Promise<Member | null> {
  const db = await getDb()
  return db.prepare(`${MEMBER_SELECT} WHERE m.id = ?`).bind(id).first<Member>()
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
    input.tagline,
    input.handle,
    input.teamId,
    input.sortOrder,
  ]
}

export async function insertMember(input: MemberInput): Promise<MemberRow> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO members (name, role, description, image_url, github, linkedin, email, accent, tagline, handle, team_id, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(...bindings(input))
    .first<MemberRow>()
  if (!row) throw new Error("insertMember: insert did not return a row")
  return row
}

export async function updateMember(
  id: number,
  input: MemberInput,
): Promise<MemberRow | null> {
  const db = await getDb()
  return db
    .prepare(
      `UPDATE members
       SET name = ?, role = ?, description = ?, image_url = ?,
           github = ?, linkedin = ?, email = ?, accent = ?, tagline = ?,
           handle = ?, team_id = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(...bindings(input), id)
    .first<MemberRow>()
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
