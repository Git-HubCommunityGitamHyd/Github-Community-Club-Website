"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import type { Event } from "@/lib/db"

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text dark:placeholder:text-gh-muted dark:focus:border-gh-accent dark:focus:ring-gh-accent"

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gh-muted"

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
  const [form, setForm] = useState<FormState>(toFormState(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
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
      ? `/api/admin/events/${initial.id}`
      : "/api/admin/events"
    const method = initial ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push("/admin/events")
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
            <span className="text-sm text-gray-400 dark:text-gh-muted">to</span>
            <input
              id="endDate"
              type="date"
              className={inputClass}
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setDates(startDate, e.target.value)}
            />
          </div>
          <p className="mt-1 text-sm text-gray-400 dark:text-gh-muted">
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
          <input
            id="category"
            className={inputClass}
            placeholder="e.g. Workshop"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
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

      <div>
        <span className={labelClass}>Photos</span>
        {form.images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {form.images.map((url, i) => (
              <div key={url} className="relative">
                <Image
                  src={url}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "images",
                      form.images.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white"
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <ImageUploadField
          label="Add a photo"
          value={null}
          onChange={(url) => {
            if (url) set("images", [...form.images, url])
          }}
        />
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

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save changes" : "Add event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
