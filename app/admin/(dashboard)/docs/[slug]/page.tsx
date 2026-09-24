import { notFound } from "next/navigation"
import { DocsView } from "@/features/admin/docs/docs-view"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { findDoc } from "@/lib/docs/registry"

export default async function AdminDocPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await requireAdminPage()
  const { slug } = await params
  const doc = slug ? findDoc(slug) : undefined
  if (!doc) notFound()
  return <DocsView doc={doc} />
}
