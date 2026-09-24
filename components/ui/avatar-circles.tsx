"use client"

import Image from "next/image"
import Link from "next/link"
import { Identicon } from "@/components/ui/identicon"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev (dillionverma) avatar circles, adapted. The registry install
 * needs a 21st.dev login, so this was written from the source the user
 * pasted; it has no dependencies beyond `cn`.
 *
 * What changed, and why:
 *
 * - It takes people, not bare URLs. Each face needs a name for its label and
 *   a fallback for anyone without a photo, which a list of URLs cannot carry.
 *   Someone with no avatar gets an identicon rather than a broken image.
 * - Each face is a button when `onSelect` is given, so clicking a person
 *   opens their profile. The original faces were inert `<img>`s.
 * - The overflow chip counts what was actually hidden (`people.length - max`)
 *   instead of trusting a `numPeople` prop, which rendered "+undefined" when
 *   omitted. It is left out when nothing is hidden, and it is a link only
 *   when given somewhere to go: the original's `href=""` reloaded the page.
 * - The ring is the page background (`gh-bg`), not white. On a dark page a
 *   white ring reads as a sticker; a background-coloured one reads as a cut
 *   between overlapping faces, which is what the ring is for.
 * - next/image, so photos are resized to 2x the drawn size rather than
 *   downloaded at whatever size was uploaded.
 */

export type AvatarPerson = {
  name: string
  /** Null draws an identicon seeded by name. */
  src: string | null
  /** Identicon colour. */
  color: string
}

const SIZES = {
  sm: { box: "size-8 text-[10px]", px: 32, overlap: "-space-x-2.5" },
  md: { box: "size-10 text-xs", px: 40, overlap: "-space-x-3" },
} as const

const FACE =
  "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gh-bg bg-gh-elevated font-semibold text-gh-muted"

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function AvatarCircles({
  people,
  max = 5,
  size = "md",
  onSelect,
  moreHref,
  className,
}: {
  people: AvatarPerson[]
  /** Faces drawn before the rest collapse into a "+N" chip. */
  max?: number
  size?: keyof typeof SIZES
  /** Makes each face a button. Receives the index into `people`. */
  onSelect?: (index: number) => void
  /** Where the "+N" chip goes; without it the chip is not interactive. */
  moreHref?: string
  className?: string
}) {
  if (people.length === 0) return null

  const { box, px, overlap } = SIZES[size]
  const shown = people.slice(0, max)
  const hidden = people.length - shown.length

  return (
    <div
      className={cn(
        "flex items-center rtl:space-x-reverse",
        overlap,
        className,
      )}
    >
      {shown.map((person, index) => {
        const face = person.src ? (
          <Image
            src={person.src}
            alt=""
            width={px}
            height={px}
            sizes={`${px}px`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Identicon
            seed={person.name}
            color={person.color}
            className="p-[18%]"
          />
        )

        return onSelect ? (
          <button
            key={`${person.name}-${index}`}
            type="button"
            title={person.name}
            aria-label={`${person.name}, open profile`}
            onClick={() => onSelect(index)}
            // Hovered faces lift above their neighbours, so the one you are
            // about to click is the one drawn whole.
            className={cn(
              FACE,
              box,
              "transition-transform duration-200 hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:translate-y-0",
            )}
          >
            {face}
          </button>
        ) : (
          <span
            key={`${person.name}-${index}`}
            title={person.name}
            role="img"
            aria-label={person.name}
            className={cn(FACE, box)}
          >
            {face}
          </span>
        )
      })}

      {hidden > 0 &&
        (moreHref ? (
          <Link
            href={moreHref}
            aria-label={`${hidden} more`}
            className={cn(
              FACE,
              box,
              "bg-gh-surface text-gh-text transition-colors hover:bg-gh-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
            )}
          >
            +{hidden}
          </Link>
        ) : (
          <span
            aria-label={`${hidden} more`}
            className={cn(FACE, box, "bg-gh-surface text-gh-text")}
          >
            +{hidden}
          </span>
        ))}
    </div>
  )
}
