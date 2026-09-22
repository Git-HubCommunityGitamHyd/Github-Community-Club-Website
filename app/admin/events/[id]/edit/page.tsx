import { notFound, redirect } from "next/navigation"
import { getEvent } from "@/lib/db"
import { getSessionCookie, verifySessionValue } from "@/lib/session"
import { EventForm } from "@/components/admin/event-form"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!verifySessionValue(await getSessionCookie())) redirect("/admin/login")

  const id = Number((await params).id)
  const event = Number.isNaN(id) ? null : await getEvent(id)
  if (!event) notFound()

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit event</h1>
        <EventForm initial={event} />
      </div>
    </main>
  )
}
