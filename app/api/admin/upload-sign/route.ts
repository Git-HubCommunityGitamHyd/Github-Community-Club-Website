import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"

export const runtime = "nodejs"

export async function POST() {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sharedSecret = process.env.WORKER_SHARED_SECRET
  const signUrl = process.env.UPLOAD_SIGN_URL
  const { env } = await getCloudflareContext({ async: true })
  if (!sharedSecret || (!env.SIGN_WORKER && !signUrl)) {
    return NextResponse.json(
      { error: "Upload signing is not configured" },
      { status: 500 },
    )
  }

  // Worker-to-worker over a *.workers.dev URL fails on the same account
  // (loopback protection), so prod uses the SIGN_WORKER service binding.
  // Local `next dev` has no binding — fall back to UPLOAD_SIGN_URL (the
  // sign Worker on localhost).
  const headers = { "X-Worker-Secret": sharedSecret }
  const response = env.SIGN_WORKER
    ? await env.SIGN_WORKER.fetch("https://sign.internal/sign", {
        method: "POST",
        headers,
      })
    : await fetch(signUrl as string, { method: "POST", headers })

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to sign upload" },
      { status: 502 },
    )
  }

  return NextResponse.json(await response.json())
}
