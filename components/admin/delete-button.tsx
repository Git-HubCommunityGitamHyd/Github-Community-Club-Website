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

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return
    setBusy(true)
    await fetch(url, { method: "DELETE" })
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={handleDelete}
    >
      {busy ? "Deleting…" : "Delete"}
    </Button>
  )
}
