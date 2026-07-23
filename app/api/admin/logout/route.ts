import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, COOKIE_PATH } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 0,
  })

  return NextResponse.redirect(new URL("/admin/login", request.url), 303)
}
