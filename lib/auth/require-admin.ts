import { NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { adminUrl } from "./admin-path"
import { getSessionCookie, verifySessionValue } from "./session"

export async function requireAdminPage() {
  if (!verifySessionValue(await getSessionCookie())) {
    redirect(adminUrl("/admin/login"))
  }
}

export async function requireAdminApi(): Promise<NextResponse | null> {
  if (!verifySessionValue(await getSessionCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
