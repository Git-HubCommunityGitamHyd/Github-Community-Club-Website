"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StackPreview } from "@/features/admin/stack-preview"
import type { Build } from "@/lib/db/builds"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import {
  BUILD_IMAGES_MAX,
  BUILD_ROLES,
  BUILD_ROLE_KEYS,
  BUILD_STATUSES,
  BUILD_STATUS_KEYS,
  weekLabel,
  type Credit,
} from "@/features/builds/keys"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"
const labelClass = "mb-1 block text-sm font-medium text-gh-muted"
const iconButton =
  "flex size-8 items-center justify-center rounded-md border border-gh-border bg-gh-bg/80 text-gh-muted transition hover:border-gh-muted hover:text-gh-text disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"

/** Same block as the project form's, so the two CMS screens read alike. */
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

function syncedLabel(build: Build) {
  if (!build.repo_url) return "Add a GitHub repository link to show commits."
  if (build.commit_count === null) {
    return "Could not read the commit count from GitHub. It is hidden on the page until it can."
  }
  const when = build.commits_synced_at
    ? new Date(build.commits_synced_at).toLocaleString()
    : "never"
  return `${build.commit_count.toLocaleString()} commits on the default branch, read from GitHub ${when}. Saving reads it again.`
}

type CreditRow = Credit & { key: string }

let nextKey = 0

type FormState = {
  slug: string
  title: string
  tagline: string
  description: string
  builtWith: string
  liveUrl: string
  repoUrl: string
  images: string[]
  devNotes: string
  credits: CreditRow[]
  status: string
  month: string
  weekOf: string
  sortOrder: string
  adminNote: string
}

/**
 * The CMS screen for a submitted build. Laid out like the project form, in
 * the order of the build's own page (name, brief, screenshots, stack, dev
 * notes, links, people), with the showcase controls first because deciding
 * whether it goes in at all is the first thing anyone does here.
 */
export function BuildReviewForm({
  build,
  thisMonth,
  thisWeek,
}: {
  build: Build
  /** From the server, so the shortcuts agree with the public page's clock. */
  thisMonth: string
  thisWeek: string
}) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>({
    slug: build.slug,
    title: build.title,
    tagline: build.tagline,
    description: build.description,
    builtWith: build.built_with,
    liveUrl: build.live_url ?? "",
    repoUrl: build.repo_url ?? "",
    images: build.images,
    devNotes: build.dev_notes,
    credits: build.credits.map((c) => ({ ...c, key: `c-${nextKey++}` })),
    status: build.status,
    month: build.month ?? "",
    weekOf: build.week_of ?? "",
    sortOrder: String(build.sort_order),
    adminNote: build.admin_note,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function move<T>(list: T[], index: number, by: number): T[] {
    const next = [...list]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    return next
  }

  function updateCredit(index: number, patch: Partial<Credit>) {
    set(
      "credits",
      form.credits.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    )
  }

  async function save(overrides: Partial<FormState> = {}) {
    setServerError(null)
    setSubmitting(true)
    const payload = { ...form, ...overrides }
    // Only accepted builds can be a week's pick.
    if (payload.status !== "accepted") payload.weekOf = ""
    try {
      const res = await fetch(adminHref(`/api/admin/builds/${build.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          credits: payload.credits.map(({ name, role, contribution }) => ({
            name,
            role,
            contribution,
          })),
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push(adminHref("/admin/builds"))
        router.refresh()
        return
      }
      setErrors(body.errors ?? {})
      setServerError(
        body.errors ? "Fix the fields marked below." : "Something went wrong.",
      )
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const error = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
    ) : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className="max-w-2xl space-y-8"
    >
      {build.status === "pending" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gh-accent/40 bg-gh-accent/5 p-4">
          <p className="mr-auto text-sm">Not reviewed yet.</p>
          <Button
            type="button"
            disabled={submitting}
            onClick={() =>
              save({ status: "accepted", month: form.month || thisMonth })
            }
          >
            Accept into this month
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() =>
              save({
                status: "accepted",
                month: form.month || thisMonth,
                weekOf: thisWeek,
              })
            }
          >
            Accept as this week&apos;s pick
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => save({ status: "declined" })}
          >
            Decline
          </Button>
        </div>
      )}

      <Section
        step={1}
        title="Showcase"
        hint="Accepted builds get a page and a place in their month on /builds."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {BUILD_STATUS_KEYS.map((key) => (
                <option key={key} value={key}>
                  {BUILD_STATUSES[key]}
                </option>
              ))}
            </select>
            {error("status")}
          </div>
          <div>
            <label className={labelClass} htmlFor="month">
              Month
            </label>
            <input
              id="month"
              type="month"
              className={inputClass}
              value={form.month}
              onChange={(e) => set("month", e.target.value)}
            />
            {error("month")}
          </div>
          <div>
            <label className={labelClass} htmlFor="weekOf">
              One of the week&apos;s picks
            </label>
            <div className="flex gap-2">
              <input
                id="weekOf"
                type="date"
                className={inputClass}
                value={form.weekOf}
                onChange={(e) => set("weekOf", e.target.value)}
                disabled={form.status !== "accepted"}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto"
                disabled={form.status !== "accepted"}
                onClick={() => set("weekOf", thisWeek)}
              >
                This week
              </Button>
              {form.weekOf && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto"
                  onClick={() => set("weekOf", "")}
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-gh-muted">
              {form.weekOf
                ? `Saved as the week starting Monday ${weekLabel(form.weekOf)} (any day in the week works).`
                : "Optional. Accepted builds only."}
            </p>
            {error("weekOf")}
          </div>
          <div>
            <label className={labelClass} htmlFor="sortOrder">
              Order within the month
            </label>
            <input
              id="sortOrder"
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
            />
            {error("sortOrder")}
          </div>
        </div>
      </Section>

      <Section
        step={2}
        title="Name"
        hint="The top of the page: the name, with the commit count beside it."
      >
        <div>
          <label className={labelClass} htmlFor="title">
            Name
          </label>
          <input
            id="title"
            maxLength={60}
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {error("title")}
        </div>
        <div>
          <label className={labelClass} htmlFor="slug">
            Slug
          </label>
          <div className="flex items-center rounded-md border border-gh-border bg-gh-elevated focus-within:border-gh-accent focus-within:ring-1 focus-within:ring-gh-accent">
            <span className="pl-3 font-mono text-sm text-gh-muted">
              /builds/
            </span>
            <input
              id="slug"
              className="w-full bg-transparent px-1 py-2 font-mono text-base text-gh-text focus:outline-none sm:text-sm"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </div>
          <p className="mt-1 text-sm text-gh-muted">
            The page&apos;s address. Changing it after the build is public
            breaks links people have shared.
          </p>
          {error("slug")}
        </div>
        <p className="text-sm text-gh-muted">{syncedLabel(build)}</p>
      </Section>

      <Section step={3} title="Brief">
        <div>
          <label className={labelClass} htmlFor="tagline">
            One line
          </label>
          <input
            id="tagline"
            maxLength={100}
            className={inputClass}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
          <p className="mt-1 text-sm text-gh-muted">
            On the card, and large at the top of the page.
          </p>
          {error("tagline")}
        </div>
        <div>
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={8}
            maxLength={1500}
            className={inputClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <p className="mt-1 text-sm text-gh-muted">
            Blank lines separate paragraphs, a line starting with{" "}
            <code>## </code> is a heading, lines starting with <code>- </code>{" "}
            are a list.
          </p>
          {error("description")}
        </div>
      </Section>

      <Section
        step={4}
        title="Screenshots"
        hint={`Up to ${BUILD_IMAGES_MAX}. The first is the cover (on the card and in the brief); the rest form the Screenshots section.`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {form.images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-md border border-gh-border bg-gh-elevated"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => set("images", move(form.images, i, -1))}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Move later"
                  disabled={i === form.images.length - 1}
                  onClick={() => set("images", move(form.images, i, 1))}
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Remove image"
                  onClick={() =>
                    set(
                      "images",
                      form.images.filter((s) => s !== src),
                    )
                  }
                >
                  <X className="size-3.5" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-gh-accent px-1.5 text-[11px] font-semibold text-gh-deep">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
        {form.images.length < BUILD_IMAGES_MAX && (
          <ImageUploadField
            folder="builds"
            label="Add an image"
            value={null}
            onChange={(url) => url && set("images", [...form.images, url])}
          />
        )}
        {error("images")}
      </Section>

      <Section step={5} title="Tech stack">
        <div>
          <label className={labelClass} htmlFor="builtWith">
            Tech stack
          </label>
          <input
            id="builtWith"
            maxLength={200}
            className={inputClass}
            value={form.builtWith}
            onChange={(e) => set("builtWith", e.target.value)}
            placeholder="Flutter, Firebase"
          />
          <p className="mt-1 text-sm text-gh-muted">
            Comma separated, in the order you want them shown.
          </p>
          <StackPreview value={form.builtWith} />
          {error("builtWith")}
        </div>
      </Section>

      <Section
        step={6}
        title="Dev notes"
        hint="Anything worth telling another developer: how it works, what was hard, what is next."
      >
        <div>
          <label className={labelClass} htmlFor="devNotes">
            Notes
          </label>
          <textarea
            id="devNotes"
            rows={6}
            maxLength={3000}
            className={inputClass}
            value={form.devNotes}
            onChange={(e) => set("devNotes", e.target.value)}
          />
          <p className="mt-1 text-sm text-gh-muted">
            Optional; the section is left out when empty. Same formatting as the
            description.
          </p>
          {error("devNotes")}
        </div>
      </Section>

      <Section step={7} title="Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="liveUrl">
              Live link
            </label>
            <input
              id="liveUrl"
              className={inputClass}
              value={form.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
              placeholder="https://"
            />
            {error("liveUrl")}
          </div>
          <div>
            <label className={labelClass} htmlFor="repoUrl">
              GitHub repository
            </label>
            <input
              id="repoUrl"
              className={inputClass}
              value={form.repoUrl}
              onChange={(e) => set("repoUrl", e.target.value)}
              placeholder="https://github.com/owner/repo"
            />
            {error("repoUrl")}
          </div>
        </div>
      </Section>

      <Section
        step={8}
        title="People"
        hint="Who made it and what each person did. The page lists the lead first, then teammates, in the order below."
      >
        <div className="space-y-3">
          {form.credits.map((credit, index) => (
            <div
              key={credit.key}
              className="space-y-3 rounded-lg border border-gh-border bg-gh-surface p-4"
            >
              <div className="flex gap-3">
                <input
                  aria-label="Name"
                  maxLength={80}
                  className={inputClass}
                  value={credit.name}
                  onChange={(e) =>
                    updateCredit(index, { name: e.target.value })
                  }
                  placeholder="Name"
                />
                <select
                  aria-label="Role"
                  className={`${inputClass} max-w-[9rem]`}
                  value={credit.role}
                  onChange={(e) =>
                    updateCredit(index, { role: e.target.value })
                  }
                >
                  {BUILD_ROLE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {BUILD_ROLES[key].label}
                    </option>
                  ))}
                </select>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() =>
                      set("credits", move(form.credits, index, -1))
                    }
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Move down"
                    disabled={index === form.credits.length - 1}
                    onClick={() => set("credits", move(form.credits, index, 1))}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Remove person"
                    onClick={() =>
                      set(
                        "credits",
                        form.credits.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <textarea
                aria-label="Contribution"
                rows={2}
                maxLength={400}
                className={inputClass}
                value={credit.contribution}
                onChange={(e) =>
                  updateCredit(index, { contribution: e.target.value })
                }
                placeholder="What they did, in a sentence or two. Optional."
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set("credits", [
                ...form.credits,
                {
                  key: `c-${nextKey++}`,
                  name: "",
                  role: form.credits.length === 0 ? "lead" : "member",
                  contribution: "",
                },
              ])
            }
          >
            <Plus className="size-4" />
            Add person
          </Button>
          {error("credits")}
          <p className="text-sm text-gh-muted">
            As submitted: {build.name}
            {build.teammates ? `, with ${build.teammates}` : ""}.
          </p>
        </div>
      </Section>

      <Section step={9} title="Admin note" hint="Private. Never shown.">
        <textarea
          id="adminNote"
          aria-label="Admin note"
          rows={3}
          maxLength={1000}
          className={inputClass}
          value={form.adminNote}
          onChange={(e) => set("adminNote", e.target.value)}
        />
      </Section>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(adminHref("/admin/builds"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
