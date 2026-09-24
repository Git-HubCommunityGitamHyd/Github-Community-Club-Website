import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { AdminBaseProvider } from "@/features/admin/admin-base"
import { adminBase } from "@/lib/auth/admin-path"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  // proxy.ts only lets a request in here through the secret path, so an
  // unset ADMIN_PATH means nothing should be reachable. Belt and braces.
  const base = adminBase()
  if (!base) notFound()
  return <AdminBaseProvider base={base}>{children}</AdminBaseProvider>
}
