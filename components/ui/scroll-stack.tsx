"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * React Bits' ScrollStack, with three changes forced by this project.
 *
 * 1. It does not construct Lenis, and does not listen to it either. Upstream
 *    news up its own window-level instance, which is how `/` ended up with one
 *    section's component owning the entire page's scrolling. This reads
 *    window.scrollY from a frame loop instead, so it composes with whatever
 *    smooth-scrolling the page has rather than fighting it.
 * 2. The wrapper/content scroller branch is gone. This page only ever stacks
 *    against window scroll, and keeping the dead branch meant keeping a second
 *    Lenis construction path.
 * 3. The driver is one rAF loop with empty deps, reading the latest update
 *    through a ref, and it re-queries the cards each frame instead of caching
 *    them at mount. Caching them races this page's streaming render, and a
 *    driver keyed on props can be torn down and then never restarted if the
 *    following setup runs before the ref is attached.
 *
 * `stackPosition` and `scaleEndPosition` are **pixels**, deliberately not the
 * upstream percentage strings. A percentage there is a fraction of
 * window.innerHeight, so the gap above the stack grows with the viewport while
 * the fixed-height cards do not — which is exactly why this section kept
 * reading as enormous on a large monitor.
 */

export function ScrollStackItem({
  children,
  itemClassName = "",
}: {
  children: ReactNode
  itemClassName?: string
}) {
  return (
    <div
      className={cn(
        "scroll-stack-card relative box-border w-full origin-top will-change-transform",
        itemClassName,
      )}
      style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  )
}

/**
 * Distance from the top of the document, measured from layout only.
 *
 * This is the crux of the component. The obvious implementation —
 * `getBoundingClientRect().top + window.scrollY`, which is what upstream uses —
 * reads the element's *painted* position, and every card here is painted
 * through a translate that this very function's result decides. So the moment a
 * card is transformed its measured top moves by exactly that transform, the
 * next frame derives a different translate from the new reading, and the card
 * flips between two positions on alternate frames forever.
 *
 * offsetTop walks the offsetParent chain and is defined in layout space, so a
 * transform on the element cannot feed back into its own input.
 */
function documentTop(el: HTMLElement) {
  let top = 0
  let node: HTMLElement | null = el
  while (node) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

type Transform = {
  translateY: number
  scale: number
  rotation: number
  blur: number
}

export function ScrollStack({
  children,
  className,
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = 120,
  scaleEndPosition = 40,
  baseScale = 0.86,
  rotationAmount = 0,
  blurAmount = 0,
}: {
  children: ReactNode
  className?: string
  itemDistance?: number
  itemScale?: number
  itemStackDistance?: number
  /** Pixels from the viewport top where stacking begins. Not a percentage. */
  stackPosition?: number
  /** Pixels from the viewport top where scaling finishes. Not a percentage. */
  scaleEndPosition?: number
  baseScale?: number
  rotationAmount?: number
  blurAmount?: number
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  // Pinning and rescaling six cards under the scroll position is the single
  // largest piece of motion on this page. Under a reduced-motion preference the
  // cards are left as an ordinary vertical list — still readable, still in
  // order, just not moving.
  const reducedMotion = useReducedMotion()
  // Keyed by the element, not by index. React can replace a card's DOM node
  // without remounting this component (streaming swap, Fast Refresh), and with
  // an index-keyed cache the fresh node would inherit the old node's recorded
  // transform and be skipped as unchanged. A WeakMap gives a replaced node no
  // history, so it is written on the first frame it is seen, and it releases
  // entries for nodes that are gone instead of holding them alive.
  const lastRef = useRef(new WeakMap<HTMLElement, Transform>())

  // Two pieces of upstream machinery are deliberately gone.
  //
  // The `isUpdating` re-entrancy flag: upstream drives this from several
  // scroll listeners at once, so it needs one. A single rAF loop is the only
  // caller here, so it guards nothing and can only ever latch.
  //
  // The cached card array: caching the nodes at mount races this page's
  // streaming render — the effect can commit an empty list and never look
  // again. Same failure mode the scroll spy had. querySelectorAll on a
  // container holding six children, once per frame, is not worth being wrong
  // about.
  const update = useCallback(() => {
    if (reducedMotion) return
    const scroller = scrollerRef.current
    if (!scroller) return
    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    )
    if (cards.length === 0) return

    const scrollTop = window.scrollY
    const containerHeight = window.innerHeight
    const endTop = endRef.current ? documentTop(endRef.current) : 0

    // Which card is currently on top of the stack — only needed when blurring.
    let topIndex = 0
    if (blurAmount) {
      cards.forEach((card, j) => {
        const start = documentTop(card) - stackPosition - itemStackDistance * j
        if (scrollTop >= start) topIndex = j
      })
    }

    cards.forEach((card, i) => {
      const cardTop = documentTop(card)
      const triggerStart = cardTop - stackPosition - itemStackDistance * i
      const triggerEnd = cardTop - scaleEndPosition
      const pinEnd = endTop - containerHeight / 2

      const raw =
        scrollTop < triggerStart
          ? 0
          : scrollTop > triggerEnd
            ? 1
            : (scrollTop - triggerStart) / (triggerEnd - triggerStart)

      // Clamped at 1: `baseScale` is the *bottom* card's resting scale and each
      // card above it is one step larger, so a baseScale that does not leave
      // room for `(count - 1)` steps lets the top cards scale past 1 and grow
      // as they pin. Callers should pass `1 - (count - 1) * itemScale`; the
      // clamp is what keeps a wrong one from looking broken.
      const targetScale = Math.min(1, baseScale + i * itemScale)
      const scale = 1 - raw * (1 - targetScale)
      const rotation = rotationAmount ? i * rotationAmount * raw : 0
      const blur = blurAmount && i < topIndex ? (topIndex - i) * blurAmount : 0

      let translateY = 0
      if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPosition + itemStackDistance * i
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPosition + itemStackDistance * i
      }

      const next: Transform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      }

      const prev = lastRef.current.get(card)
      const changed =
        !prev ||
        Math.abs(prev.translateY - next.translateY) > 0.1 ||
        Math.abs(prev.scale - next.scale) > 0.001 ||
        Math.abs(prev.rotation - next.rotation) > 0.1 ||
        Math.abs(prev.blur - next.blur) > 0.1

      if (changed) {
        card.style.transform = `translate3d(0, ${next.translateY}px, 0) scale(${next.scale}) rotate(${next.rotation}deg)`
        card.style.filter = next.blur > 0 ? `blur(${next.blur}px)` : ""
        lastRef.current.set(card, next)
      }
    })
  }, [
    baseScale,
    blurAmount,
    reducedMotion,
    itemScale,
    itemStackDistance,
    rotationAmount,
    scaleEndPosition,
    stackPosition,
  ])

  const updateRef = useRef(update)
  useLayoutEffect(() => {
    updateRef.current = update
  }, [update])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>(".scroll-stack-card"),
    )
    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`
      card.style.willChange = "transform, filter"
      card.style.transformOrigin = "top center"
      card.style.backfaceVisibility = "hidden"
    })

    // The stack is polled per frame rather than driven by scroll events, which
    // is what the mascot on this page already does and for the same reason:
    // Lenis advances the scroll position inside its own rAF tick, so reading
    // window.scrollY once per frame stays in step with it without subscribing
    // to anything. It is cheap — update() diffs against the last transform it
    // wrote and touches no DOM when nothing moved past the threshold, so a
    // stationary page costs a scrollY read and a few offset reads per frame.
  }, [itemDistance])

  // The driver lives in its own effect with empty deps, reading the latest
  // update through a ref, so no prop change can tear it down. The ordinary
  // pattern — putting it in the layout effect above, keyed on [itemDistance,
  // update] — is a trap here: any teardown cancels the pending frame, and the
  // setup that follows returns early while scrollerRef is unattached, which
  // this page's streaming render does hit. The loop is then never restarted
  // and the stack freezes at its last transform with no error.
  //
  // Note for anyone debugging this in a headless or backgrounded tab:
  // requestAnimationFrame does not fire while document.hidden is true, so the
  // stack will look permanently inert there however healthy the component is.
  // Check document.hidden before believing the driver is broken.
  useEffect(() => {
    let frame = requestAnimationFrame(function loop() {
      frame = requestAnimationFrame(loop)
      updateRef.current()
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div ref={scrollerRef} className={cn("relative w-full", className)}>
      {children}
      {/* Spacer so the last card's pin can release cleanly. */}
      <div ref={endRef} className="scroll-stack-end h-px w-full" />
    </div>
  )
}
