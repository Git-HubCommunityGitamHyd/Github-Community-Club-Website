// Not in build-card.tsx: that is a client module, and the build page that
// also needs these is a server component (same reason as transition-name.ts).
import type { PublicBuild } from "@/lib/db/builds"
import { buildRole } from "@/features/v2/builds/keys"

/** "Asha, Rahul and Meera", lead first. */
export function creditLine(build: Pick<PublicBuild, "credits">): string {
  const names = [...build.credits]
    .sort((a, b) => buildRole(a.role).rank - buildRole(b.role).rank)
    .map((c) => c.name)
  if (names.length <= 1) return names[0] ?? ""
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
}

export function stackOf(build: Pick<PublicBuild, "built_with">): string[] {
  return build.built_with
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}
