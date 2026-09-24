import type { Credit } from "@/features/v2/builds/keys"
import { buildRole } from "@/features/v2/builds/keys"
import { Identicon } from "@/components/ui/identicon"
import { cn } from "@/lib/utils"

function sorted(credits: Credit[]) {
  return [...credits].sort(
    (a, b) => buildRole(a.role).rank - buildRole(b.role).rank,
  )
}

/** The makers as a row of identicons under the title, like a project's faces. */
export function BuildFaces({ credits }: { credits: Credit[] }) {
  const people = sorted(credits)
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2.5">
        {people.slice(0, 5).map((person) => (
          <span
            key={person.name}
            title={person.name}
            className="size-10 overflow-hidden rounded-full border-2 border-gh-bg bg-gh-elevated p-1.5"
          >
            <Identicon
              seed={person.name}
              color="#3fb950"
              className="size-full"
            />
          </span>
        ))}
      </div>
      <a
        href="#people"
        className="text-sm text-gh-muted transition-colors hover:text-gh-text"
      >
        {people.length === 1
          ? `Built by ${people[0].name}`
          : `Built by ${people.length} people`}
      </a>
    </div>
  )
}

/**
 * Everyone who made it, lead first, each with what they did. Not the
 * members' profile rows a project uses: most builders are not club members,
 * so there is no profile to open, and a name with a role reads as credit.
 */
export function BuildPeople({ credits }: { credits: Credit[] }) {
  return (
    <ul className="divide-y divide-gh-border overflow-hidden rounded-2xl border border-gh-border bg-gh-surface/70">
      {sorted(credits).map((person) => {
        const role = buildRole(person.role)
        return (
          <li key={person.name} className="flex gap-4 px-5 py-4 sm:px-6">
            <span className="size-11 shrink-0 overflow-hidden rounded-full border border-gh-border bg-gh-elevated p-2">
              <Identicon
                seed={person.name}
                color="#3fb950"
                className="size-full"
              />
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-gh-text">
                {person.name}
                <span
                  className={cn(
                    "rounded-full border px-2 py-px font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                    role.rank === 0
                      ? "border-gh-accent/50 text-gh-accent"
                      : "border-gh-border text-gh-muted",
                  )}
                >
                  {role.label}
                </span>
              </p>
              {person.contribution && (
                <p className="mt-1 text-pretty text-[15px] leading-relaxed text-gh-muted">
                  {person.contribution}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
