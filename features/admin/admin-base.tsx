"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { toPublicAdminUrl } from "@/lib/auth/admin-url"

const AdminBaseContext = createContext<string | null>(null)

/**
 * Hands the secret admin segment to client components. Rendered by
 * app/admin/layout.tsx, so the value only reaches pages served from the
 * secret path (the login page and the dashboard), never the public site or
 * the honeypot.
 */
export function AdminBaseProvider({
  base,
  children,
}: {
  base: string
  children: ReactNode
}) {
  return <AdminBaseContext value={base}>{children}</AdminBaseContext>
}

/** `url("/admin/board")` is the public URL of that route. */
export function useAdminUrl() {
  const base = useContext(AdminBaseContext)
  if (!base) throw new Error("useAdminUrl outside <AdminBaseProvider>")
  return useCallback(
    (internal: string) => toPublicAdminUrl(base, internal),
    [base],
  )
}
