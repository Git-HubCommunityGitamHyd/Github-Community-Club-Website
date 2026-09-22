"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import type { BoardMember } from "@/lib/db/board-members"

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text dark:placeholder:text-gh-muted dark:focus:border-gh-accent dark:focus:ring-gh-accent"

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gh-muted"

type FormState = {
  name: string
  role: string
  imageUrl: string | null
  description: string
  github: string
  linkedin: string
  email: string
  sortOrder: string
}

function toFormState(member?: BoardMember): FormState {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "",
    imageUrl: member?.image_url ?? null,
    description: member?.description ?? "",
    github: member?.github ?? "",
    linkedin: member?.linkedin ?? "",
    email: member?.email ?? "",
    sortOrder: member ? String(member.sort_order) : "0",
  }
}

export function BoardMemberForm({ initial }: { initial?: BoardMember }) {
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
      ? `/api/admin/board-members/${initial.id}`
      : "/api/admin/board-members"
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push("/admin/board")
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
          Role
        </label>
        <input
          id="role"
          className={inputClass}
          placeholder="e.g. President"
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
        />
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
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
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

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add member"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/board")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
