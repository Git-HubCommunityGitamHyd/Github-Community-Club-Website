"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Team } from "@/lib/db/teams"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

type FormState = { name: string; description: string; sortOrder: string }

export function TeamForm({ initial }: { initial?: Team }) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    sortOrder: initial ? String(initial.sort_order) : "0",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setSubmitting(true)
    try {
      const res = await fetch(
        initial
          ? adminHref(`/api/admin/teams/${initial.id}`)
          : adminHref("/api/admin/teams"),
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      )
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push(adminHref("/admin/teams"))
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
        <label className={labelClass} htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Web"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={200}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <p className="mt-1 text-sm text-gh-muted">
          Optional. One sentence under the team&apos;s name on the members page.
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
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
          Low to high, top to bottom on the members page.
        </p>
        {errors.sortOrder && (
          <p className="mt-1 text-sm text-red-500">{errors.sortOrder}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Add team"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(adminHref("/admin/teams"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
