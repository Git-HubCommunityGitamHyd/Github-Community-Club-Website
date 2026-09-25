/**
 * The ring a board member's photo gets in their dialog.
 *
 * The brief asked for a customisable profile-photo border. This stores a key,
 * not a colour: the CMS picks from a named set and the page owns what each one
 * actually renders as. A free hex field would let anybody put a colour on the
 * site that belongs to no palette, and the first one someone picked would be
 * on the page forever with nothing to catch it.
 *
 * Every ring is a conic gradient rather than a flat border, because it is
 * rotating, a solid ring turning looks static, a gradient turning reads as
 * light moving around the frame. The stops are deliberately close in hue so a
 * ring reads as one material catching the light rather than as a rainbow.
 *
 * `glow` is the same colour at low alpha, used for the soft plate behind the
 * photo so the ring does not sit on the panel unsupported.
 */
export type BoardAccent = {
  label: string
  /** Conic-gradient stops, in order. */
  stops: string[]
  glow: string
}

export const BOARD_ACCENTS = {
  green: {
    label: "GitHub green (default)",
    stops: ["#3fb950", "#2ea043", "#7ee787", "#1a7f37", "#3fb950"],
    glow: "rgba(63,185,80,0.22)",
  },
  contribution: {
    label: "Contribution graph, stepped greens",
    stops: ["#0e4429", "#006d32", "#26a641", "#39d353", "#0e4429"],
    glow: "rgba(57,211,83,0.2)",
  },
  aurora: {
    label: "Aurora, green into cyan",
    stops: ["#3fb950", "#2dd4bf", "#38bdf8", "#2ea043", "#3fb950"],
    glow: "rgba(45,212,191,0.2)",
  },
  violet: {
    label: "Violet, indigo into purple",
    stops: ["#8957e5", "#a371f7", "#6e40c9", "#bc8cff", "#8957e5"],
    glow: "rgba(137,87,229,0.22)",
  },
  ember: {
    label: "Ember, amber into orange",
    stops: ["#e3b341", "#f0883e", "#db6d28", "#f2cc60", "#e3b341"],
    glow: "rgba(224,150,62,0.22)",
  },
  rose: {
    label: "Rose, pink into red",
    stops: ["#f778ba", "#db61a2", "#ff7b72", "#fdaac7", "#f778ba"],
    glow: "rgba(247,120,186,0.2)",
  },
  mono: {
    label: "Mono, neutral steel",
    stops: ["#8b949e", "#c9d1d9", "#6e7681", "#f0f6fc", "#8b949e"],
    glow: "rgba(139,148,158,0.2)",
  },
} satisfies Record<string, BoardAccent>

export type BoardAccentKey = keyof typeof BOARD_ACCENTS

export const BOARD_ACCENT_KEYS = Object.keys(BOARD_ACCENTS) as BoardAccentKey[]

/** Falls back rather than throwing, so an old or unknown key still renders. */
export function boardAccent(key: string | null | undefined): BoardAccent {
  return key && Object.hasOwn(BOARD_ACCENTS, key)
    ? BOARD_ACCENTS[key as BoardAccentKey]
    : BOARD_ACCENTS.green
}
