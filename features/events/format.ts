/** A real calendar date written as YYYY-MM-DD (what `<input type="date">` gives). */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

/**
 * The label stored in `events.event_date` and shown on cards, built from the
 * start and end dates: "January 22, 2026", "January 20–22, 2026" or
 * "December 30, 2025 – January 2, 2026". Used by the CMS form's preview and
 * by validation, so what the maintainer sees is what gets saved. UTC
 * throughout, so the server and the browser agree.
 */
export function eventDateLabel(start: string, end: string): string {
  if (!isIsoDate(start)) return ""
  const utc = (value: string) => new Date(`${value}T00:00:00Z`)
  const long = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  const startDate = utc(start)
  if (!isIsoDate(end) || end <= start) return long(startDate)

  const endDate = utc(end)
  const sameMonth =
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCFullYear() === endDate.getUTCFullYear()
  if (sameMonth) {
    const month = startDate.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    })
    return `${month} ${startDate.getUTCDate()}–${endDate.getUTCDate()}, ${startDate.getUTCFullYear()}`
  }
  return `${long(startDate)} – ${long(endDate)}`
}

/**
 * `events.event_date` is free-form TEXT in the schema, so this has to cope with
 * both an ISO date from the admin form and whatever a human typed. An
 * unparseable value is returned as written rather than rendered as
 * "Invalid Date".
 *
 * The locale is pinned to en-GB and the timezone to UTC deliberately: this
 * renders on the server as well as in the browser, and letting either side pick
 * its own would produce a hydration mismatch on every card.
 */
export function formatEventDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
