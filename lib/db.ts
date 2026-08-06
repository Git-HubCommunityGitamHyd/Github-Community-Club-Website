import { getCloudflareContext } from "@opennextjs/cloudflare"

// D1 is a stateless per-call binding, not a persistent connection — unlike
// the old pg.Pool, there's nothing here that needs caching across Fast
// Refresh reloads.
async function getDb() {
  const { env } = await getCloudflareContext({ async: true })
  return env.DB
}

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

// D1/SQLite has no array type — images is stored as JSON-encoded TEXT.
// This is the only place that encoding is visible; callers still see a
// plain string[], same as when it was a native Postgres TEXT[].
type EventRow = Omit<Event, "images"> & { images: string }

function toEvent(row: EventRow): Event {
  return { ...row, images: JSON.parse(row.images) }
}

export async function listEvents(): Promise<Event[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM events ORDER BY sort_order, id")
    .all<EventRow>()
  return results.map(toEvent)
}

export async function getEvent(id: number): Promise<Event | null> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT * FROM events WHERE id = ?")
    .bind(id)
    .first<EventRow>()
  return row ? toEvent(row) : null
}

export async function insertEvent(input: EventInput): Promise<Event> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO events (title, event_date, location, attendees, category, duration, description, images, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.title,
      input.eventDate,
      input.location,
      input.attendees,
      input.category,
      input.duration,
      input.description,
      JSON.stringify(input.images),
      input.sortOrder,
    )
    .first<EventRow>()
  if (!row) throw new Error("insertEvent: insert did not return a row")
  return toEvent(row)
}

export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<Event | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `UPDATE events
       SET title = ?, event_date = ?, location = ?, attendees = ?,
           category = ?, duration = ?, description = ?, images = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.title,
      input.eventDate,
      input.location,
      input.attendees,
      input.category,
      input.duration,
      input.description,
      JSON.stringify(input.images),
      input.sortOrder,
      id,
    )
    .first<EventRow>()
  return row ? toEvent(row) : null
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run()
}
