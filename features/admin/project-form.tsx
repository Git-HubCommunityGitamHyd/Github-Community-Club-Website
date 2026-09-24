"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StackPreview } from "@/features/admin/stack-preview"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import { PROJECT_STATUSES, projectStatus } from "@/features/projects/statuses"
import { slugify } from "@/lib/validation/project"
import type { Project, TeamMember } from "@/lib/db/projects"
import type { Member } from "@/lib/db/members"
import { TeamEditor, type TeamRow } from "@/features/admin/team-editor"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

const STATUS_KEYS = Object.keys(PROJECT_STATUSES)

type FormState = {
  name: string
  slug: string
  summary: string
  body: string
  status: string
  liveUrl: string
  repoUrl: string
  previewImage: string
  coverImage: string
  tags: string
  devNotes: string
  sortOrder: string
}

function toFormState(project?: Project): FormState {
  return {
    name: project?.name ?? "",
    slug: project?.slug ?? "",
    summary: project?.summary ?? "",
    body: project?.body ?? "",
    status: project?.status ?? "in-progress",
    liveUrl: project?.live_url ?? "",
    repoUrl: project?.repo_url ?? "",
    previewImage: project?.preview_image ?? "",
    coverImage: project?.cover_image ?? "",
    tags: project?.tags.join(", ") ?? "",
    devNotes: project?.dev_notes ?? "",
    sortOrder: project ? String(project.sort_order) : "0",
  }
}

/**
 * One block of the form. The blocks run in the same order as the sections of
 * the project's own page, so whoever fills this in is reading the page top to
 * bottom as they go.
 */
function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 border-t border-gh-border pt-6">
      <header>
        <h2 className="flex items-baseline gap-3 text-base font-semibold text-gh-text">
          <span className="font-mono text-xs text-gh-muted">
            {String(step).padStart(2, "0")}
          </span>
          {title}
        </h2>
        {hint && <p className="mt-1 text-sm text-gh-muted">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

function syncedLabel(project: Project) {
  if (!project.repo_url) return "Add a GitHub repository link to show commits."
  if (project.commit_count === null) {
    return "Could not read the commit count from GitHub. It is hidden on the page until it can."
  }
  const when = project.commits_synced_at
    ? new Date(project.commits_synced_at).toLocaleString()
    : "never"
  return `${project.commit_count.toLocaleString()} commits on the default branch, read from GitHub ${when}. Saving reads it again.`
}

export function ProjectForm({
  initial,
  initialTeam = [],
  members,
}: {
  initial?: Project
  initialTeam?: TeamMember[]
  members: Member[]
}) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>(toFormState(initial))
  const [team, setTeam] = useState<TeamRow[]>(() =>
    initialTeam.map((person) => ({
      key: String(person.id),
      memberId: String(person.id),
      role: person.project_role,
      contribution: person.contribution,
    })),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  // Once the slug has been typed in, it stops tracking the name. Editing an
  // existing project starts detached: the slug is in a live URL by then and
  // renaming the project must not silently move the page.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial))

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const status = projectStatus(form.status)
  const StatusIcon = status.icon

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setSubmitting(true)

    const url = initial
      ? adminHref(`/api/admin/projects/${initial.id}`)
      : adminHref("/api/admin/projects")
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          team: team.map(({ memberId, role, contribution }) => ({
            memberId: Number(memberId),
            role,
            contribution,
          })),
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push(adminHref("/admin/projects"))
        router.refresh()
        return
      }
      setErrors(body.errors ?? {})
      setServerError(body.errors ? null : "Something went wrong.")
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <Section
        step={1}
        title="Name and status"
        hint="The top of the page: the name, with the commit count beside it."
      >
        <div>
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => {
              set("name", e.target.value)
              if (!slugTouched) set("slug", slugify(e.target.value))
            }}
            placeholder="Campus Mess Menu"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set("slug", e.target.value)
            }}
            placeholder="campus-mess-menu"
          />
          <p className="mt-1 text-sm text-gh-muted">
            The project&apos;s address: /projects/{form.slug || "slug"}.
            Changing it on a published project breaks any existing link to it.
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gh-border bg-gh-elevated text-gh-text"
              >
                <StatusIcon className="h-5 w-5" />
              </span>
              {/* Known keys only. The badge looks the value up, so free text
                would quietly render the fallback status with nothing to show
                for it. */}
              <select
                id="status"
                className={inputClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {PROJECT_STATUSES[key].label}
                  </option>
                ))}
              </select>
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="sortOrder">
              Order
            </label>
            <input
              id="sortOrder"
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
            />
            <p className="mt-1 text-sm text-gh-muted">
              Low to high. The homepage shows the first five.
            </p>
            {errors.sortOrder && (
              <p className="mt-1 text-sm text-red-500">{errors.sortOrder}</p>
            )}
          </div>
        </div>

        {initial && (
          <p className="rounded-md border border-gh-border bg-gh-surface px-3 py-2 text-sm text-gh-muted">
            {syncedLabel(initial)}
          </p>
        )}
      </Section>

      <Section
        step={2}
        title="Brief"
        hint="What the project is and why it exists."
      >
        <div>
          <label className={labelClass} htmlFor="summary">
            Summary
          </label>
          <textarea
            id="summary"
            rows={2}
            className={inputClass}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            placeholder="One line. Shown in the list and under the name."
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-500">{errors.summary}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="body">
            Full description
          </label>
          <textarea
            id="body"
            rows={8}
            className={inputClass}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={
              "Shown only on the project's own page.\n\nBlank lines start a new paragraph. A line beginning with ## is a heading, and a line beginning with - is a bullet."
            }
          />
          <p className="mt-1 text-sm text-gh-muted">
            Optional. Blank lines separate paragraphs, <code>## </code> makes a
            heading and <code>- </code> makes a bullet.
          </p>
          {errors.body && (
            <p className="mt-1 text-sm text-red-500">{errors.body}</p>
          )}
        </div>

        <ImageUploadField
          folder="projects"
          label="Cover image"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url ?? "")}
        />
        <p className="-mt-2 text-sm text-gh-muted">
          Used on the projects page and at the top of this project&apos;s own
          page.
        </p>
      </Section>

      <Section step={3} title="Tech stack">
        <div>
          <label className={labelClass} htmlFor="tags">
            Tech stack
          </label>
          <input
            id="tags"
            className={inputClass}
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="Next.js, D1, Workers"
          />
          <p className="mt-1 text-sm text-gh-muted">
            Comma separated, in the order you want them shown.
          </p>
          <StackPreview value={form.tags} />
        </div>
      </Section>

      <Section
        step={4}
        title="Dev notes"
        hint="Anything worth telling another developer: how it is deployed, what was hard, what is next, known rough edges."
      >
        <div>
          <label className={labelClass} htmlFor="devNotes">
            Notes
          </label>
          <textarea
            id="devNotes"
            rows={6}
            className={inputClass}
            value={form.devNotes}
            onChange={(e) => set("devNotes", e.target.value)}
          />
          <p className="mt-1 text-sm text-gh-muted">
            Optional; the section is left out when empty. Same formatting as the
            description.
          </p>
        </div>
      </Section>

      <Section step={5} title="Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="liveUrl">
              Live URL
            </label>
            <input
              id="liveUrl"
              className={inputClass}
              value={form.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
              placeholder="https://example.com"
            />
            <p className="mt-1 text-sm text-gh-muted">
              Leave blank if nothing is deployed. Without it the homepage shows
              no hover preview for this project.
            </p>
            {errors.liveUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.liveUrl}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="repoUrl">
              Repository URL
            </label>
            <input
              id="repoUrl"
              className={inputClass}
              value={form.repoUrl}
              onChange={(e) => set("repoUrl", e.target.value)}
              placeholder="https://github.com/org/repo"
            />
            {errors.repoUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.repoUrl}</p>
            )}
          </div>
        </div>

        <ImageUploadField
          folder="projects"
          label="Preview image"
          value={form.previewImage}
          onChange={(url) => set("previewImage", url ?? "")}
        />
        <p className="-mt-2 text-sm text-gh-muted">
          A screenshot of the deployed site. This is what the homepage shows in
          the little window that follows the cursor.
        </p>
      </Section>

      <Section
        step={6}
        title="People"
        hint="Listed at the bottom of the page, maintainers first, then the team lead, then members. Their faces also appear under the project name and on the projects list."
      >
        <TeamEditor members={members} rows={team} onChange={setTeam} />
        {errors.team && <p className="text-sm text-red-500">{errors.team}</p>}
      </Section>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Add project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(adminHref("/admin/projects"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
