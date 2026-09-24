"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Build } from "@/lib/db/builds"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import {
  BUILD_IMAGES_MAX,
  BUILD_STATUSES,
  BUILD_STATUS_KEYS,
  weekLabel,
} from "@/features/v2/builds/keys"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"
const labelClass = "mb-1 block text-sm font-medium text-gh-muted"
const iconButton =
  "flex size-7 items-center justify-center rounded-md border border-gh-border bg-gh-bg/80 text-gh-muted transition hover:text-gh-text disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"

type FormState = {
  title: string
  tagline: string
  description: string
  builtWith: string
  liveUrl: string
  repoUrl: string
  images: string[]
  name: string
  teammates: string
  status: string
  month: string
  weekOf: string
  sortOrder: string
  adminNote: string
}

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
  const [form, setForm] = useState<FormState>({
    title: build.title,
    tagline: build.tagline,
    description: build.description,
    builtWith: build.built_with,
    liveUrl: build.live_url ?? "",
    repoUrl: build.repo_url ?? "",
    images: build.images,
    name: build.name,
    teammates: build.teammates,
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

  function moveImage(index: number, by: number) {
    const next = [...form.images]
    const [src] = next.splice(index, 1)
    next.splice(index + by, 0, src)
    set("images", next)
  }

  async function save(overrides: Partial<FormState> = {}) {
    setServerError(null)
    setSubmitting(true)
    const payload = { ...form, ...overrides }
    // Declining clears the week, which only accepted builds can have.
    if (payload.status !== "accepted") payload.weekOf = ""
    try {
      const res = await fetch(`/api/admin/builds/${build.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push("/admin/builds")
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
      className="space-y-6"
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

      <fieldset className="grid gap-5 rounded-lg border border-gh-border p-5 sm:grid-cols-2">
        <legend className="px-2 text-sm font-semibold">Showcase</legend>
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
      </fieldset>

      <div>
        <p className={labelClass}>
          Images ({form.images.length}/{BUILD_IMAGES_MAX}). The first is the
          cover.
        </p>
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
                  onClick={() => moveImage(i, -1)}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Move later"
                  disabled={i === form.images.length - 1}
                  onClick={() => moveImage(i, 1)}
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
          <div className="mt-3">
            <ImageUploadField
              label="Add an image"
              value={null}
              onChange={(url) => url && set("images", [...form.images, url])}
            />
          </div>
        )}
        {error("images")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="title">
            Title
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
          {error("tagline")}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          About it
        </label>
        <textarea
          id="description"
          rows={7}
          maxLength={1500}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {error("description")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="liveUrl">
            Live link
          </label>
          <input
            id="liveUrl"
            className={inputClass}
            value={form.liveUrl}
            onChange={(e) => set("liveUrl", e.target.value)}
          />
          {error("liveUrl")}
        </div>
        <div>
          <label className={labelClass} htmlFor="repoUrl">
            Code
          </label>
          <input
            id="repoUrl"
            className={inputClass}
            value={form.repoUrl}
            onChange={(e) => set("repoUrl", e.target.value)}
          />
          {error("repoUrl")}
        </div>
        <div>
          <label className={labelClass} htmlFor="builtWith">
            Built with (comma separated)
          </label>
          <input
            id="builtWith"
            maxLength={200}
            className={inputClass}
            value={form.builtWith}
            onChange={(e) => set("builtWith", e.target.value)}
          />
          {error("builtWith")}
        </div>
        <div>
          <label className={labelClass} htmlFor="name">
            Credited to
          </label>
          <input
            id="name"
            maxLength={80}
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          {error("name")}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="teammates">
            Teammates (comma separated)
          </label>
          <input
            id="teammates"
            maxLength={200}
            className={inputClass}
            value={form.teammates}
            onChange={(e) => set("teammates", e.target.value)}
          />
          {error("teammates")}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="adminNote">
          Admin note
        </label>
        <textarea
          id="adminNote"
          rows={3}
          maxLength={1000}
          className={inputClass}
          value={form.adminNote}
          onChange={(e) => set("adminNote", e.target.value)}
          placeholder="Private."
        />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/builds")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
