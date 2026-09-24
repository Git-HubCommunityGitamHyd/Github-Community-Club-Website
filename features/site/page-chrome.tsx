"use client"

import { useRouter } from "next/navigation"
import { MotionConfig } from "framer-motion"
import { SmoothScroll } from "@/features/site/smooth-scroll"
import { SiteNavbar } from "@/features/site/navbar"
import { SiteFooter } from "@/features/site/footer"
import { navItems } from "@/features/site/nav"
import { PageMascot } from "@/features/mascot/page-mascot"

/**
 * Nav and footer for the pages that are not the homepage.
 *
 * The homepage nav is a scroll spy: every item is a section on the current
 * page and clicking one scrolls to it. Here there are no sections to scroll
 * to, so the same component gets an `onScrollTo` that navigates to the
 * homepage anchor instead. That keeps one navbar rather than a second one
 * that would drift, and the items stay in the same order in both places.
 *
 * `activeSection` is pinned to "projects" so the underline sits under the item
 * that describes where the visitor actually is, which is the thing a scroll
 * spy would otherwise be doing.
 */
export function PageChrome({
  children,
  activeSection = "projects",
}: {
  children: React.ReactNode
  /** The nav item this page lives under. */
  activeSection?: string
}) {
  const router = useRouter()

  const go = (sectionId: string) => {
    // Already here. Send them to the top rather than to a hash that does not
    // exist on this page, which would do nothing and feel broken.
    if (sectionId === activeSection) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    router.push(`/#${sectionId}`)
  }

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <div className="relative min-h-screen overflow-x-clip bg-gh-bg font-sans text-gh-text">
          <SiteNavbar
            items={navItems(true)}
            activeSection={activeSection}
            onScrollTo={go}
            homeHref="/"
          />
          {/* Every page using this chrome puts a <MascotSlot /> in its
              header and marks its sections with data-mascot-dock. */}
          <PageMascot />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </SmoothScroll>
    </MotionConfig>
  )
}
