import assert from "node:assert/strict"
import { test } from "node:test"
import {
  validateProposal,
  validateProposalReview,
} from "@/lib/validation/proposal"
import { validateBuildReview } from "@/lib/validation/build"
import { validateProject } from "@/lib/validation/project"
import { validateBoardMember } from "@/lib/validation/board-member"
import { validateMember } from "@/lib/validation/member"
import { validateJourneyEntry } from "@/lib/validation/journey"
import { validateEvent } from "@/lib/validation/event"
import { validateTeam } from "@/lib/validation/team"
import { boardAccent } from "@/features/board/accents"
import { journeyIcon } from "@/features/journey/icons"
import { categoryGlyph } from "@/features/events/categories"
import { projectStatus } from "@/features/projects/statuses"
import { projectRole } from "@/features/projects/roles"
import { buildRole } from "@/features/builds/keys"
import { proposalStatus, labelOf } from "@/features/proposals/keys"
import { latestBuildWeek } from "@/features/builds/format"

const proposal = {
  title: "Campus timetable",
  idea: "A shared timetable for students across campus.",
  audience: "students",
  format: "website",
  help: "build",
  name: "Asha Rao",
  year: "2",
  branch: "CSE",
  regNo: "2023004123",
  phone: "9876543210",
}
const build = {
  title: "Campus timetable",
  tagline: "Find your next class",
  description:
    "A shared timetable that helps students find their next class on campus.",
  slug: "campus-timetable",
  status: "accepted",
  month: "2026-09",
  weekOf: "2026-09-25",
  images: [
    "https://res.cloudinary.com/demo/image/upload/v1/build-submissions/cover.png",
  ],
  credits: [{ name: "Asha", role: "lead", contribution: "" }],
}
const project = {
  name: "Campus",
  slug: "campus",
  summary: "Campus tools",
  status: "live",
}
const board = {
  name: "Asha",
  role: "Lead",
  description: "Builds campus tools",
  accent: "green",
}
const journey = {
  title: "Launch",
  description: "The club launched",
  entryDate: "September 2026",
  icon: "rocket",
}
const event = {
  title: "Workshop",
  description: "Build together",
  eventDate: "September 25, 2026",
  category: "Workshop",
}

function rejected(
  result: { ok: boolean; errors?: Record<string, string> },
  field: string,
) {
  assert.equal(result.ok, false)
  assert.ok(result.errors?.[field], `Expected an error for ${field}`)
}

test("valid submissions and CMS inputs retain their normalized values", () => {
  const result = validateProposal(proposal)
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.data.publicName, "Asha")
  const reviewed = validateBuildReview(build)
  assert.equal(reviewed.ok, true)
  if (reviewed.ok) assert.equal(reviewed.data.weekOf, "2026-09-21")
  for (const result of [
    validateProject(project),
    validateBoardMember(board),
    validateMember(board),
    validateJourneyEntry(journey),
    validateEvent(event),
    validateTeam({ name: "Web" }),
  ]) {
    assert.equal(result.ok, true)
  }
})

for (const key of ["constructor", "toString", "__proto__"]) {
  test(`rejects inherited choice ${key} in public and admin validation`, () => {
    for (const field of ["audience", "format", "help"])
      rejected(validateProposal({ ...proposal, [field]: key }), field)
    rejected(
      validateProposalReview({ ...proposal, publicName: "Asha", status: key }),
      "status",
    )
    rejected(validateBuildReview({ ...build, status: key }), "status")
    rejected(
      validateBuildReview({ ...build, credits: [{ name: "Asha", role: key }] }),
      "credits",
    )
    rejected(validateProject({ ...project, status: key }), "status")
    rejected(
      validateProject({ ...project, team: [{ memberId: 1, role: key }] }),
      "team",
    )
    rejected(validateBoardMember({ ...board, accent: key }), "accent")
    rejected(validateMember({ ...board, accent: key }), "accent")
    rejected(validateJourneyEntry({ ...journey, icon: key }), "icon")
  })
  test(`legacy rows with ${key} safely render fallback choices`, () => {
    assert.equal(boardAccent(key), boardAccent("green"))
    assert.equal(journeyIcon(key), journeyIcon("commit"))
    assert.equal(categoryGlyph(key), categoryGlyph("unknown"))
    assert.equal(projectStatus(key), projectStatus("in-progress"))
    assert.equal(projectRole(key), projectRole("member"))
    assert.equal(buildRole(key), buildRole("member"))
    assert.equal(proposalStatus(key), proposalStatus("pending"))
    assert.equal(labelOf({ students: "Students" }, key), key)
  })
}

for (const value of ["Infinity", "-Infinity", "1e999", "not-a-number"]) {
  test(`non-finite numeric input ${value} is rejected before database writes`, () => {
    for (const result of [
      validateProject({ ...project, sortOrder: value }),
      validateBoardMember({ ...board, sortOrder: value }),
      validateMember({ ...board, sortOrder: value }),
      validateJourneyEntry({ ...journey, sortOrder: value }),
      validateEvent({ ...event, sortOrder: value }),
      validateTeam({ name: "Web", sortOrder: value }),
    ])
      rejected(result, "sortOrder")
    rejected(validateEvent({ ...event, attendees: value }), "attendees")
  })
}

test("latest week handles empty, unpicked and unsorted builds without mutating them", () => {
  assert.equal(latestBuildWeek([]), undefined)
  assert.equal(latestBuildWeek([{ week_of: null }]), undefined)
  const builds = [
    { week_of: "2026-09-21" },
    { week_of: null },
    { week_of: "2026-10-05" },
    { week_of: "2026-09-28" },
  ]
  const before = structuredClone(builds)
  assert.equal(latestBuildWeek(builds), "2026-10-05")
  assert.deepEqual(builds, before)
})
