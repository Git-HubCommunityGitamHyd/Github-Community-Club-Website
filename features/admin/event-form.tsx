"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/features/admin/image-upload-field"
import type { Event } from "@/lib/db/events"
import { EVENT_CATEGORIES } from "@/features/events/categories"
import { EVENT_IMAGES_MAX } from "@/lib/validation/event"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

type FormState = {
  title: string
  eventDate: string
  location: string
  attendees: string
  category: string
  duration: string
  description: string
  images: string[]
  sortOrder: string
}

function toFormState(event?: Event): FormState {
  return {
    title: event?.title ?? "",
    eventDate: event?.event_date ?? "",
    location: event?.location ?? "",
    attendees: event?.attendees != null ? String(event.attendees) : "",
    category: event?.category ?? "",
    duration: event?.duration ?? "",
    description: event?.description ?? "",
    images: event?.images ?? [],
    sortOrder: event ? String(event.sort_order) : "0",
  }
}

// Formats native <input type="date"> values (YYYY-MM-DD) into the display
// strings this app already uses everywhere, e.g. "October 20–26, 2024".
function formatEventDate(start: string, end: string): string {
  if (!start) return ""
  const startDate = new Date(`${start}T00:00:00`)
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  if (!end || end === start) return startLabel

  const endDate = new Date(`${end}T00:00:00`)
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  if (sameMonth) {
    const month = startDate.toLocaleDateString("en-US", { month: "long" })
    return `${month} ${startDate.getDate()}–${endDate.getDate()}, ${startDate.getFullYear()}`
  }
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  return `${startLabel} – ${endLabel}`
}

export function EventForm({ initial }: { initial?: Event }) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>(toFormState(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function moveImage(from: number, to: number) {
    setForm((prev) => {
      const images = [...prev.images]
      const [moved] = images.splice(from, 1)
      images.splice(to, 0, moved)
      return { ...prev, images }
    })
  }

  function setDates(start: string, end: string) {
    setStartDate(start)
    setEndDate(end)
    set("eventDate", formatEventDate(start, end))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setSubmitting(true)

    const url = initial
      ? adminHref(`/api/admin/events/${initial.id}`)
      : adminHref("/api/admin/events")
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push(adminHref("/admin/events"))
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
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="startDate">
            Date
          </label>
          <div className="flex items-center gap-2">
            <input
              id="startDate"
              type="date"
              className={inputClass}
              value={startDate}
              onChange={(e) => setDates(e.target.value, endDate)}
            />
            <span className="text-sm text-gh-muted">to</span>
            <input
              id="endDate"
              type="date"
              className={inputClass}
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setDates(startDate, e.target.value)}
            />
          </div>
          <p className="mt-1 text-sm text-gh-muted">
            {form.eventDate || "Leave end date blank for a single-day event"}
          </p>
          {errors.eventDate && (
            <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className={inputClass}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          {/* A dropdown rather than free text, because the public card picks
              its glyph from this value (features/events/categories.ts) and a
              typo would silently fall back to the generic calendar. A category
              a row already has is kept as an option so editing an older event
              never rewrites it. */}
          <select
            id="category"
            className={inputClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select a category</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            {form.category &&
              !EVENT_CATEGORIES.includes(
                form.category as (typeof EVENT_CATEGORIES)[number],
              ) && <option value={form.category}>{form.category}</option>}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="attendees">
            Attendees
          </label>
          <input
            id="attendees"
            type="number"
            className={inputClass}
            value={form.attendees}
            onChange={(e) => set("attendees", e.target.value)}
          />
          {errors.attendees && (
            <p className="mt-1 text-sm text-red-500">{errors.attendees}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="duration">
            Duration
          </label>
          <input
            id="duration"
            className={inputClass}
            placeholder="e.g. 2 hours"
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </div>
      </div>

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

      {/* The first photo is the cover (the card image and the top of the
          popup); the rest are the gallery, in this order. */}
      <fieldset className="rounded-lg border border-gh-border p-4">
        <legend className="px-1 text-sm font-medium text-gh-muted">
          Photos{" "}
          <span className="font-normal">
            ({form.images.length}/{EVENT_IMAGES_MAX})
          </span>
        </legend>
        {form.images.length > 0 ? (
          <ol className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.images.map((url, i) => (
              <li key={url} className="space-y-1.5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-gh-border bg-gh-elevated">
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-gh-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-gh-deep">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <IconButton
                      label="Move earlier"
                      disabled={i === 0}
                      onClick={() => moveImage(i, i - 1)}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label="Move later"
                      disabled={i === form.images.length - 1}
                      onClick={() => moveImage(i, i + 1)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                  <div className="flex gap-1">
                    {i !== 0 && (
                      <IconButton
                        label="Make cover"
                        onClick={() => moveImage(i, 0)}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </IconButton>
                    )}
                    <IconButton
                      label="Remove photo"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mb-4 text-sm text-gh-muted">
            No photos yet. Without one, the card shows the category glyph.
          </p>
        )}
        {form.images.length < EVENT_IMAGES_MAX && (
          <ImageUploadField
            folder="events"
            label="Add photos"
            value={null}
            multiple
            onChange={(url) => {
              if (!url) return
              setForm((prev) =>
                prev.images.length >= EVENT_IMAGES_MAX
                  ? prev
                  : { ...prev, images: [...prev.images, url] },
              )
            }}
            hint="Landscape works best. The first photo is the cover."
          />
        )}
        {errors.images && (
          <p className="mt-2 text-sm text-red-500">{errors.images}</p>
        )}
      </fieldset>

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

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(adminHref("/admin/events"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded border border-gh-border text-gh-muted transition-colors hover:border-gh-muted hover:text-gh-text disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}
