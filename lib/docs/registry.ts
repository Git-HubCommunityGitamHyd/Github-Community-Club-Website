import index from "@/docs/README.md"
import overview from "@/docs/01-overview.md"
import architecture from "@/docs/02-architecture.md"
import localDevelopment from "@/docs/03-local-development.md"
import deployment from "@/docs/04-deployment.md"
import database from "@/docs/05-database.md"
import cmsAndSecurity from "@/docs/06-cms-and-security.md"
import contentWorkflows from "@/docs/07-content-workflows.md"
import media from "@/docs/08-media-and-uploads.md"
import frontend from "@/docs/09-frontend.md"
import runbook from "@/docs/10-operations-runbook.md"
import avatarPrompt from "@/docs/member-avatar-prompt.md"

/**
 * The files in docs/, as the CMS Docs page shows them.
 *
 * The Markdown is imported as text (next.config.js turns *.md into raw
 * strings), so the Worker carries the same files GitHub renders and nothing
 * is read from disk at runtime. A new file in docs/ needs a line here.
 */
export type Doc = {
  /** URL segment under /docs; "" is the index. */
  slug: string
  /** File name inside docs/, which is how docs link to each other. */
  file: string
  title: string
  body: string
}

function titleOf(body: string, fallback: string) {
  return body.match(/^#\s+(.+)$/m)?.[1].trim() ?? fallback
}

const SOURCES: [slug: string, file: string, body: string][] = [
  ["", "README.md", index],
  ["overview", "01-overview.md", overview],
  ["architecture", "02-architecture.md", architecture],
  ["local-development", "03-local-development.md", localDevelopment],
  ["deployment", "04-deployment.md", deployment],
  ["database", "05-database.md", database],
  ["cms-and-security", "06-cms-and-security.md", cmsAndSecurity],
  ["content-workflows", "07-content-workflows.md", contentWorkflows],
  ["media-and-uploads", "08-media-and-uploads.md", media],
  ["frontend", "09-frontend.md", frontend],
  ["operations-runbook", "10-operations-runbook.md", runbook],
  ["member-avatar-prompt", "member-avatar-prompt.md", avatarPrompt],
]

export const DOCS: Doc[] = SOURCES.map(([slug, file, body]) => ({
  slug,
  file,
  title: slug === "" ? "Start here" : titleOf(body, file),
  body,
}))

export function findDoc(slug: string): Doc | undefined {
  return DOCS.find((doc) => doc.slug === slug)
}

export function docByFile(file: string): Doc | undefined {
  return DOCS.find((doc) => doc.file === file)
}
