"use client"

import { useId, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

/**
 * Text filled with a moving stack of horizontal lines, on a soft plate.
 *
 * The demo this follows ships as `CanvasText`, and the name is kept, but the
 * lines are painted with a `repeating-linear-gradient` clipped to the glyphs
 * rather than with a real `<canvas>`. Drawing type into a canvas means
 * measuring font metrics, re-measuring on every resize and again after the
 * webfont loads, handling devicePixelRatio by hand, and still ending up with a
 * raster that softens on a 4K display — for a headline that goes up to 104px
 * here. A clipped gradient is resolution-independent, costs no JavaScript per
 * frame, and stays selectable, copyable text for a screen reader.
 *
 * The animation runs on `background-position`, which the compositor handles;
 * the keyframe lives in app/globals.css next to the reduced-motion rule that
 * switches it off.
 */
export function CanvasText({
  text,
  colors,
  lineGap = 4,
  lineHeight = 3,
  animationDuration = 20,
  className,
  plateClassName,
}: {
  text: string
  /** Line colours top to bottom; the ramp repeats down the glyphs. */
  colors: string[]
  /** Transparent gap between lines, in pixels. */
  lineGap?: number
  /** Thickness of each line, in pixels. */
  lineHeight?: number
  /** Seconds for the ramp to travel one full period. */
  animationDuration?: number
  className?: string
  plateClassName?: string
}) {
  const id = useId()
  const band = lineHeight + lineGap
  const period = band * colors.length

  // One band per colour: `lineHeight` of colour, then `lineGap` of nothing.
  const stops = colors
    .flatMap((color, index) => {
      const start = index * band
      return [
        `${color} ${start}px`,
        `${color} ${start + lineHeight}px`,
        `transparent ${start + lineHeight}px`,
        `transparent ${start + band}px`,
      ]
    })
    .join(", ")

  const style = {
    backgroundImage: `repeating-linear-gradient(to bottom, ${stops})`,
    backgroundSize: `100% ${period}px`,
    animationDuration: `${animationDuration}s`,
    ["--canvas-text-period" as string]: `${period}px`,
  } as CSSProperties

  return (
    <span className="relative inline-block">
      {/* The optional plate. `-inset-*` rather than padding so the glyph
          baseline is untouched and the phrase still sits on the headline's own
          rhythm. Callers that pass nothing get no element at all — an empty
          `-z-10` box behind a headline is a stacking-context trap waiting for
          whatever gets added next to it. */}
      {plateClassName && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -inset-x-2 -inset-y-1 -z-10 rounded-xl",
            plateClassName,
          )}
        />
      )}
      <span
        key={id}
        style={style}
        className={cn(
          "canvas-text bg-clip-text text-transparent",
          "[-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
          className,
        )}
      >
        {text}
      </span>
    </span>
  )
}
