"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  validateApplication,
  type ApplicationFormInput,
} from "@/lib/validation/application"

// text-base below sm: iOS Safari zooms the viewport on focus for anything under 16px
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gh-border dark:bg-gh-elevated dark:text-gh-text dark:placeholder:text-gh-muted dark:focus:border-gh-accent dark:focus:ring-gh-accent"

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gh-muted"

const EMPTY: ApplicationFormInput = {
  fullName: "",
  email: "",
  phone: "",
  branch: "",
  year: "",
  githubUsername: "",
  whyJoin: "",
}

export function JoinForm() {
  const [form, setForm] = useState<ApplicationFormInput>(EMPTY)
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  )
  const [serverError, setServerError] = useState<string | null>(null)

  function set<K extends keyof ApplicationFormInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const result = validateApplication(form)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setStatus("submitting")

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company }),
      })
      const body = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus("success")
        setForm(EMPTY)
        return
      }

      if (res.status === 409 || res.status === 400) {
        setErrors(body.errors ?? {})
      } else {
        setServerError("Something went wrong. Please try again.")
      }
      setStatus("idle")
    } catch {
      setServerError("Something went wrong. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <Card className="mx-auto max-w-2xl border-gray-200 bg-white dark:border-gh-border dark:bg-gh-surface">
        <CardContent className="p-8 text-center">
          <h3 className="mb-2 text-2xl font-semibold">Application received!</h3>
          <p className="text-gray-600 dark:text-gh-muted">
            Thanks for applying — we&apos;ll be in touch soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-2xl border-gray-200 bg-white dark:border-gh-border dark:bg-gh-surface">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Honeypot — hidden from real users, bots fill every field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className={inputClass}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

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
            <label className={labelClass} htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="branch">
                Branch
              </label>
              <input
                id="branch"
                className={inputClass}
                placeholder="e.g. CSE"
                value={form.branch}
                onChange={(e) => set("branch", e.target.value)}
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-red-500">{errors.branch}</p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="year">
                Year of study
              </label>
              <select
                id="year"
                className={inputClass}
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              >
                <option value="">Select</option>
                <option value="1">1st year</option>
                <option value="2">2nd year</option>
                <option value="3">3rd year</option>
                <option value="4">4th year</option>
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-500">{errors.year}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="githubUsername">
              GitHub username (optional)
            </label>
            <input
              id="githubUsername"
              className={inputClass}
              value={form.githubUsername}
              onChange={(e) => set("githubUsername", e.target.value)}
            />
            {errors.githubUsername && (
              <p className="mt-1 text-sm text-red-500">
                {errors.githubUsername}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="whyJoin">
              Why do you want to join?
            </label>
            <textarea
              id="whyJoin"
              rows={4}
              className={inputClass}
              value={form.whyJoin}
              onChange={(e) => set("whyJoin", e.target.value)}
            />
            {errors.whyJoin && (
              <p className="mt-1 text-sm text-red-500">{errors.whyJoin}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Submitting..." : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
