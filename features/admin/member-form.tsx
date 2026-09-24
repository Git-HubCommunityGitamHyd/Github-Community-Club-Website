"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import type { Member } from "@/lib/db/members"
import type { Team } from "@/lib/db/teams"
import { BOARD_ACCENTS, BOARD_ACCENT_KEYS } from "@/features/board/accents"
import { MemberAvatar } from "@/features/people/member-avatar"

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
  tagline: string
  handle: string
  teamId: string
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
    tagline: member?.tagline ?? "",
    handle: member?.handle ?? "",
    teamId: member?.team_id ? String(member.team_id) : "",
    sortOrder: member ? String(member.sort_order) : "0",
  }
}

export function MemberForm({
  initial,
  teams,
}: {
  initial?: Member
  teams: Team[]
}) {
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

      <div>
        <label className={labelClass} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          maxLength={80}
          className={inputClass}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="e.g. Breaks the build so you do not have to"
        />
        <p className="mt-1 text-sm text-gh-muted">
          Optional, in their own words. One line at the bottom of their card on
          the members page, and at the top of their profile.{" "}
          {form.tagline.length}/80
        </p>
        {errors.tagline && (
          <p className="mt-1 text-sm text-red-500">{errors.tagline}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="handle">
          Handle
        </label>
        <div className="flex items-center rounded-md border border-gh-border bg-gh-elevated focus-within:border-gh-accent focus-within:ring-1 focus-within:ring-gh-accent">
          <span className="pl-3 font-mono text-sm text-gh-muted">@</span>
          <input
            id="handle"
            className="w-full bg-transparent px-1 py-2 font-mono text-base text-gh-text placeholder:text-gh-muted focus:outline-none sm:text-sm"
            value={form.handle}
            onChange={(e) => set("handle", e.target.value)}
            placeholder={form.github || "handle"}
          />
        </div>
        <p className="mt-1 text-sm text-gh-muted">
          Shown under the tagline. Leave blank to use their GitHub username.
        </p>
        {errors.handle && (
          <p className="mt-1 text-sm text-red-500">{errors.handle}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="teamId">
          Team
        </label>
        <select
          id="teamId"
          className={inputClass}
          value={form.teamId}
          onChange={(e) => set("teamId", e.target.value)}
        >
          <option value="">No team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gh-muted">
          {teams.length === 0 ? (
            <>
              No teams yet.{" "}
              <a
                href="/admin/teams/new"
                className="text-gh-accent underline-offset-4 hover:underline"
              >
                Add one
              </a>
              ; members without a team are listed together.
            </>
          ) : (
            "Groups them on the members page and shows on their profile."
          )}
        </p>
        {errors.teamId && (
          <p className="mt-1 text-sm text-red-500">{errors.teamId}</p>
        )}
      </div>

      {/* Avatar and border together, with a live preview: the two are one
          picture on the site, and choosing a border without seeing it
          around the avatar is guessing. */}
      <fieldset className="rounded-lg border border-gh-border p-4">
        <legend className="px-1 text-sm font-medium text-gh-muted">
          Avatar and profile border
        </legend>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <MemberAvatar
              person={{
                name: form.name || "?",
                image_url: form.imageUrl,
                accent: form.accent,
              }}
              size={112}
              spin="always"
            />
            <span className="text-xs text-gh-muted">Preview</span>
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <ImageUploadField
              folder="members"
              label="Avatar"
              value={form.imageUrl}
              onChange={(url) => set("imageUrl", url)}
            />
            {errors.imageUrl && (
              <p className="-mt-2 text-sm text-red-500">{errors.imageUrl}</p>
            )}
            <p className="-mt-2 text-sm text-gh-muted">
              A generated avatar, not a photo: members asked not to show their
              faces. Send them the prompt in{" "}
              <code>docs/member-avatar-prompt.md</code>. Square, at least 512px.
              Without one, the site draws an identicon from their name.
            </p>
            <div>
              <label className={labelClass} htmlFor="accent">
                Profile border
              </label>
              {/* Known keys, not a colour picker: the border is stored as a
                  key so the page owns what each one renders as. A free hex
                  field would put a colour that belongs to no palette on the
                  site, permanently, the first time anybody used it. */}
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
        </div>
      </fieldset>

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
