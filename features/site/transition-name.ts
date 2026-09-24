// Not in transition.tsx: that file is a client module, and the project page
// that also needs these names is a server component.

/**
 * The shared-element names. Both pages must produce the same string for the
 * same project, and each name may appear once per page. Prefixed because a
 * slug can start with a digit, which is not a valid CSS identifier start.
 */
export function transitionName(slug: string, part: "cover" | "title") {
  return `project-${slug}-${part}`
}

/** The same, for a build card and its page. Its own prefix, so a build and a
 *  project that share a slug can never share a name. */
export function buildTransitionName(slug: string, part: "cover" | "title") {
  return `build-${slug}-${part}`
}
