"use client"

import { HomeMascot } from "@/features/mascot/home-mascot"
import { PAGE_MASCOT_SLOT } from "@/features/mascot/mascot-slot"

/**
 * The homepage's octocat on the pages that are not the homepage.
 *
 * Same character, same rig: large in the page header, then leaving it as you
 * scroll to dock beside each section, alternating sides, the way it walks
 * down the homepage. The difference is only in how it finds its places. The
 * homepage hands `HomeMascot` a ref and a fixed list of section ids; inner
 * pages are server components that cannot hold a ref, and their sections
 * come from the CMS, so they mark a slot by id (<MascotSlot />) and mark each
 * section with `data-mascot-dock`.
 */
export function PageMascot() {
  return <HomeMascot heroSlotId={PAGE_MASCOT_SLOT} docks="auto" />
}
