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
