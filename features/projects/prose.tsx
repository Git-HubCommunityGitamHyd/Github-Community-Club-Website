import { Fragment } from "react"

/**
 * Renders a project's long description.
 *
 * Deliberately not Markdown. Pulling in a Markdown parser and a sanitiser to
 * support a field that three people will ever write into is a dependency, a
 * bundle cost and an XSS surface, all for syntax nobody asked for. This
 * understands exactly three things, which is what the admin form promises:
 * blank lines separate paragraphs, a line starting with `## ` is a heading,
 * and consecutive lines starting with `- ` are a list.
 *
 * Everything is rendered as text, never as HTML, so a CMS row cannot inject
 * markup into the page.
 */
type Block =
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string }

function parse(body: string): Block[] {
  const blocks: Block[] = []
  for (const chunk of body.split(/\n\s*\n/)) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length === 0) continue

    if (lines[0].startsWith("## ")) {
      blocks.push({ kind: "heading", text: lines[0].slice(3).trim() })
      const rest = lines.slice(1)
      if (rest.length > 0) blocks.push(...parse(rest.join("\n")))
      continue
    }

    if (lines.every((line) => line.startsWith("- "))) {
      blocks.push({
        kind: "list",
        items: lines.map((line) => line.slice(2).trim()),
      })
      continue
    }

    blocks.push({ kind: "paragraph", text: lines.join(" ") })
  }
  return blocks
}

export function ProjectProse({ body }: { body: string }) {
  const blocks = parse(body)
  if (blocks.length === 0) return null

  return (
    <div className="max-w-[68ch]">
      {blocks.map((block, index) => (
        <Fragment key={index}>
          {block.kind === "heading" && (
            <h2 className="mb-4 mt-12 text-[clamp(22px,2.4vw,30px)] font-extrabold tracking-[-0.02em] first:mt-0">
              {block.text}
            </h2>
          )}
          {block.kind === "paragraph" && (
            <p className="mb-5 text-pretty text-lg leading-relaxed text-gh-muted">
              {block.text}
            </p>
          )}
          {block.kind === "list" && (
            <ul className="mb-6 space-y-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gh-accent"
                  />
                  <span className="text-pretty leading-relaxed text-gh-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      ))}
    </div>
  )
}
