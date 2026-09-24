/**
 * Details the proposal and build forms both ask for. Year is a key, like every
 * fixed choice the site stores; branch is free text because GITAM's programme
 * names change more often than this file would.
 */
export const STUDENT_YEARS: Record<string, string> = {
  "1": "1st year",
  "2": "2nd year",
  "3": "3rd year",
  "4": "4th year",
  "5": "5th year",
}

export const STUDENT_YEAR_KEYS = Object.keys(STUDENT_YEARS)

export function studentYear(key: string): string {
  return STUDENT_YEARS[key] ?? key
}
