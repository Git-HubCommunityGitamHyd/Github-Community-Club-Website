import { getDb } from "./client"

export type JourneyEntry = {
  id: number
  entry_date: string
  title: string
  description: string
  icon: string
  sort_order: number
  created_at: string
}

export type JourneyEntryInput = {
  entryDate: string
  title: string
  description: string
  icon: string
  sortOrder: number
}

export async function listJourneyEntries(): Promise<JourneyEntry[]> {
  const db = await getDb()
  const { results } = await db
    .prepare("SELECT * FROM journey_entries ORDER BY sort_order, id")
    .all<JourneyEntry>()
  return results
}

export async function getJourneyEntry(
  id: number,
): Promise<JourneyEntry | null> {
  const db = await getDb()
  return await db
    .prepare("SELECT * FROM journey_entries WHERE id = ?")
    .bind(id)
    .first<JourneyEntry>()
}

export async function insertJourneyEntry(
  input: JourneyEntryInput,
): Promise<JourneyEntry> {
  const db = await getDb()
  const row = await db
    .prepare(
      `INSERT INTO journey_entries (entry_date, title, description, icon, sort_order)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .bind(
      input.entryDate,
      input.title,
      input.description,
      input.icon,
      input.sortOrder,
    )
    .first<JourneyEntry>()
  if (!row) throw new Error("insertJourneyEntry: insert did not return a row")
  return row
}

export async function updateJourneyEntry(
  id: number,
  input: JourneyEntryInput,
): Promise<JourneyEntry | null> {
  const db = await getDb()
  return await db
    .prepare(
      `UPDATE journey_entries
       SET entry_date = ?, title = ?, description = ?, icon = ?, sort_order = ?
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.entryDate,
      input.title,
      input.description,
      input.icon,
      input.sortOrder,
      id,
    )
    .first<JourneyEntry>()
}

export async function deleteJourneyEntry(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM journey_entries WHERE id = ?").bind(id).run()
}
