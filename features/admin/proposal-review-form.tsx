"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Proposal } from "@/lib/db/proposals"
import {
  PROPOSAL_AUDIENCES,
  PROPOSAL_FORMATS,
  PROPOSAL_STATUS_KEYS,
  proposalStatus,
} from "@/features/proposals/keys"
import { useAdminUrl } from "@/features/admin/admin-base"

const inputClass =
  "w-full rounded-md border border-gh-border bg-gh-elevated px-3 py-2 text-base sm:text-sm text-gh-text placeholder:text-gh-muted focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"
const labelClass = "mb-1 block text-sm font-medium text-gh-muted"

type FormState = {
  title: string
  idea: string
  audience: string
  format: string
  publicName: string
  status: string
  adminNote: string
}

/**
 * Accepting a proposal is choosing a public status. Everything a visitor would
 * see is editable here (to fix a typo or trim a name before it goes up); who
 * sent it is not, and sits beside the form instead.
 */
export function ProposalReviewForm({ proposal }: { proposal: Proposal }) {
  const router = useRouter()
  const adminHref = useAdminUrl()
  const [form, setForm] = useState<FormState>({
    title: proposal.title,
    idea: proposal.idea,
    audience: proposal.audience,
    format: proposal.format,
    publicName: proposal.public_name,
    status: proposal.status,
    adminNote: proposal.admin_note,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(overrides: Partial<FormState> = {}) {
    setServerError(null)
    setSubmitting(true)
    try {
      const res = await fetch(
        adminHref(`/api/admin/proposals/${proposal.id}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, ...overrides }),
        },
      )
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        router.push(adminHref("/admin/proposals"))
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

  const willBePublic = proposalStatus(form.status).public

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className="space-y-5"
    >
      {proposal.status === "pending" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gh-accent/40 bg-gh-accent/5 p-4">
          <p className="mr-auto text-sm">Not reviewed yet.</p>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => save({ status: "accepted" })}
          >
            Accept and publish
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
          {PROPOSAL_STATUS_KEYS.map((key) => (
            <option key={key} value={key}>
              {proposalStatus(key).label}
              {proposalStatus(key).public ? " (public)" : " (private)"}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gh-muted">
          {willBePublic
            ? "Listed on /proposals with the title, idea and public name below."
            : "Not shown anywhere on the site."}
        </p>
        {errors.status && (
          <p className="mt-1 text-sm text-red-500">{errors.status}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          maxLength={80}
          className={inputClass}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="idea">
          Idea
        </label>
        <textarea
          id="idea"
          rows={7}
          maxLength={1000}
          className={inputClass}
          value={form.idea}
          onChange={(e) => set("idea", e.target.value)}
        />
        {errors.idea && (
          <p className="mt-1 text-sm text-red-500">{errors.idea}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="audience">
            For
          </label>
          <select
            id="audience"
            className={inputClass}
            value={form.audience}
            onChange={(e) => set("audience", e.target.value)}
          >
            {Object.entries(PROPOSAL_AUDIENCES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="format">
            How
          </label>
          <select
            id="format"
            className={inputClass}
            value={form.format}
            onChange={(e) => set("format", e.target.value)}
          >
            {Object.entries(PROPOSAL_FORMATS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="publicName">
          Public name
        </label>
        <input
          id="publicName"
          maxLength={40}
          className={inputClass}
          value={form.publicName}
          onChange={(e) => set("publicName", e.target.value)}
        />
        <p className="mt-1 text-sm text-gh-muted">
          Shown as &ldquo;proposed by&rdquo;. Their first name by default, as
          the form promised them.
        </p>
        {errors.publicName && (
          <p className="mt-1 text-sm text-red-500">{errors.publicName}</p>
        )}
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
          placeholder="Private. Who's following up, why it was declined..."
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
          onClick={() => router.push(adminHref("/admin/proposals"))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
