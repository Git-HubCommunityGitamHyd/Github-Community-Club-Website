export type NavItem = { name: string; link: string }

/**
 * The homepage sections the navbar links to, in page order. Each `link` is the
 * section's id. Ideas and Builds are left out on purpose: they are ways in for
 * students outside the club rather than parts of the club's own story, and
 * they have their own pages.
 */
const SECTIONS = ["About", "Journey", "Board", "Events", "Projects", "Benefits"]

/**
 * The nav items. An empty projects section is not rendered at all, so the
 * homepage drops "Projects" when there are none rather than linking to
 * nothing. Inner pages always pass `true`: they cannot know, and `/projects`
 * exists either way.
 */
export function navItems(hasProjects: boolean): NavItem[] {
  return SECTIONS.filter((name) => hasProjects || name !== "Projects").map(
    (name) => ({ name, link: name.toLowerCase() }),
  )
}

/** The ids the homepage scroll spy watches, top to bottom. */
export function spySectionIds(hasProjects: boolean) {
  return ["hero", ...navItems(hasProjects).map((item) => item.link)]
}

/** Pages that are not homepage sections. Linked from the footer. */
export const PAGE_LINKS = [
  { name: "Members", href: "/members" },
  { name: "Events", href: "/events" },
  { name: "Projects", href: "/projects" },
  { name: "Proposals", href: "/proposals" },
  { name: "Builds", href: "/builds" },
]
