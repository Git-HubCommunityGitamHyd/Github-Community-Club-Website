"use client"

import { useRef, useState } from "react"
import { FaRegCircleCheck } from "react-icons/fa6"
import {
  validateApplication,
  type ApplicationFormInput,
} from "@/lib/validation/application"
import { cn } from "@/lib/utils"

// text-base below sm: iOS Safari zooms the viewport on focus for anything
// under 16px.
const FIELD =
  "w-full rounded-xl border bg-white px-4 py-3 text-base text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gh-elevated dark:text-gh-text dark:placeholder:text-gh-muted sm:text-sm"
const FIELD_OK =
  "border-gray-300 focus:border-gh-accent-light focus:ring-gh-accent-light/30 dark:border-gh-border dark:focus:border-gh-accent dark:focus:ring-gh-accent/30"
const FIELD_BAD =
  "border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/70"
const LABEL =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gh-muted"

const EMPTY: ApplicationFormInput = {
  fullName: "",
  email: "",
  phone: "",
  branch: "",
  year: "",
  githubUsername: "",
  whyJoin: "",
}

const WHY_JOIN_LIMIT = 1000

function omit(errors: Record<string, string>, key: string) {
  const next = { ...errors }
  delete next[key]
  return next
}

export function V2JoinForm() {
  const [form, setForm] = useState<ApplicationFormInput>(EMPTY)
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function set<K extends keyof ApplicationFormInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear as soon as the field stops being wrong, rather than making the
    // person submit again to find out. Errors only ever appear after a blur or
    // a submit, so this never yells at someone mid-typing.
    if (errors[key]) {
      const next = validateApplication({ ...form, [key]: value })
      if (next.ok || !next.errors[key]) {
        setErrors((prev) => omit(prev, key))
      }
    }
  }

  // Validating one field by running the whole validator and reading one key
  // keeps lib/validation/application.ts the single source of truth — a second,
  // per-field copy of these rules is how the client and the server drift apart.
  function validateField(key: keyof ApplicationFormInput) {
    const result = validateApplication(form)
    const message = result.ok ? undefined : result.errors[key]
    setErrors((prev) =>
      message ? { ...prev, [key]: message } : omit(prev, key),
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setServerError(null)

    const result = validateApplication(form)
    if (!result.ok) {
      setErrors(result.errors)
      // Send focus to the first thing that is wrong, otherwise a long form just
      // appears to do nothing when the offending field is off-screen.
      const first = Object.keys(result.errors)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    setErrors({})
    setStatus("submitting")

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company }),
      })
      const body = await response.json().catch(() => ({}))

      if (response.ok) {
        setStatus("success")
        setForm(EMPTY)
        return
      }

      if (response.status === 409 || response.status === 400) {
        setErrors(body.errors ?? {})
      } else {
        setServerError("We couldn't send your application. Please try again.")
      }
      setStatus("idle")
    } catch {
      setServerError("We couldn't reach the server. Please try again.")
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 dark:border-gh-border dark:bg-gh-surface">
        <FaRegCircleCheck
          aria-hidden="true"
          className="h-10 w-10 text-gh-accent-light dark:text-gh-accent"
        />
        <h3 className="mt-6 text-2xl font-bold tracking-[-0.01em]">
          Your application is in
        </h3>
        <p className="mt-3 text-pretty leading-relaxed text-gray-600 dark:text-gh-muted">
          We read every one. Expect a reply on email within a week, and an
          invite to the next workshop either way.
        </p>
      </div>
    )
  }

  const fieldProps = (key: keyof ApplicationFormInput) => ({
    id: key,
    name: key,
    value: form[key],
    onBlur: () => validateField(key),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    className: cn(FIELD, errors[key] ? FIELD_BAD : FIELD_OK),
  })

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gh-border dark:bg-gh-surface sm:p-8"
    >
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
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="fullName">
            Full name
          </label>
          <input
            {...fieldProps("fullName")}
            autoComplete="name"
            onChange={(event) => set("fullName", event.target.value)}
          />
          <FieldError name="fullName" message={errors.fullName} />
        </div>

        <div>
          <label className={LABEL} htmlFor="email">
            Email
          </label>
          <input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            onChange={(event) => set("email", event.target.value)}
          />
          <FieldError name="email" message={errors.email} />
        </div>

        <div>
          <label className={LABEL} htmlFor="phone">
            Phone
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            autoComplete="tel"
            onChange={(event) => set("phone", event.target.value)}
          />
          <FieldError name="phone" message={errors.phone} />
        </div>

        <div>
          <label className={LABEL} htmlFor="branch">
            Branch
          </label>
          <input
            {...fieldProps("branch")}
            placeholder="e.g. CSE"
            onChange={(event) => set("branch", event.target.value)}
          />
          <FieldError name="branch" message={errors.branch} />
        </div>

        <div>
          <label className={LABEL} htmlFor="year">
            Year of study
          </label>
          <select
            {...fieldProps("year")}
            onChange={(event) => set("year", event.target.value)}
          >
            <option value="">Select</option>
            <option value="1">1st year</option>
            <option value="2">2nd year</option>
            <option value="3">3rd year</option>
            <option value="4">4th year</option>
          </select>
          <FieldError name="year" message={errors.year} />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="githubUsername">
            GitHub username{" "}
            <span className="font-normal text-gray-400 dark:text-gh-muted">
              — optional
            </span>
          </label>
          <input
            {...fieldProps("githubUsername")}
            placeholder="octocat"
            autoComplete="off"
            onChange={(event) => set("githubUsername", event.target.value)}
          />
          <FieldError name="githubUsername" message={errors.githubUsername} />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <label className={LABEL} htmlFor="whyJoin">
              Why do you want to join?
            </label>
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                form.whyJoin.length > WHY_JOIN_LIMIT
                  ? "text-red-500"
                  : "text-gray-400 dark:text-gh-muted",
              )}
            >
              {form.whyJoin.length}/{WHY_JOIN_LIMIT}
            </span>
          </div>
          <textarea
            {...fieldProps("whyJoin")}
            rows={4}
            placeholder="A sentence or two is plenty."
            onChange={(event) => set("whyJoin", event.target.value)}
          />
          <FieldError name="whyJoin" message={errors.whyJoin} />
        </div>
      </div>

      {serverError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 w-full rounded-full bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gh-accent dark:text-gh-deep dark:hover:bg-[#56d364] dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-surface"
      >
        {status === "submitting" ? "Sending…" : "Send application"}
      </button>

      <p className="mt-4 text-center text-xs text-gray-500 dark:text-gh-muted">
        We only use this to get back to you about the club.
      </p>
    </form>
  )
}

function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null
  return (
    <p
      id={`${name}-error`}
      role="alert"
      className="mt-1.5 text-sm text-red-600 dark:text-red-400"
    >
      {message}
    </p>
  )
}
