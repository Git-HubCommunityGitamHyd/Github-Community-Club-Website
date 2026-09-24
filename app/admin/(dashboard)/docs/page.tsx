import { DocsView } from "@/features/admin/docs/docs-view"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { findDoc } from "@/lib/docs/registry"

export default async function AdminDocsPage() {
  // As on every admin page: the layout's check alone does not stop this page
  // from rendering for a logged-out visitor.
  await requireAdminPage()
  return <DocsView doc={findDoc("")!} />
}
