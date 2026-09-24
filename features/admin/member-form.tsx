"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import type { Member } from "@/lib/db/members"
import {
  BOARD_ACCENTS,
  BOARD_ACCENT_KEYS,
  boardAccent,
} from "@/features/v2/board/accents"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

type FormState = {
  name: string
  role: string
  imageUrl: string | null
  description: string
  github: string
  linkedin: string
  email: string
  accent: string
  sortOrder: string
}

function toFormState(member?: Member): FormState {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "",
    imageUrl: member?.image_url ?? null,
    description: member?.description ?? "",
    github: member?.github ?? "",
    linkedin: member?.linkedin ?? "",
    email: member?.email ?? "",
    accent: member?.accent ?? "green",
    sortOrder: member ? String(member.sort_order) : "0",
  }
}

export function MemberForm({ initial }: { initial?: Member }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(toFormState(initial))
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

    const url = initial
      ? `/api/admin/members/${initial.id}`
      : "/api/admin/members"
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push("/admin/members")
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
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="role">
          Headline
        </label>
        <input
          id="role"
          className={inputClass}
          placeholder="e.g. Backend, third year CSE"
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
        />
        <p className="mt-1 text-sm text-gh-muted">
          Optional. One line under their name in the profile popup.
        </p>
        {errors.role && (
          <p className="mt-1 text-sm text-red-500">{errors.role}</p>
        )}
      </div>

      <ImageUploadField
        label="Photo"
        value={form.imageUrl}
        onChange={(url) => set("imageUrl", url)}
      />

      <div>
        <label className={labelClass} htmlFor="description">
          Bio
        </label>
        <textarea
          id="description"
          rows={5}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <p className="mt-1 text-sm text-gh-muted">
          Optional. What they work on and what they like building. Their part in
          a specific project is written on that project instead.
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="github">
            GitHub username
          </label>
          <input
            id="github"
            className={inputClass}
            value={form.github}
            onChange={(e) => set("github", e.target.value)}
          />
          {errors.github && (
            <p className="mt-1 text-sm text-red-500">{errors.github}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="linkedin">
            LinkedIn username
          </label>
          <input
            id="linkedin"
            className={inputClass}
            value={form.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="sortOrder">
            Sort order
          </label>
          <input
            id="sortOrder"
            type="number"
            className={inputClass}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="accent">
          Photo ring
        </label>
        <div className="flex items-center gap-3">
          {/* A live swatch of the actual gradient, because the names alone
              ("Aurora", "Ember") do not tell you what you are choosing. */}
          <span
            aria-hidden="true"
            className="size-10 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${boardAccent(form.accent).stops.join(", ")})`,
            }}
          />
          {/* A dropdown of known keys, not a colour picker: the ring is stored
              as a key so the page owns what each one renders as. A free hex
              field would put a colour that belongs to no palette on the site,
              permanently, the first time anybody used it. */}
          <select
            id="accent"
            className={inputClass}
            value={form.accent}
            onChange={(e) => set("accent", e.target.value)}
          >
            {BOARD_ACCENT_KEYS.map((key) => (
              <option key={key} value={key}>
                {BOARD_ACCENTS[key].label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-sm text-gh-muted">
          Shown around their photo when someone opens their profile.
        </p>
        {errors.accent && (
          <p className="mt-1 text-sm text-red-500">{errors.accent}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add member"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/members")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
