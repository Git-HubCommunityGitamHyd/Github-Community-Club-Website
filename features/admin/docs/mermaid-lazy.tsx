"use client"

import dynamic from "next/dynamic"

/**
 * The Mermaid diagram, loaded in the browser only.
 *
 * `ssr: false` is what keeps mermaid (several MB with its layout engines)
 * out of the server bundle. A plain `import("mermaid")` inside an effect is
 * still compiled for the server, and the Worker has a size limit.
 */
export const Mermaid = dynamic(
  () => import("@/features/admin/docs/mermaid").then((m) => m.Mermaid),
  {
    ssr: false,
    loading: () => (
      <div className="my-6 h-40 animate-pulse rounded-lg border border-gh-border bg-gh-surface" />
    ),
  },
)
