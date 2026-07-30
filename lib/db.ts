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
  const { rows } = await pool.query<BoardMember>(
    "SELECT * FROM board_members ORDER BY sort_order, id",
  )
  return rows
}

export async function getBoardMember(id: number): Promise<BoardMember | null> {
  const { rows } = await pool.query<BoardMember>(
    "SELECT * FROM board_members WHERE id = $1",
    [id],
  )
  return rows[0] ?? null
}

export async function insertBoardMember(
  input: BoardMemberInput,
): Promise<BoardMember> {
  const { rows } = await pool.query<BoardMember>(
    `INSERT INTO board_members (name, role, image_url, description, github, linkedin, email, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.name,
      input.role,
      input.imageUrl,
      input.description,
      input.github,
      input.linkedin,
      input.email,
      input.sortOrder,
    ],
  )
  return rows[0]
}

export async function updateBoardMember(
  id: number,
  input: BoardMemberInput,
): Promise<BoardMember | null> {
  const { rows } = await pool.query<BoardMember>(
    `UPDATE board_members
     SET name = $1, role = $2, image_url = $3, description = $4,
         github = $5, linkedin = $6, email = $7, sort_order = $8
     WHERE id = $9
     RETURNING *`,
    [
      input.name,
      input.role,
      input.imageUrl,
      input.description,
      input.github,
      input.linkedin,
      input.email,
      input.sortOrder,
      id,
    ],
  )
  return rows[0] ?? null
}

export async function deleteBoardMember(id: number): Promise<void> {
  await pool.query("DELETE FROM board_members WHERE id = $1", [id])
}

export type Event = {
  id: number
  title: string
  event_date: string
  location: string | null
  attendees: number | null
  category: string
  duration: string | null
  description: string
  images: string[]
  sort_order: number
  created_at: string
}

export type EventInput = {
  title: string
  eventDate: string
  location: string | null
  attendees: number | null
  category: string
  duration: string | null
  description: string
  images: string[]
  sortOrder: number
}

export async function listEvents(): Promise<Event[]> {
  const { rows } = await pool.query<Event>(
    "SELECT * FROM events ORDER BY sort_order, id",
  )
  return rows
}

export async function getEvent(id: number): Promise<Event | null> {
  const { rows } = await pool.query<Event>(
    "SELECT * FROM events WHERE id = $1",
    [id],
  )
  return rows[0] ?? null
}

export async function insertEvent(input: EventInput): Promise<Event> {
  const { rows } = await pool.query<Event>(
    `INSERT INTO events (title, event_date, location, attendees, category, duration, description, images, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.title,
      input.eventDate,
      input.location,
      input.attendees,
      input.category,
      input.duration,
      input.description,
      input.images,
      input.sortOrder,
    ],
  )
  return rows[0]
}

export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<Event | null> {
  const { rows } = await pool.query<Event>(
    `UPDATE events
     SET title = $1, event_date = $2, location = $3, attendees = $4,
         category = $5, duration = $6, description = $7, images = $8, sort_order = $9
     WHERE id = $10
     RETURNING *`,
    [
      input.title,
      input.eventDate,
      input.location,
      input.attendees,
      input.category,
      input.duration,
      input.description,
      input.images,
      input.sortOrder,
      id,
    ],
  )
  return rows[0] ?? null
}

export async function deleteEvent(id: number): Promise<void> {
  await pool.query("DELETE FROM events WHERE id = $1", [id])
}
