import Link from "next/link"
import Image from "next/image"
import { listEvents } from "@/lib/db/events"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { adminUrl } from "@/lib/auth/admin-path"

export default async function AdminEventsPage() {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const events = await listEvents()
  const withoutPhotos = events.filter(
    (event) => event.images.length === 0,
  ).length

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/events" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Events <span className="text-gh-muted">({events.length})</span>
          </h1>
          <Link href={adminUrl("/admin/events/new")}>
            <Button>Add event</Button>
          </Link>
        </div>

        {withoutPhotos > 0 && (
          <p className="mb-4 rounded-md border border-gh-border bg-gh-surface px-4 py-3 text-sm text-gh-muted">
            {withoutPhotos === 1
              ? "1 event has no photos yet"
              : `${withoutPhotos} events have no photos yet`}
            . Their cards show the category glyph until one is uploaded.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="w-24 px-4 py-3 font-medium">Photos</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-gh-border">
                  <td className="px-4 py-2">
                    {event.images[0] ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src={event.images[0]}
                          alt=""
                          width={48}
                          height={36}
                          className="h-9 w-12 rounded-md object-cover"
                        />
                        <span className="text-xs text-gh-muted">
                          {event.images.length}
                        </span>
                      </div>
                    ) : (
                      <span className="flex h-9 w-12 items-center justify-center rounded-md border border-dashed border-gh-border text-[10px] text-gh-muted">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3">{event.event_date}</td>
                  <td className="px-4 py-3">{event.category}</td>
                  <td className="px-4 py-3">{event.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={adminUrl(`/admin/events/${event.id}/edit`)}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteButton
                        url={adminUrl(`/api/admin/events/${event.id}`)}
                        confirmMessage={`Delete ${event.title}?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gh-muted"
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
