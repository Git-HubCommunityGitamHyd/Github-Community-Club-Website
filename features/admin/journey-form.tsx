"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  JOURNEY_ICONS,
  JOURNEY_ICON_KEYS,
  journeyIcon,
} from "@/features/journey/icons"
import type { JourneyEntry } from "@/lib/db/journey"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

function IconPreview({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-5 w-5" />
}

type FormState = {
  entryDate: string
  title: string
  description: string
  icon: string
  sortOrder: string
}

function toFormState(entry?: JourneyEntry): FormState {
  return {
    entryDate: entry?.entry_date ?? "",
    title: entry?.title ?? "",
    description: entry?.description ?? "",
    icon: entry?.icon ?? "commit",
    sortOrder: entry ? String(entry.sort_order) : "0",
  }
}

/**
 * Turns a native month input (YYYY-MM) into the display string the timeline
 * uses, e.g. "February 2022".
 *
 * A month picker rather than a free-text field because the public timeline's
 * year rail derives its years by taking the last whitespace-separated token of
 * this string. "Feb 2022", "2022-02" and "early 2022" would each produce a
 * different or nonsense rail entry, and nobody would find out until the
 * homepage was looked at.
 */
function formatEntryDate(month: string): string {
  if (!month) return ""
  const date = new Date(`${month}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function JourneyForm({ initial }: { initial?: JourneyEntry }) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>(toFormState(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [month, setMonth] = useState("")

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Lowercase, rendered through a module-scope component: a capitalised
  // local assigned from a call during render trips react-hooks/static-components.
  const previewGlyph = journeyIcon(form.icon)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setSubmitting(true)

    const url = initial
      ? adminHref(`/api/admin/journey/${initial.id}`)
      : adminHref("/api/admin/journey")
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push(adminHref("/admin/journey"))
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={inputClass}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="700+ Members"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="month">
            Month
          </label>
          <input
            id="month"
            type="month"
            className={inputClass}
            value={month}
            onChange={(e) => {
              setMonth(e.target.value)
              set("entryDate", formatEntryDate(e.target.value))
            }}
          />
          <p className="mt-1 text-sm text-gh-muted">
            {form.entryDate || "Shown on the timeline as “February 2022”"}
          </p>
          {errors.entryDate && (
            <p className="mt-1 text-sm text-red-500">{errors.entryDate}</p>
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
            Low to high, oldest first. The timeline does not sort by date.
          </p>
          {errors.sortOrder && (
            <p className="mt-1 text-sm text-red-500">{errors.sortOrder}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="icon">
          Icon
        </label>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gh-border bg-gh-elevated text-gh-text"
          >
            <IconPreview icon={previewGlyph} />
          </span>
          {/* A dropdown of known keys, not free text: the timeline looks the
              value up in JOURNEY_ICONS, so a typo would quietly fall back to
              the generic commit glyph with nothing to show it had. */}
          <select
            id="icon"
            className={inputClass}
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
          >
            {JOURNEY_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {JOURNEY_ICONS[key].label}
              </option>
            ))}
          </select>
        </div>
        {errors.icon && (
          <p className="mt-1 text-sm text-red-500">{errors.icon}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add entry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(adminHref("/admin/journey"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
