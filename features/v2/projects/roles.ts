/**
 * The part someone played on a project.
 *
 * The CMS stores the key, as with PROJECT_STATUSES. The order of this object is
 * the order a project page lists people in: maintainers first, then the team
 * lead, then everyone else. `rank` is what sorting uses, so reordering the
 * keys here reorders every page.
 */
export type ProjectRole = { label: string; plural: string; rank: number }

export const PROJECT_ROLES: Record<string, ProjectRole> = {
  maintainer: { label: "Maintainer", plural: "Maintainers", rank: 0 },
  lead: { label: "Team lead", plural: "Team lead", rank: 1 },
  member: { label: "Member", plural: "Members", rank: 2 },
}

export const PROJECT_ROLE_KEYS = Object.keys(PROJECT_ROLES)

/** Falls back rather than throwing, so an unknown key still renders. */
export function projectRole(key: string | null | undefined): ProjectRole {
  return PROJECT_ROLES[key ?? ""] ?? PROJECT_ROLES.member
}
