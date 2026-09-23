import Link from "next/link"
import { listJourneyEntries } from "@/lib/db/journey"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { JOURNEY_ICONS } from "@/features/v2/journey/icons"

export default async function AdminJourneyPage() {
  const entries = await listJourneyEntries()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/journey" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Journey{" "}
            <span className="text-gray-400 dark:text-gh-muted">
              ({entries.length})
            </span>
          </h1>
          <Link href="/admin/journey/new">
            <Button>Add entry</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const glyph =
                  JOURNEY_ICONS[entry.icon as keyof typeof JOURNEY_ICONS]
                const Icon = (glyph ?? JOURNEY_ICONS.commit).icon
                return (
                  <tr
                    key={entry.id}
                    className="border-t border-gray-200 dark:border-gh-border"
                  >
                    <td className="px-4 py-3">{entry.title}</td>
                    <td className="px-4 py-3">{entry.entry_date}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        <span className="text-gray-500 dark:text-gh-muted">
                          {entry.icon}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">{entry.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/journey/${entry.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <DeleteButton
                          url={`/api/admin/journey/${entry.id}`}
                          confirmMessage={`Delete ${entry.title}?`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gh-muted"
                  >
                    No timeline entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
