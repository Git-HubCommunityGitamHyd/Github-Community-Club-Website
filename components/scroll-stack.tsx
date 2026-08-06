"use client"

import React, { useLayoutEffect, useRef, useCallback } from "react"
import type { ReactNode } from "react"
import Lenis from "lenis"

export interface ScrollStackItemProps {
  itemClassName?: string
  children: ReactNode
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative box-border h-80 w-full origin-top rounded-xl p-10 will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </div>
)

interface ScrollStackProps {
  className?: string
  children: ReactNode
  itemDistance?: number
  itemScale?: number
  itemStackDistance?: number
  stackPosition?: string
  scaleEndPosition?: string
  baseScale?: number
  scaleDuration?: number
  rotationAmount?: number
  blurAmount?: number
  useWindowScroll?: boolean
  onStackComplete?: () => void
}

// Vendored from React Bits (https://reactbits.dev) and adapted in place:
// - rounded-[40px] -> rounded-xl and the hardcoded light-mode box-shadow
//   were dropped from ScrollStackItem; this site's card look (border +
//   bg color, no big shadow) is applied per-item via itemClassName instead.
// - the outer wrapper's hardcoded `h-full overflow-y-auto` was designed for
//   a full-viewport standalone scroller. Used with useWindowScroll (our
//   case — the stack lives inside a normal page section, not its own
//   scroll box) those classes collapse the wrapper to 0 height, since
//   `h-full` needs an ancestor with an explicit height. Made conditional.
const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const stackCompletedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const lastTransformsRef = useRef(new Map<number, any>())
  const isUpdatingRef = useRef(false)

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0
      if (scrollTop > end) return 1
      return (scrollTop - start) / (end - start)
    },
    [],
  )

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight
      }
      return parseFloat(value as string)
    },
    [],
  )

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      }
    } else {
      const scroller = scrollerRef.current
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : 0,
        scrollContainer: scroller,
      }
    }
  }, [useWindowScroll])

  // Rest-position cache: measured once (mount + resize), never inside the
  // scroll loop. getBoundingClientRect() — the vendored useWindowScroll
  // path — bakes in an element's *current* CSS transform. Since we set
  // card.style.transform on every card every frame, re-measuring that way
  // fed each frame's own output back in as next frame's "rest position": a
  // feedback loop, which read as the cards visibly shivering. offsetTop
  // (walked up the offsetParent chain for a document-absolute value) is
  // layout-only and immune to transforms, so it's safe to read live too —
  // but caching it also kills the bigger cost: interleaving a geometry read
  // for card i+1 right after a style *write* to card i forced a synchronous
  // layout reflow on every single card, every frame (layout thrashing),
  // which is what actually read as "laggy".
  const offsetsRef = useRef<{ cardTops: number[]; endTop: number }>({
    cardTops: [],
    endTop: 0,
  })

  const documentTop = useCallback(
    (element: HTMLElement) => {
      if (!useWindowScroll) return element.offsetTop
      let top = 0
      let node: HTMLElement | null = element
      while (node) {
        top += node.offsetTop
        node = node.offsetParent as HTMLElement | null
      }
      return top
    },
    [useWindowScroll],
  )

  const measureOffsets = useCallback(() => {
    const endElement = useWindowScroll
      ? (document.querySelector(".scroll-stack-end") as HTMLElement | null)
      : (scrollerRef.current?.querySelector(
          ".scroll-stack-end",
        ) as HTMLElement | null)
    offsetsRef.current = {
      cardTops: cardsRef.current.map((card) => documentTop(card)),
      endTop: endElement ? documentTop(endElement) : 0,
    }
  }, [useWindowScroll, documentTop])

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return

    isUpdatingRef.current = true

    const { scrollTop, containerHeight } = getScrollData()
    const stackPositionPx = parsePercentage(stackPosition, containerHeight)
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    )

    const { cardTops, endTop: endElementTop } = offsetsRef.current

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const cardTop = cardTops[i]
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i
      const triggerEnd = cardTop - scaleEndPositionPx
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i
      const pinEnd = endElementTop - containerHeight / 2

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      )
      const targetScale = baseScale + i * itemScale
      const scale = 1 - scaleProgress * (1 - targetScale)
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0

      let blur = 0
      if (blurAmount) {
        let topCardIndex = 0
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = cardTops[j]
          const jTriggerStart =
            jCardTop - stackPositionPx - itemStackDistance * j
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i
          blur = Math.max(0, depthInStack * blurAmount)
        }
      }

      let translateY = 0
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd

      if (isPinned) {
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * i
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      }

      const lastTransform = lastTransformsRef.current.get(i)
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`
        const filter =
          newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : ""

        card.style.transform = transform
        card.style.filter = filter

        lastTransformsRef.current.set(i, newTransform)
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true
          onStackComplete?.()
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false
        }
      }
    })

    isUpdatingRef.current = false
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
  ])

  const handleScroll = useCallback(() => {
    updateCardTransforms()
  }, [updateCardTransforms])

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      })

      lenis.on("scroll", handleScroll)

      const raf = (time: number) => {
        lenis.raf(time)
        animationFrameRef.current = requestAnimationFrame(raf)
      }
      animationFrameRef.current = requestAnimationFrame(raf)

      lenisRef.current = lenis
      return lenis
    } else {
      const scroller = scrollerRef.current
      if (!scroller) return

      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector(".scroll-stack-inner") as HTMLElement,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        gestureOrientation: "vertical",
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      })

      lenis.on("scroll", handleScroll)

      const raf = (time: number) => {
        lenis.raf(time)
        animationFrameRef.current = requestAnimationFrame(raf)
      }
      animationFrameRef.current = requestAnimationFrame(raf)

      lenisRef.current = lenis
      return lenis
    }
  }, [handleScroll, useWindowScroll])

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : (scrollerRef.current?.querySelectorAll(".scroll-stack-card") ?? []),
    ) as HTMLElement[]
    cardsRef.current = cards
    const transformsCache = lastTransformsRef.current

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
      card.style.willChange = "transform, filter"
      card.style.transformOrigin = "top center"
      card.style.backfaceVisibility = "hidden"
      card.style.transform = "translateZ(0)"
      card.style.perspective = "1000px"
    })

    // First measurement, before any card has ever been given a real
    // transform (they're all translateZ(0) above, which doesn't move them)
    // — the one guaranteed-uncontaminated read.
    measureOffsets()
    setupLenis()
    updateCardTransforms()

    // offsetTop is immune to the transforms we apply, but not to the page
    // actually reflowing (viewport resize, font swap, content above this
    // section changing height) — re-measure when that happens.
    window.addEventListener("resize", measureOffsets)

    return () => {
      window.removeEventListener("resize", measureOffsets)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
      stackCompletedRef.current = false
      cardsRef.current = []
      transformsCache.clear()
      isUpdatingRef.current = false
    }
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    measureOffsets,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms,
  ])

  return (
    <div
      className={
        useWindowScroll
          ? `relative w-full overflow-visible ${className}`.trim()
          : `relative h-full w-full overflow-y-auto overflow-x-visible ${className}`.trim()
      }
      ref={scrollerRef}
      style={
        useWindowScroll
          ? undefined
          : {
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              willChange: "scroll-position",
            }
      }
    >
      {/* pt-[140px]: fixed px, not vh — must stay >= stackPosition (110px
          in our usage, see page.tsx) or the first card's trigger point
          (cardTop - stackPositionPx) goes negative and it pins at FULL
          displacement from scroll position 0, before any real scrolling
          happens. This used to be vh-based and paired with a vh-based
          stackPosition; both looked reasonable on a laptop but grew
          unbounded on a tall/large monitor, since the gap scaled with the
          SCREEN while the card (a fixed h-80) didn't — hence "huge
          whitespace" reports that a smaller vh value didn't actually fix.
          Fixed pixels don't have that problem. */}
      {/* pb-[28vh]: DOES need to stay vh (viewport-relative), unlike the
          leading pt above — pinEnd = endElementTop - containerHeight/2, so
          the release point genuinely needs more trailing room on a taller
          viewport; that's inherent to the formula, not a units mistake.
          Verified numerically with the fixed leading values above: 28vh
          holds 50-200px of real margin from 700px up through 1400px
          viewport heights (large monitors included), well under the old
          70vh's ~550px of pure dead space for typical screens. If
          stackPosition/scaleEndPosition/leading pt change again, recheck
          this — the margin shrinks as viewport height grows, so the binding
          case is always the tallest screen you need to support. */}
      <div className="scroll-stack-inner pb-[28vh] pt-[140px]">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end h-px w-full" />
      </div>
    </div>
  )
}

export default ScrollStack
