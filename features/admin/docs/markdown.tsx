import type { ReactNode } from "react"
import Link from "next/link"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { Mermaid } from "@/features/admin/docs/mermaid-lazy"
import { adminUrl } from "@/lib/auth/admin-path"
import { docByFile } from "@/lib/docs/registry"

const REPO =
  "https://github.com/Git-HubCommunityGitamHyd/Github-Community-Club-Website"

/**
 * Where a link in a doc should go from inside the CMS.
 *
 * The docs link to each other as `./05-database.md#anchor` and to code as
 * `../proxy.ts`, which is right on GitHub. Here a doc link becomes its CMS
 * page, and a link to a file in the repository opens it on GitHub.
 */
function resolveHref(href: string): { href: string; external: boolean } {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#")) {
    return { href, external: /^https?:/i.test(href) }
  }
  const [path, hash] = href.split("#")
  const doc = docByFile(path.replace(/^\.\//, ""))
  if (doc) {
    const base = adminUrl(doc.slug ? `/admin/docs/${doc.slug}` : "/admin/docs")
    return { href: hash ? `${base}#${hash}` : base, external: false }
  }
  // Relative to docs/ in the repository.
  const parts: string[] = ["docs"]
  for (const part of path.split("/")) {
    if (part === "..") parts.pop()
    else if (part && part !== ".") parts.push(part)
  }
  const kind = path.endsWith("/") ? "tree" : "blob"
  return {
    href: `${REPO}/${kind}/main/${parts.join("/")}${hash ? `#${hash}` : ""}`,
    external: true,
  }
}

function text(children: ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(text).join("")
  return ""
}

const components: Components = {
  h1: ({ children, id }) => (
    <h1
      id={id}
      className="mb-6 scroll-mt-24 text-3xl font-semibold tracking-tight text-gh-text"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mb-3 mt-12 scroll-mt-24 border-b border-gh-border pb-2 text-xl font-semibold text-gh-text"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="mb-2 mt-8 scroll-mt-24 text-lg font-semibold text-gh-text"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="mb-2 mt-6 scroll-mt-24 font-semibold text-gh-text">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-relaxed text-gh-text/90">{children}</p>
  ),
  ul: ({ children, className }) => (
    <ul
      className={
        className?.includes("contains-task-list")
          ? "my-4 space-y-1.5"
          : "my-4 list-disc space-y-1.5 pl-6 marker:text-gh-muted"
      }
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:text-gh-muted">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-gh-text/90">{children}</li>
  ),
  input: ({ checked }) => (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      disabled
      className="mr-2 translate-y-px accent-gh-accent"
    />
  ),
  a: ({ href = "", children }) => {
    const target = resolveHref(href)
    const className =
      "text-gh-accent underline decoration-gh-accent/40 underline-offset-2 hover:decoration-gh-accent"
    return target.external ? (
      <a
        href={target.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {children}
      </a>
    ) : (
      <Link href={target.href} className={className}>
        {children}
      </Link>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-md border-l-4 border-amber-400/60 bg-amber-400/5 px-4 py-1 text-gh-text/90">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-gh-border" />,
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-lg border border-gh-border">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gh-surface">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-medium text-gh-text">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-gh-border px-3 py-2 align-top text-gh-text/90">
      {children}
    </td>
  ),
  // Blocks are drawn by `code`; <pre> would only wrap them a second time.
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const source = text(children)
    const language = /language-(\w+)/.exec(className ?? "")?.[1]
    if (language === "mermaid") return <Mermaid chart={source.trimEnd()} />
    if (!language && !source.includes("\n")) {
      return (
        <code className="rounded bg-gh-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-gh-text">
          {children}
        </code>
      )
    }
    return (
      <pre className="my-5 overflow-x-auto rounded-lg border border-gh-border bg-gh-deep p-4 font-mono text-[13px] leading-relaxed text-gh-text">
        <code>{source.trimEnd()}</code>
      </pre>
    )
  },
}

/** A doc from docs/, rendered for the CMS. Raw HTML in the Markdown is ignored. */
export function DocMarkdown({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  )
}
