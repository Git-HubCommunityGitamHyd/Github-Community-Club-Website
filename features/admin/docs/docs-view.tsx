import Link from "next/link"
import { AdminNav } from "@/features/admin/admin-nav"
import { DocMarkdown } from "@/features/admin/docs/markdown"
import { adminUrl } from "@/lib/auth/admin-path"
import { DOCS, type Doc } from "@/lib/docs/registry"
import { cn } from "@/lib/utils"

const REPO_DOCS =
  "https://github.com/Git-HubCommunityGitamHyd/Github-Community-Club-Website/blob/main/docs"

/** The CMS Docs page: the list of docs beside the open one. */
export function DocsView({ doc }: { doc: Doc }) {
  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/docs" />
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Documentation"
            className="lg:sticky lg:top-8 lg:self-start"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-gh-muted">
              Docs
            </p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
              {DOCS.map((item) => (
                <li key={item.file}>
                  <Link
                    href={adminUrl(
                      item.slug ? `/admin/docs/${item.slug}` : "/admin/docs",
                    )}
                    aria-current={item.slug === doc.slug ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2.5 py-1.5 text-sm",
                      item.slug === doc.slug
                        ? "bg-gh-surface text-gh-text"
                        : "text-gh-muted hover:text-gh-text",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="min-w-0 max-w-3xl">
            <DocMarkdown body={doc.body} />
            <p className="mt-16 border-t border-gh-border pt-4 text-xs text-gh-muted">
              Source:{" "}
              <a
                href={`${REPO_DOCS}/${doc.file}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono hover:text-gh-text"
              >
                docs/{doc.file}
              </a>
              . Edit the file in the repository; this page updates on the next
              deploy.
            </p>
          </article>
        </div>
      </div>
    </main>
  )
}
