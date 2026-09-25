import { getDb } from "./client"

export type Event = {
  id: number
  title: string
  event_date: string
  /** YYYY-MM-DD. Null only for rows saved before the dates were stored. */
  starts_on: string | null
  ends_on: string | null
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
  startsOn: string
  endsOn: string
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
    // Newest first by the day the event ended, so a new event lands on top
    // without renumbering anything. sort_order only orders events that
    // ended on the same day (the sessions of a fest). Rows without dates,
    // which predate the columns, go last until someone edits them.
    .prepare(
      "SELECT * FROM events ORDER BY ends_on IS NULL, ends_on DESC, sort_order, id",
    )
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
      `INSERT INTO events (title, event_date, starts_on, ends_on, location, attendees, category, duration, description, images, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.title,
      input.eventDate,
      input.startsOn,
      input.endsOn,
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
       SET title = ?, event_date = ?, starts_on = ?, ends_on = ?,
           location = ?, attendees = ?,
           category = ?, duration = ?, description = ?, images = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.title,
      input.eventDate,
      input.startsOn,
      input.endsOn,
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
