/**
 * Where the octocat sits, section by section.
 *
 * The first version parked it in one corner of the viewport and flipped it to
 * the other corner when the cursor crossed the middle of the screen. Two
 * things were wrong with that. It was the *cursor* that decided which side it
 * lived on, so the mascot's position said nothing about where you were on the
 * page; and because it sat pinned to one edge, the pointer was almost always
 * far away on the same side, which held its gaze at full deflection — hence it
 * appearing to stare in one direction permanently.
 *
 * Each section owns a dock instead. A dock is a side of the page and a band of
 * viewport heights: the mascot enters the section at `from`, drifts down to
 * `to` as you scroll through it, and then crosses over to the next section's
 * dock. Sides alternate, so travelling down the page traces a zig-zag rather
 * than a straight rail, and every band descends, so the drift inside a section
 * always reads as falling with the content rather than fighting it.
 *
 * `from`/`to` are fractions of the viewport height, measured to the mascot's
 * centre. They are kept well inside 0.25–0.75 so it never collides with the
 * sticky navbar at the top or slides under the fold at the bottom.
 */
export type Dock = {
  /** The `id` of the section this dock belongs to. */
  id: string
  side: "left" | "right"
  /** Viewport-height fraction of the mascot's centre on entering the section. */
  from: number
  /** …and on leaving it. */
  to: number
}

export const MASCOT_DOCKS: Dock[] = [
  { id: "about", side: "right", from: 0.3, to: 0.68 },
  { id: "journey", side: "left", from: 0.34, to: 0.64 },
  { id: "board", side: "right", from: 0.28, to: 0.66 },
  { id: "events", side: "left", from: 0.32, to: 0.7 },
  { id: "benefits", side: "right", from: 0.3, to: 0.62 },
  { id: "join", side: "left", from: 0.36, to: 0.6 },
]

/**
 * Fraction of a section spent crossing to the next dock.
 *
 * Without a blend the target jumps the full width of the screen the instant
 * the section boundary passes, and the follow easing turns that into the
 * mascot bolting sideways. Handing over across the last stretch of the section
 * makes the crossing a deliberate arc that finishes just as the new section
 * takes the screen.
 */
export const DOCK_BLEND = 0.16
