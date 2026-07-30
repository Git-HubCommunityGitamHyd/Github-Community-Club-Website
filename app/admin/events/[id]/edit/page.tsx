import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getEvent } from "@/lib/db"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"
import { EventForm } from "@/components/admin/event-form"

export default async function EditEventPage({
  params,
}: {
  params: { id: string }
}) {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) redirect("/admin/login")

  const id = Number(params.id)
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
