"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import { MemberAvatar } from "@/features/people/member-avatar"
import type { BoardMember } from "@/lib/db/board-members"
import { BOARD_ACCENTS, BOARD_ACCENT_KEYS } from "@/features/board/accents"
import { useAdminUrl } from "@/features/admin/admin-base"

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

function toFormState(member?: BoardMember): FormState {
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

export function BoardMemberForm({ initial }: { initial?: BoardMember }) {
  const router = useRouter()
  const adminHref = useAdminUrl()
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
      ? adminHref(`/api/admin/board-members/${initial.id}`)
      : adminHref("/api/admin/board-members")
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push(adminHref("/admin/board"))
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

      {/* Photo and ring together, with previews of both places the photo
          appears: the homepage tile (black and white until hovered, cropped
          near-square) and the profile popup (a circle inside the ring). A
          photo that works in one can be cropped badly in the other. */}
      <fieldset className="rounded-lg border border-gh-border p-4">
        <legend className="px-1 text-sm font-medium text-gh-muted">
          Photo and profile ring
        </legend>
        <div className="mb-5 flex flex-wrap items-end gap-5">
          <BoardTilePreview
            name={form.name}
            src={form.imageUrl}
            grey
            caption="Homepage"
          />
          <BoardTilePreview
            name={form.name}
            src={form.imageUrl}
            caption="On hover"
          />
          <div className="flex flex-col items-center gap-2">
            <MemberAvatar
              person={{
                name: form.name || "?",
                image_url: form.imageUrl,
                accent: form.accent,
              }}
              size={96}
              spin="always"
            />
            <span className="text-xs text-gh-muted">Profile</span>
          </div>
        </div>
        <div className="space-y-4">
          <ImageUploadField
            label="Photo"
            folder="board"
            preview={false}
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
            hint="Square, at least 600 × 600 px, face in the middle. Without one, the homepage shows their initials and the profile an identicon."
          />
          {errors.imageUrl && (
            <p className="text-sm text-red-500">{errors.imageUrl}</p>
          )}
          <div>
            <label className={labelClass} htmlFor="accent">
              Profile ring
            </label>
            {/* A dropdown of known keys, not a colour picker: the ring is
                stored as a key so the page owns what each one renders as. A
                free hex field would put a colour that belongs to no palette
                on the site, permanently, the first time anybody used it. */}
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
            {errors.accent && (
              <p className="mt-1 text-sm text-red-500">{errors.accent}</p>
            )}
          </div>
        </div>
      </fieldset>

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
          onClick={() => router.push(adminHref("/admin/board"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

/** The homepage board tile, at a fixed small size, as it will crop the photo. */
function BoardTilePreview({
  name,
  src,
  grey = false,
  caption,
}: {
  name: string
  src: string | null
  grey?: boolean
  caption: string
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-[104px] overflow-hidden rounded-xl bg-gh-elevated"
        style={{ aspectRatio: "13 / 14" }}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="104px"
            className={
              grey ? "object-cover brightness-[0.78] grayscale" : "object-cover"
            }
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-mono text-lg font-bold text-gh-muted">
            {initials || "?"}
          </span>
        )}
      </div>
      <span className="text-xs text-gh-muted">{caption}</span>
    </div>
  )
}
