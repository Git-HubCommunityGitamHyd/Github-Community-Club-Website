"use client"

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react"

/**
 * React Bits' GlassSurface, forked for this site.
 *
 * What the component actually contributes is a real refraction, not a blur: it
 * paints a displacement map (a rounded rect whose red and blue channels ramp
 * across the box) into an SVG filter, runs the backdrop through three
 * `feDisplacementMap` passes at slightly different scales, and recombines them.
 * The per-channel offset is what produces the coloured fringing along the edge,
 * which is the thing that reads as glass rather than as frosting. That graph is
 * kept verbatim, behind `chromaticAberration` (on by default); the navbar
 * turns it off, for the reason given on the prop.
 *
 * Five deltas from the published snippet, all forced by this project:
 *
 *   1. `"use client"`. The snippet has no directive because it ships for Vite.
 *      It is all hooks, refs and `navigator`, so under the App Router it has to
 *      say so itself rather than rely on whichever parent imported it.
 *   2. `useDarkMode` is gone. It read `prefers-color-scheme`, which this site
 *      stopped having an opinion about when light mode was removed: a visitor
 *      whose OS is set to light would have got the snippet's light branch,
 *      white fills and blue-tinted shadows, over a permanently dark page. The
 *      surface is dark, unconditionally.
 *   3. The light-mode style branches are deleted rather than left unreachable.
 *      Dead branches in a file this long are a trap for whoever edits it next.
 *   4. The capability probe moved from `useState` + `useEffect` to
 *      `useSyncExternalStore`. It is a client-only fact that cannot be known
 *      during SSR, which is exactly what that hook is for, and setting state
 *      from an effect is a lint error here.
 *   5. A `prefers-reduced-transparency` branch. The whole point of the
 *      component is a see-through surface, so a reader who has asked the OS not
 *      to do that needs a real answer, not a slightly thinner blur.
 */

export interface GlassSurfaceProps {
  children?: React.ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
  backgroundOpacity?: number
  saturation?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  xChannel?: "R" | "G" | "B"
  yChannel?: "R" | "G" | "B"
  mixBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter"
  className?: string
  style?: React.CSSProperties
  /**
   * Split the refraction per colour channel, which is what puts the coloured
   * fringe on the edge. On by default, as in the snippet.
   *
   * It is also about 70% of what this component costs. Chromium re-runs a
   * reference `backdrop-filter` on every frame the page composites, not only
   * when what is under it changes, and the split runs the displacement three
   * times, recolours each result and blends them back together. With it off
   * the graph is one displacement. Measured on the navbar, at the tint the
   * bar uses, the two are visually indistinguishable while the split cost 12
   * more points of renderer CPU and 10 of GPU.
   */
  chromaticAberration?: boolean
}

/**
 * Subscribes to a media query as an external store.
 *
 * Both facts this component needs - whether the browser can run an SVG filter
 * in `backdrop-filter`, and whether the reader has asked for less transparency
 * - are client-only and unknowable during SSR. `useSyncExternalStore` is built
 * for exactly that: the server snapshot is the conservative answer, the client
 * snapshot is the real one, and the swap happens without a state write.
 */
function mediaStore(query: string) {
  let mq: MediaQueryList | null = null
  const get = () => {
    if (typeof window === "undefined") return false
    mq ??= window.matchMedia(query)
    return mq.matches
  }
  return {
    subscribe(onChange: () => void) {
      if (typeof window === "undefined") return () => {}
      mq ??= window.matchMedia(query)
      mq.addEventListener("change", onChange)
      return () => mq?.removeEventListener("change", onChange)
    },
    get,
    // Never transparent on the server. A surface that renders solid and then
    // turns to glass is a far smaller flicker than the reverse.
    server: () => false,
  }
}

const reducedTransparency = mediaStore("(prefers-reduced-transparency: reduce)")

/**
 * Whether `backdrop-filter: url(#id)` actually works here.
 *
 * Safari and Firefox both parse the declaration and then ignore the filter, so
 * feature detection alone reports a false positive and the bar renders as an
 * unfiltered hole. The snippet's user-agent check is the only thing that
 * catches it, so it stays, browser sniffing and all.
 */
let svgFilterSupport: boolean | null = null

function supportsSVGFilters() {
  if (svgFilterSupport !== null) return svgFilterSupport
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false
  }

  const isWebkit =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  const isFirefox = /Firefox/.test(navigator.userAgent)
  if (isWebkit || isFirefox) {
    svgFilterSupport = false
    return false
  }

  const div = document.createElement("div")
  div.style.backdropFilter = "url(#glass-support-probe)"
  svgFilterSupport = div.style.backdropFilter !== ""
  return svgFilterSupport
}

// The memo above is load-bearing, not an optimisation: getSnapshot runs on
// every render, and the uncached path builds a DOM element each time.
const NEVER_CHANGES = () => () => {}
const NOT_SUPPORTED = () => false

/**
 * Whether plain `backdrop-filter` works, for the middle fallback.
 *
 * This has to go through the same store as the other two probes rather than
 * being called straight from render. Called directly it answers false on the
 * server and true in the browser, so the server rendered the fully solid
 * branch and the client rendered the blurred one, and React reported a
 * hydration mismatch listing every property of both. Every client-only fact
 * this component branches on has to reach render the same way.
 */
function supportsBackdropFilter() {
  if (typeof window === "undefined") return false
  return CSS.supports("backdrop-filter", "blur(10px)")
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  className = "",
  style = {},
  chromaticAberration = true,
}) => {
  const uniqueId = useId().replace(/:/g, "-")
  const filterId = `glass-filter-${uniqueId}`
  const redGradId = `red-grad-${uniqueId}`
  const blueGradId = `blue-grad-${uniqueId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const feImageRef = useRef<SVGFEImageElement>(null)
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null)
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null)

  const svgSupported = useSyncExternalStore(
    NEVER_CHANGES,
    supportsSVGFilters,
    NOT_SUPPORTED,
  )
  const wantsSolid = useSyncExternalStore(
    reducedTransparency.subscribe,
    reducedTransparency.get,
    reducedTransparency.server,
  )
  const blurSupported = useSyncExternalStore(
    NEVER_CHANGES,
    supportsBackdropFilter,
    NOT_SUPPORTED,
  )

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    const actualWidth = rect?.width || 400
    const actualHeight = rect?.height || 200
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5)

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
    // Memoised so the three effects below can depend on it honestly. Left as a
    // plain function it is a new identity every render, and the choice is
    // between a lint suppression and a filter that regenerates its displacement
    // map on every keystroke elsewhere on the page.
  }, [
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    mixBlendMode,
    redGradId,
    blueGradId,
  ])

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute("href", generateDisplacementMap())
  }, [generateDisplacementMap])

  useEffect(() => {
    updateDisplacementMap()
    ;[
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute("scale", (distortionScale + offset).toString())
        ref.current.setAttribute("xChannelSelector", xChannel)
        ref.current.setAttribute("yChannelSelector", yChannel)
      }
    })

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString())
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    updateDisplacementMap,
    // The two graphs have different nodes behind the same refs, so switching
    // needs the attributes written again.
    chromaticAberration,
  ])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0)
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateDisplacementMap])

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0)
  }, [width, height, updateDisplacementMap])

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      // Strings, not numbers. React writes a numeric custom property one way
      // into the server HTML and another into the client style object, which
      // is a hydration mismatch for a value neither side disagrees about.
      "--glass-frost": String(backgroundOpacity),
      "--glass-saturation": String(saturation),
    } as React.CSSProperties

    // Asked not to see through things. Not a thinner blur: an opaque surface
    // in the site's own palette, with the hairline border kept so the bar
    // still has an edge. Checked before the other two branches because it is
    // a stated preference and they are only capability probes.
    if (wantsSolid) {
      return {
        ...baseStyles,
        background: "hsl(215 21% 11%)",
        border: "1px solid rgba(240,246,252,0.1)",
        boxShadow: "0 8px 32px -12px rgba(1,4,9,0.9)",
      }
    }

    if (svgSupported) {
      return {
        ...baseStyles,
        background: `hsl(0 0% 0% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        // The inset highlights are the edge of the glass catching light, and
        // they are what stop the refraction from reading as a smudge. The
        // outer shadows are the snippet's, darkened to sit on this palette
        // rather than on its own near-white page.
        boxShadow: `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
           0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
           0 4px 16px rgba(1, 4, 9, 0.5),
           0 8px 24px rgba(1, 4, 9, 0.4),
           0 16px 56px rgba(1, 4, 9, 0.3)`,
      }
    }

    // Safari, Firefox, and anything else that cannot run the filter inside
    // backdrop-filter. A plain blurred fill: not the same effect, same job.
    if (blurSupported) {
      return {
        ...baseStyles,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(14px) saturate(1.6)",
        WebkitBackdropFilter: "blur(14px) saturate(1.6)",
        border: "1px solid rgba(240,246,252,0.12)",
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.14),
                    0 8px 32px -12px rgba(1, 4, 9, 0.9)`,
      }
    }

    return {
      ...baseStyles,
      background: "hsl(215 21% 11% / 0.92)",
      border: "1px solid rgba(240,246,252,0.1)",
      boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
    }
  }

  const glassSurfaceClasses =
    "relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out"

  const focusVisibleClasses =
    "focus-visible:outline-2 focus-visible:outline-gh-accent focus-visible:outline-offset-2"

  return (
    <div
      ref={containerRef}
      className={`${glassSurfaceClasses} ${focusVisibleClasses} ${className}`}
      style={getContainerStyles()}
    >
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            {chromaticAberration ? (
              <>
                <feDisplacementMap
                  ref={redChannelRef}
                  in="SourceGraphic"
                  in2="map"
                  result="dispRed"
                />
                <feColorMatrix
                  in="dispRed"
                  type="matrix"
                  values="1 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 1 0"
                  result="red"
                />

                <feDisplacementMap
                  ref={greenChannelRef}
                  in="SourceGraphic"
                  in2="map"
                  result="dispGreen"
                />
                <feColorMatrix
                  in="dispGreen"
                  type="matrix"
                  values="0 0 0 0 0
                          0 1 0 0 0
                          0 0 0 0 0
                          0 0 0 1 0"
                  result="green"
                />

                <feDisplacementMap
                  ref={blueChannelRef}
                  in="SourceGraphic"
                  in2="map"
                  result="dispBlue"
                />
                <feColorMatrix
                  in="dispBlue"
                  type="matrix"
                  values="0 0 0 0 0
                          0 0 0 0 0
                          0 0 1 0 0
                          0 0 0 1 0"
                  result="blue"
                />

                <feBlend in="red" in2="green" mode="screen" result="rg" />
                <feBlend in="rg" in2="blue" mode="screen" result="output" />
              </>
            ) : (
              // One displacement on the red channel's ref, so the effect above
              // writes its scale (distortionScale + redOffset) and channel
              // selectors exactly as it does for the split version.
              <feDisplacementMap
                ref={redChannelRef}
                in="SourceGraphic"
                in2="map"
                result="output"
              />
            )}
            <feGaussianBlur
              ref={gaussianBlurRef}
              in="output"
              stdDeviation="0.7"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[inherit] p-2">
        {children}
      </div>
    </div>
  )
}

export default GlassSurface
