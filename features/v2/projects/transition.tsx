"use client"

import { useLayoutEffect, type MouseEvent, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/**
 * Listing to project page (and back) as one continuous movement: the card's
 * cover and name travel to where the project page puts them, using the View
 * Transitions API.
 *
 * Why by hand. The browser has to be told when the new page is on screen, and
 * a client-side navigation has no such moment it can see. React's
 * `<ViewTransition>` and Next's `experimental.viewTransition` exist for this,
 * but this Next build has neither the flag nor the types, and pinning the page
 * to an experimental React for one animation is a poor trade. So the old page
 * is captured, the navigation starts, and the page that arrives says "I am
 * rendered" by mounting <TransitionSettled />. A timeout ends it regardless,
 * so a slow or failed navigation can never leave the page frozen on its
 * screenshot.
 *
 * Browsers without the API, and anyone who asked for reduced motion, get a
 * plain navigation. Nothing depends on the animation having run.
 */

let settle: (() => void) | null = null

const GIVE_UP_MS = 2500

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => unknown
}

function navigateWithTransition(navigate: () => void) {
  const doc = document as ViewTransitionDocument
  if (
    !doc.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    navigate()
    return
  }
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timer)
          settle = null
          resolve()
        }
        const timer = setTimeout(done, GIVE_UP_MS)
        settle = done
        navigate()
      }),
  )
}

/** Mounted by each page a transition can land on. */
export function TransitionSettled() {
  // Layout effect: the new page's DOM is committed but not yet painted, which
  // is the moment the browser should take its "after" picture.
  useLayoutEffect(() => {
    settle?.()
  }, [])
  return null
}

/**
 * A Link that navigates through the transition. Modified clicks (new tab,
 * new window) are left to the browser, as are non-left buttons.
 */
export function TransitionLink({
  href,
  className,
  children,
  transition = true,
  "aria-label": ariaLabel,
}: {
  href: string
  className?: string
  children: ReactNode
  /**
   * Off for destinations that do not mount <TransitionSettled />, which
   * would otherwise hold the old page's picture until the timeout.
   */
  transition?: boolean
  "aria-label"?: string
}) {
  const router = useRouter()

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      !transition ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    navigateWithTransition(() => router.push(href))
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
