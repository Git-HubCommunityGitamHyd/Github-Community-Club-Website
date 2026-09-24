import {
  PROPOSAL_AUDIENCES,
  PROPOSAL_FORMATS,
  PROPOSAL_HELP,
  PROPOSAL_STATUSES,
} from "@/features/proposals/keys"
import type { ProposalInput, ProposalReview } from "@/lib/db/proposals"
import { firstName, validateStudent } from "./student"

export const PROPOSAL_TITLE_MAX = 80
export const PROPOSAL_IDEA_MIN = 20
export const PROPOSAL_IDEA_MAX = 1000
const PUBLIC_NAME_MAX = 40
const NOTE_MAX = 1000

type Result<T> =
  { ok: true; data: T } | { ok: false; errors: Record<string, string> }

function checkKey(
  set: Record<string, unknown>,
  value: string,
  field: string,
  message: string,
  errors: Record<string, string>,
) {
  if (!(value in set)) errors[field] = message
}

function checkIdea(
  input: Record<string, unknown>,
  errors: Record<string, string>,
) {
  const title = String(input.title ?? "")
    .trim()
    .replace(/\s+/g, " ")
  if (!title) errors.title = "Give it a name, even a rough one"
  else if (title.length > PROPOSAL_TITLE_MAX) {
    errors.title = `Keep it under ${PROPOSAL_TITLE_MAX} characters`
  }

  const idea = String(input.idea ?? "").trim()
  if (idea.length < PROPOSAL_IDEA_MIN) {
    errors.idea = "A couple of sentences, so we understand the problem"
  } else if (idea.length > PROPOSAL_IDEA_MAX) {
    errors.idea = `Keep it under ${PROPOSAL_IDEA_MAX} characters`
  }

  const audience = String(input.audience ?? "")
  checkKey(PROPOSAL_AUDIENCES, audience, "audience", "Pick one", errors)
  const format = String(input.format ?? "")
  checkKey(PROPOSAL_FORMATS, format, "format", "Pick one", errors)

  return { title, idea, audience, format }
}

/** The public form. Every field, since the form is the only way in. */
export function validateProposal(
  input: Record<string, unknown>,
): Result<ProposalInput> {
  const errors: Record<string, string> = {}
  const idea = checkIdea(input, errors)

  const help = String(input.help ?? "")
  checkKey(PROPOSAL_HELP, help, "help", "Pick one", errors)

  const student = validateStudent(input, errors)

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: { ...idea, help, ...student, publicName: firstName(student.name) },
  }
}

/** The CMS review form. */
export function validateProposalReview(
  input: Record<string, unknown>,
): Result<ProposalReview> {
  const errors: Record<string, string> = {}
  const idea = checkIdea(input, errors)

  const publicName = String(input.publicName ?? "").trim()
  if (!publicName) errors.publicName = "Needed on the public page"
  else if (publicName.length > PUBLIC_NAME_MAX) {
    errors.publicName = `Keep it under ${PUBLIC_NAME_MAX} characters`
  }

  const status = String(input.status ?? "")
  checkKey(PROPOSAL_STATUSES, status, "status", "Pick a status", errors)

  const adminNote = String(input.adminNote ?? "").trim()
  if (adminNote.length > NOTE_MAX) {
    errors.adminNote = `Keep it under ${NOTE_MAX} characters`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { ...idea, publicName, status, adminNote } }
}
