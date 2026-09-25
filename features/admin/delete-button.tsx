"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function DeleteButton({
  url,
  confirmMessage,
}: {
  url: string
  confirmMessage: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(url, { method: "DELETE" })
      if (!response.ok) {
        setError(
          response.status === 401
            ? "Your session expired. Sign in again to delete."
            : "Could not delete. Try again.",
        )
        return
      }
      router.refresh()
    } catch {
      setError("Could not connect. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={handleDelete}
      >
        {busy ? "Deleting…" : "Delete"}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </span>
  )
}
