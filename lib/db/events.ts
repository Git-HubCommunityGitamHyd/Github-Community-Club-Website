import { getDb } from "./client"

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
