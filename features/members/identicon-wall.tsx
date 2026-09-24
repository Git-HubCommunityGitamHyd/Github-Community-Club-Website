import { Identicon } from "@/components/ui/identicon"
import { boardAccent } from "@/features/board/accents"

const CELLS = 60

/**
 * A faint wall of the members' own identicons behind the page header.
 *
 * The members page had the doodle field and nothing else, which reads as
 * empty on a page that is meant to feel full of people. This fills the
 * header's open side with a mark that belongs to them: one identicon per
 * member (repeated to fill the wall) in their own border colour. It stays in
 * the background by being small, very low contrast and masked to fade out
 * towards the heading, so it gives the header texture without competing
 * with the title or the mascot in front of it.
 */
export function IdenticonWall({
  people,
}: {
  people: { name: string; accent: string }[]
}) {
  if (people.length === 0) return null
  const cells = Array.from(
    { length: CELLS },
    (_, i) => people[i % people.length],
  )

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[640px] overflow-hidden md:block"
      style={{
        maskImage:
          "radial-gradient(ellipse 55% 60% at 78% 34%, black 0%, transparent 72%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 55% 60% at 78% 34%, black 0%, transparent 72%)",
      }}
    >
      <div className="absolute right-[-40px] top-16 grid grid-cols-10 gap-4 opacity-[0.16]">
        {cells.map((person, i) => (
          <span
            key={i}
            className="size-10 rounded-lg bg-gh-surface/60 ring-1 ring-inset ring-gh-border/60"
          >
            <Identicon
              // The index keeps repeats of one person from being identical
              // tiles side by side.
              seed={`${person.name}#${Math.floor(i / people.length)}`}
              color={boardAccent(person.accent).stops[0]}
              className="p-1.5"
            />
          </span>
        ))}
      </div>
    </div>
  )
}
