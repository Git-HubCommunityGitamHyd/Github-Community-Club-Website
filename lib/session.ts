import { createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const COOKIE_NAME = "admin_session"
// "/" — not "/admin" — so the cookie also reaches /api/admin/* routes,
// which live outside the /admin path prefix but still need the session.
export const COOKIE_PATH = "/"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

function hmac(message: string): string {
  const secret = requireEnv("SESSION_SECRET")
  return createHash("sha256").update(`${message}.${secret}`).digest("hex")
}

export function createSessionValue(): string {
  const expires = Date.now() + SESSION_TTL_MS
  return `${expires}.${hmac(String(expires))}`
}

export async function getSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false
  try {
    const [expires, signature] = value.split(".")
    if (!expires || !signature) return false
    if (Number(expires) < Date.now()) return false

    const expected = hmac(expires)
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function verifyPassword(submitted: string): Promise<boolean> {
  const expected = requireEnv("ADMIN_PASSWORD")
  const a = createHash("sha256").update(submitted).digest()
  const b = createHash("sha256").update(expected).digest()
  const matches = timingSafeEqual(a, b)
  if (!matches) await sleep(300)
  return matches
}
