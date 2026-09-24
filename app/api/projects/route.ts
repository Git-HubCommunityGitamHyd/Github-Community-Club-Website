import { NextResponse } from "next/server"
import { listProjects } from "@/lib/db/projects"

export const runtime = "nodejs"
// Without this Next prerenders at build time and freezes whatever the DB
// returned during `next build`. See CLAUDE.md.
export const dynamic = "force-dynamic"

export async function GET() {
  const projects = await listProjects()
  return NextResponse.json(projects)
}
