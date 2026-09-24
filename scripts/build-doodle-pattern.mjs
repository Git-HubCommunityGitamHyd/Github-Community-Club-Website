/**
 * Builds the GitHub doodle pattern used as the section background.
 *
 * Run: `npm run build:doodles`. The output, public/patterns/github-doodles.svg,
 * is committed - this is a build-time generator, not part of `next build`.
 *
 * Why generate it rather than draw it:
 *
 * The icons are not redrawn here. Every stroke comes out of lucide-react's own
 * `__iconNode` data and the octocat comes out of react-icons' FaGithub path, so
 * the marks in the pattern are the same marks used everywhere else on the site
 * and they stay correct if either library is updated. Hand-tracing a dozen
 * icons into a static file would drift from the real ones within a release.
 *
 * The reference is the grip texture on a PlayStation controller: many very
 * small symbols, packed tight, at almost no contrast. That combination is what
 * makes a field of glyphs read as a *material* rather than as a set of
 * drawings. The first version of this file got it wrong in the other
 * direction - 22 marks at 22-36px scattered across a 540px tile - and the
 * marks were large enough and far enough apart to be read individually, so
 * they competed with the foreground instead of sitting behind it.
 *
 * Three things do the work:
 *
 * - **Small.** Marks are 13-18px. Below roughly 20px a glyph stops asking to
 *   be identified and starts being grain.
 * - **Tight.** A staggered lattice on a 34px pitch, so the field has even
 *   density with no corridors or clumps.
 * - **Faint.** The alpha is set on the layer in components/ui/texture.tsx, but
 *   packing this densely means that value has to come down with it; ink per
 *   square inch is what the eye actually responds to, not per-mark opacity.
 *
 * Placement is a jittered lattice rather than hand-set coordinates. At this
 * count hand-placing is not practical, and the trade that made hand-placement
 * right for 22 sparse marks reverses here: the lattice guarantees the even
 * density that sparse random scattering cannot, and the jitter only has to
 * break the regularity, not invent the distribution.
 */

import { writeFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/** Cells across and down. TILE is derived so the lattice always wraps. */
const COLUMNS = 9
const ROWS = 9

/**
 * Lattice pitch, in px. With marks at 13-18px this leaves a little under half
 * a mark of air between neighbours, which is about what the controller grip
 * does.
 */
const PITCH = 34

/** Tile edge, in px. Even row count keeps the half-pitch stagger seamless. */
const TILE = COLUMNS * PITCH

/**
 * Rendered stroke weight every mark is normalised to, in px.
 *
 * Lucide is authored on a 24-unit grid at stroke-width 2, so a mark scaled to
 * 18px would render a 1.5px stroke and one scaled to 13px a 1.08px stroke -
 * the field would look drawn with several different pens. Each mark's
 * stroke-width is divided back out against its own scale to land here.
 */
const PEN = 1.05

/** How far a mark may wander from its lattice point, in px. */
const JITTER = 6

const ICONS = [
  "git-branch",
  "git-merge",
  "git-pull-request-arrow",
  "git-commit-horizontal",
  "git-fork",
  "git-compare",
  "terminal",
  "square-terminal",
  "code-xml",
  "braces",
  "bug",
  "star",
  "folder-git-2",
  "package",
  "cloud-upload",
  "check-check",
  "circle-dot",
  "heart",
]

/**
 * A mulberry32 PRNG with a fixed seed.
 *
 * Deterministic on purpose: the committed SVG has to be reproducible, so that
 * rerunning the build after an unrelated change does not produce a different
 * pattern and a noisy diff.
 */
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * lucide ships per-icon modules only in its ESM build (the CJS build is one
 * bundle), so these are imported by file URL and read once up front.
 */
const ICON_NODES = new Map()

async function loadIconNodes(names) {
  for (const name of names) {
    const url = new URL(
      `../node_modules/lucide-react/dist/esm/icons/${name}.js`,
      import.meta.url,
    )
    const mod = await import(url.href)
    if (!mod.__iconNode) throw new Error(`No icon data for ${name}`)
    ICON_NODES.set(name, mod.__iconNode)
  }
}

/**
 * Each icon is emitted once into <defs> and referenced with <use>.
 *
 * At 80-odd placements per tile, inlining the geometry every time would be
 * most of the file. Crucially the symbols carry no stroke-width of their own,
 * so each <use> wrapper can inherit a different one - which is what lets the
 * per-mark stroke correction work at all.
 */
function symbol(name) {
  const body = ICON_NODES.get(name)
    .map(([tag, attrs]) => {
      const props = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
      return `<${tag} ${props}/>`
    })
    .join("")
  return `<g id="${name}">${body}</g>`
}

/** react-icons' FaGithub, which is a filled path on a 496x512 grid. */
function octocatSymbol() {
  const { FaGithub } = require("react-icons/fa6")
  const path = FaGithub({}).props.children.find(
    (child) => child.type === "path",
  )
  return `<g id="octocat" transform="scale(${24 / 512})"><path transform="translate(8,0)" d="${path.props.d}"/></g>`
}

await loadIconNodes(ICONS)

const random = rng(0x5eed1)
const placements = []

for (let row = 0; row < ROWS; row += 1) {
  for (let column = 0; column < COLUMNS; column += 1) {
    // Half-pitch stagger on odd rows. A square lattice this tight reads as a
    // grid of dots from a distance, which is the thing being replaced.
    const stagger = row % 2 === 1 ? PITCH / 2 : 0
    const x =
      column * PITCH + PITCH / 2 + stagger + (random() - 0.5) * 2 * JITTER
    const y = row * PITCH + PITCH / 2 + (random() - 0.5) * 2 * JITTER

    // One octocat in roughly every fourteen marks. It is the only filled glyph
    // in a field of strokes, so it carries far more weight than its size
    // suggests; at the previous rate the eye used the octocats to find the
    // repeat. Sparse and light, it reads as an occasional accent instead.
    const isOctocat = random() < 0.07

    placements.push({
      icon: isOctocat ? "octocat" : ICONS[Math.floor(random() * ICONS.length)],
      x,
      y,
      size: 13 + random() * 5,
      rot: (random() - 0.5) * 50,
      // Opacity variance is what stops a dense field looking printed. The
      // octocat is held down because a filled glyph at the same alpha as a
      // stroked one is visually several times heavier.
      alpha: (isOctocat ? 0.3 : 0.55) + random() * (isOctocat ? 0.15 : 0.45),
    })
  }
}

function markup(mark) {
  const scale = mark.size / 24
  const isOctocat = mark.icon === "octocat"
  const paint = isOctocat
    ? 'fill="#000" stroke="none"'
    : `fill="none" stroke="#000" stroke-width="${((PEN * 24) / mark.size).toFixed(3)}"`

  return (dx, dy) =>
    `<g opacity="${mark.alpha.toFixed(2)}" ${paint} transform="translate(${(mark.x + dx).toFixed(1)} ${(mark.y + dy).toFixed(1)}) rotate(${mark.rot.toFixed(1)}) scale(${scale.toFixed(4)}) translate(-12 -12)"><use href="#${mark.icon}"/></g>`
}

const parts = []
for (const mark of placements) {
  const render = markup(mark)
  // The reach is generous: rotation grows a mark's effective box, and an
  // under-wrapped mark shows up as a clipped icon at the seam, which is far
  // more visible than a redundant copy.
  const reach = mark.size
  for (const dx of [-TILE, 0, TILE]) {
    for (const dy of [-TILE, 0, TILE]) {
      if (dx === 0 && dy === 0) {
        parts.push(render(0, 0))
        continue
      }
      const nx = mark.x + dx
      const ny = mark.y + dy
      if (
        nx > -reach &&
        nx < TILE + reach &&
        ny > -reach &&
        ny < TILE + reach
      ) {
        parts.push(render(dx, dy))
      }
    }
  }
}

const defs = [...ICONS.map(symbol), octocatSymbol()].join("")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}"><defs><g stroke-linecap="round" stroke-linejoin="round">${defs}</g></defs>${parts.join("")}</svg>`

writeFileSync(
  new URL("../public/patterns/github-doodles.svg", import.meta.url),
  svg,
)
console.log(
  `github-doodles.svg: ${TILE}px tile, ${placements.length} marks, ${parts.length} placements, ${(svg.length / 1024).toFixed(1)} KB`,
)
