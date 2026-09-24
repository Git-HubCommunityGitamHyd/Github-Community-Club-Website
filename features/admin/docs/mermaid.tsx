"use client"

import { useEffect, useId, useState } from "react"

let ready: Promise<typeof import("mermaid").default> | null = null

/** Loads mermaid once, on the first diagram, themed to the site palette. */
function loadMermaid() {
  ready ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      // The schema diagram is far wider than the column; shrunk to fit it is
      // unreadable, so it keeps its size and the box scrolls sideways.
      er: { useMaxWidth: false },
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
      themeVariables: {
        darkMode: true,
        background: "#0d1117",
        primaryColor: "#161b22",
        primaryTextColor: "#e6edf3",
        primaryBorderColor: "#30363d",
        secondaryColor: "#21262d",
        tertiaryColor: "#161b22",
        lineColor: "#8b949e",
        textColor: "#e6edf3",
        mainBkg: "#161b22",
        nodeBorder: "#3fb950",
        clusterBkg: "#0d1117",
        clusterBorder: "#30363d",
        edgeLabelBackground: "#0d1117",
        actorBkg: "#161b22",
        actorBorder: "#3fb950",
        actorTextColor: "#e6edf3",
        signalColor: "#8b949e",
        signalTextColor: "#e6edf3",
        noteBkgColor: "#21262d",
        noteTextColor: "#e6edf3",
        noteBorderColor: "#30363d",
        labelBoxBkgColor: "#21262d",
        labelTextColor: "#e6edf3",
        loopTextColor: "#e6edf3",
        activationBkgColor: "#21262d",
        attributeBackgroundColorOdd: "#161b22",
        attributeBackgroundColorEven: "#0d1117",
      },
    })
    return mermaid
  })
  return ready
}

/**
 * A ```mermaid block, drawn in the browser. Until it is drawn (or if the
 * diagram has a syntax error) the source is shown instead, so the content is
 * never missing.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadMermaid()
      .then((mermaid) => mermaid.render(id, chart))
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [id, chart])

  if (svg) {
    return (
      <div
        className="my-6 overflow-x-auto rounded-lg border border-gh-border bg-gh-bg p-4 [&_svg]:mx-auto [&_svg]:h-auto"
        // Mermaid's own output, rendered with securityLevel "strict" from a
        // file in this repository.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  return (
    <div className="my-6">
      <pre className="overflow-x-auto rounded-lg border border-gh-border bg-gh-deep p-4 font-mono text-xs leading-relaxed text-gh-muted">
        {chart}
      </pre>
      {failed && (
        <p className="mt-1 text-xs text-red-400">
          This diagram could not be drawn; the source is shown instead.
        </p>
      )}
    </div>
  )
}
