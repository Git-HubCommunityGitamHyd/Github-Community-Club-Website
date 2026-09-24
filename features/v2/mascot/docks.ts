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
export type Side = "left" | "right"

export type Dock = {
  /** The `id` of the section this dock belongs to. */
  id: string
  /**
   * Pin this dock to a side instead of alternating. Only for a section whose
   * layout has a side the mascot must not sit on.
   */
  side?: Side
  /** Viewport-height fraction of the mascot's centre on entering the section. */
  from: number
  /** …and on leaving it. */
  to: number
}

/**
 * In page order. A section whose element is not in the document gets no dock.
 *
 * There is no `side` here any more. Sides used to be written per dock, which
 * only zig-zags if every section is present, and sections are CMS-driven: an
 * empty projects table removes the projects section, and with fixed sides
 * that left events and benefits both on the left, so the mascot stopped
 * crossing. Worse, projects was added to the page without a dock at all, and
 * a section with no dock inherits the previous section's: the mascot sat in
 * the crossover to benefits on the right while still believing it was on the
 * left, and stared off the edge of the page for the whole section. Sides are
 * now assigned by `sideOf` from position among the docks actually present, so
 * the zig-zag holds whatever the CMS leaves out.
 *
 * Alternation is the default, not a law. Benefits is pinned right: its
 * stacked cards put the heading and copy against the left edge and only a
 * faint glyph on the right, so a left dock sits on top of the text. With
 * projects present that means projects and benefits share the right side and
 * the mascot simply drifts down it rather than crossing; without projects the
 * sequence is exactly the original one.
 */
export const MASCOT_DOCKS: Dock[] = [
  { id: "about", from: 0.3, to: 0.68 },
  { id: "journey", from: 0.34, to: 0.64 },
  { id: "board", from: 0.28, to: 0.66 },
  { id: "events", from: 0.32, to: 0.7 },
  { id: "projects", from: 0.3, to: 0.66 },
  { id: "ideas", from: 0.3, to: 0.62 },
  { id: "builds", from: 0.3, to: 0.62 },
  { id: "benefits", side: "right", from: 0.3, to: 0.62 },
  { id: "join", from: 0.36, to: 0.6 },
]

/**
 * Sides for the docks actually on the page, in order: each pinned dock keeps
 * its side and every other dock takes the opposite of the one before it.
 *
 * Right first: the hero holds the mascot on the right, so the first dock must
 * be on the same side or the page would open with a pointless crossing.
 */
export function assignSides<T extends Dock>(
  present: T[],
): (T & { side: Side })[] {
  let previous: Side = "left"
  return present.map((dock) => {
    const side: Side = dock.side ?? (previous === "right" ? "left" : "right")
    previous = side
    return { ...dock, side }
  })
}

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
