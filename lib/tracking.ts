/**
 * Private tracking links for people with no account.
 *
 * A submission gets a random token (24 bytes, 192 bits, base64url) that is
 * shown once, on the thank-you screen, as a link. The database keeps only its
 * SHA-256, so a leaked backup or an admin screen never shows a working link,
 * and the page looks a submission up by hashing the token it was given. At
 * 192 bits, guessing one is not a thing anyone can do, so the page needs no
 * other check.
 */
export function newTrackToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export async function hashTrackToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  )
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Shape check before hashing anything a visitor put in a URL. */
export function isTrackToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(value)
}
