import Link from "next/link"
import { listEvents } from "@/lib/db/events"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"

export default async function AdminEventsPage() {
  const events = await listEvents()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/events" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Events{" "}
            <span className="text-gray-400 dark:text-gh-muted">
              ({events.length})
            </span>
          </h1>
          <Link href="/admin/events/new">
            <Button>Add event</Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-t border-gray-200 dark:border-gh-border"
                >
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3">{event.event_date}</td>
                  <td className="px-4 py-3">{event.category}</td>
                  <td className="px-4 py-3">{event.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={`/api/admin/events/${event.id}`}
                        confirmMessage={`Delete ${event.title}?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gh-muted"
                  >
                    No events yet.
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
