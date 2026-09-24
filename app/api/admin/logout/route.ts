import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { adminUrl } from "@/lib/auth/admin-path"
import { COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", sessionCookieOptions(0))

  return NextResponse.redirect(
    new URL(adminUrl("/admin/login"), request.url),
    303,
  )
}
