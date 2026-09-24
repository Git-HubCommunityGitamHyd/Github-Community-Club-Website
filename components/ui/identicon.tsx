import { cn } from "@/lib/utils"

/**
 * A GitHub-style identicon: a 5x5 grid mirrored left to right, filled from a
 * hash of `seed`. The stand-in for anyone who has not sent an avatar yet.
 *
 * It replaced a fallback to the person's GitHub profile picture, which for
 * many people is a photo of their face, and club members asked not to have
 * their faces on the site. Initials were the other option; an identicon is
 * the same deterministic, per-person mark, sits comfortably beside the
 * illustrated avatars members generate, and is what GitHub itself shows for an
 * account with no picture.
 */

/** FNV-1a, 32-bit. Stable across runs and machines, which is all it needs. */
function hash(seed: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Which of the 15 independent cells (3 columns x 5 rows) are filled. */
function cells(seed: string) {
  const bits = hash(seed)
  const filled: [number, number][] = []
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      if ((bits >> (row * 3 + col)) & 1) {
        filled.push([col, row])
        // Mirror onto the right half; the middle column is its own mirror.
        if (col < 2) filled.push([4 - col, row])
      }
    }
  }
  return filled
}

export function Identicon({
  seed,
  color,
  className,
}: {
  seed: string
  /** Fill colour for the cells. The background is the element's own. */
  color: string
  className?: string
}) {
  return (
    <svg
      viewBox="-1 -1 7 7"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      shapeRendering="crispEdges"
    >
      {cells(seed).map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  )
}
