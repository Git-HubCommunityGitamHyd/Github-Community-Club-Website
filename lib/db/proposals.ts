import { getDb } from "./client"
import { PUBLIC_PROPOSAL_STATUSES } from "@/features/proposals/keys"

/** A whole row, private fields included. Only admin screens get this. */
export type Proposal = {
  id: number
  title: string
  idea: string
  audience: string
  format: string
  help: string
  name: string
  public_name: string
  year: string
  branch: string
  reg_no: string
  phone: string
  status: string
  admin_note: string
  created_at: string
  reviewed_at: string | null
}

/**
 * What /proposals may see. Selected column by column rather than `*` and
 * trimmed afterwards, so a new private column can never leak by default.
 */
export type PublicProposal = Pick<
  Proposal,
  | "id"
  | "title"
  | "idea"
  | "audience"
  | "format"
  | "help"
  | "public_name"
  | "status"
  | "created_at"
>

export type ProposalInput = {
  title: string
  idea: string
  audience: string
  format: string
  help: string
  name: string
  publicName: string
  year: string
  branch: string
  regNo: string
  phone: string
}

/** The fields an admin edits. Who sent it is not editable. */
export type ProposalReview = {
  title: string
  idea: string
  audience: string
  format: string
  publicName: string
  status: string
  adminNote: string
}

const PUBLIC_COLUMNS =
  "id, title, idea, audience, format, help, public_name, status, created_at"

export async function listPublicProposals(): Promise<PublicProposal[]> {
  const db = await getDb()
  const marks = PUBLIC_PROPOSAL_STATUSES.map(() => "?").join(", ")
  // Built first, then being built, then accepted: the ideas that became
  // something lead. Within a status, the most recently reviewed first.
  const { results } = await db
    .prepare(
      `SELECT ${PUBLIC_COLUMNS} FROM proposals
       WHERE status IN (${marks})
       ORDER BY CASE status WHEN 'built' THEN 0 WHEN 'building' THEN 1 ELSE 2 END,
                COALESCE(reviewed_at, created_at) DESC`,
    )
    .bind(...PUBLIC_PROPOSAL_STATUSES)
    .all<PublicProposal>()
  return results
}

export async function listProposals(): Promise<Proposal[]> {
  const db = await getDb()
  // Unreviewed first, oldest first among them, so the queue is worked in
  // order; everything else newest first under it.
  const { results } = await db
    .prepare(
      `SELECT * FROM proposals
       ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END,
                CASE status WHEN 'pending' THEN created_at END ASC,
                created_at DESC`,
    )
    .all<Proposal>()
  return results
}

export async function countPendingProposals(): Promise<number> {
  const db = await getDb()
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM proposals WHERE status = 'pending'")
    .first<{ n: number }>()
  return row?.n ?? 0
}

export async function getProposal(id: number): Promise<Proposal | null> {
  const db = await getDb()
  return db
    .prepare("SELECT * FROM proposals WHERE id = ?")
    .bind(id)
    .first<Proposal>()
}

export async function insertProposal(
  input: ProposalInput,
  trackHash: string,
): Promise<void> {
  const db = await getDb()
  await db
    .prepare(
      `INSERT INTO proposals
         (title, idea, audience, format, help, name, public_name, year, branch, reg_no, phone, track_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.title,
      input.idea,
      input.audience,
      input.format,
      input.help,
      input.name,
      input.publicName,
      input.year,
      input.branch,
      input.regNo,
      input.phone,
      trackHash,
    )
    .run()
}

/** What the submitter's private link shows: where it is, nothing else. */
export type TrackedProposal = Pick<
  Proposal,
  | "id"
  | "title"
  | "status"
  | "help"
  | "public_name"
  | "created_at"
  | "reviewed_at"
>

export async function getProposalByTrackHash(
  hash: string,
): Promise<TrackedProposal | null> {
  const db = await getDb()
  return db
    .prepare(
      `SELECT id, title, status, help, public_name, created_at, reviewed_at
       FROM proposals WHERE track_hash = ?`,
    )
    .bind(hash)
    .first<TrackedProposal>()
}

export async function updateProposal(
  id: number,
  input: ProposalReview,
): Promise<Proposal | null> {
  const db = await getDb()
  // reviewed_at is stamped the first time it leaves 'pending' and kept after.
  return db
    .prepare(
      `UPDATE proposals
       SET title = ?, idea = ?, audience = ?, format = ?, public_name = ?,
           status = ?, admin_note = ?,
           reviewed_at = CASE
             WHEN ? = 'pending' THEN reviewed_at
             ELSE COALESCE(reviewed_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
           END
       WHERE id = ?
       RETURNING *`,
    )
    .bind(
      input.title,
      input.idea,
      input.audience,
      input.format,
      input.publicName,
      input.status,
      input.adminNote,
      input.status,
      id,
    )
    .first<Proposal>()
}

export async function deleteProposal(id: number): Promise<void> {
  const db = await getDb()
  await db.prepare("DELETE FROM proposals WHERE id = ?").bind(id).run()
}
