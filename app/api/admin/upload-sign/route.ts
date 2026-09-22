import { NextResponse } from "next/server"
import { getSessionCookie, verifySessionValue } from "@/lib/session"

export const runtime = "nodejs"

export async function POST() {
  if (!verifySessionValue(await getSessionCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const uploadSignUrl = process.env.UPLOAD_SIGN_URL
  const sharedSecret = process.env.WORKER_SHARED_SECRET
  if (!uploadSignUrl || !sharedSecret) {
    return NextResponse.json(
      { error: "Upload signing is not configured" },
      { status: 500 },
    )
  }

  const response = await fetch(uploadSignUrl, {
    method: "POST",
    headers: { "X-Worker-Secret": sharedSecret },
  })
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to sign upload" },
      { status: 502 },
    )
  }

  const payload = await response.json()
  return NextResponse.json(payload)
}
