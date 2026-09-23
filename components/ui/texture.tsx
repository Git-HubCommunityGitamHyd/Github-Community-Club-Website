import { cn } from "@/lib/utils"

/**
 * Background texture for the long middle of the page.
 *
 * Everything from About through Benefits was flat colour — white, then a grey
 * band, then white again. Each section was well composed on its own and the
 * page still read as unfinished, because nothing sat *behind* the content. The
 * audit calls this out directly: flat design with zero texture feels sterile.
 *
 * The vocabulary here is lifted from the same place the brief pointed at: a
 * fine graph-paper grid, hairline rules marking the content container, and
 * 45-degree hatch bands at the seams between sections. All three are drawn
 * with gradients rather than images, so there is nothing to download and
 * nothing to go soft on a high-density screen.
 *
 * The hard constraint is that none of it may be *noticeable*. The line colours
 * are set through `currentColor` and a text utility so each has a separate
 * light and dark value — a single alpha cannot serve both, because a grid that
 * reads correctly on white is invisible on #0d1117 and one tuned for #0d1117
 * is a cage on white.
 */

/** Grid pitch, in px. Large enough to read as paper rather than as a mesh. */
const GRID = 52

export function GraphPaper({
  className,
  /** Fades the grid out at the top and bottom so it never meets a section border hard. */
  fade = true,
}: {
  className?: string
  fade?: boolean
}) {
  const mask =
    "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        "text-[rgba(140,149,159,0.19)] dark:text-[rgba(240,246,252,0.055)]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: `${GRID}px ${GRID}px`,
        ...(fade ? { maskImage: mask, WebkitMaskImage: mask } : {}),
      }}
    />
  )
}

/**
 * Two hairlines down the edges of the content container.
 *
 * This is the detail that makes a grid look like a drawing rather than like a
 * texture pack: it says the content sits inside a measured column. It has to
 * use the same max-width as the section it is placed in, hence the prop.
 */
export function ContainerRules({
  className,
  width = "max-w-6xl",
}: {
  className?: string
  /** Must match the section's own container width. */
  width?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div
        className={cn(
          "mx-auto h-full border-x border-gray-200/70 px-4 dark:border-gh-border/60 sm:px-6 lg:px-8",
          width,
        )}
      />
    </div>
  )
}

/**
 * A hatched band, used where two sections meet.
 *
 * The seams were bare 1px borders, which is the weakest possible transition —
 * two flat colours butted together. A short hatched strip gives the page a
 * join that looks deliberate, and it is the one place a repeating diagonal is
 * welcome, because a seam is exactly the thing it is describing.
 *
 * Deliberately short (32px). At any real height it stops being a seam and
 * becomes a section of its own.
 */
export function HatchBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-8 w-full border-y border-gray-200 text-[rgba(140,149,159,0.5)] dark:border-gh-border dark:text-[rgba(240,246,252,0.09)]",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)",
      }}
    />
  )
}

/**
 * Grid plus container rules, which is how they are always used together.
 * Sections render this as their first child and everything else above it.
 */
export function SectionTexture({
  className,
  width,
}: {
  className?: string
  width?: string
}) {
  return (
    <>
      <GraphPaper className={className} />
      <ContainerRules width={width} />
    </>
  )
}
