import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import {
  COOKIE_NAME,
  COOKIE_PATH,
  createSessionValue,
  verifyPassword,
} from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = String(formData.get("password") ?? "")

  const valid = await verifyPassword(password)
  if (!valid) {
    return NextResponse.redirect(
      new URL("/admin/login?error=1", request.url),
      303,
    )
  }

  cookies().set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60,
  })

  return NextResponse.redirect(new URL("/admin", request.url), 303)
}
