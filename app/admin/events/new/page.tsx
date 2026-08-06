import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { COOKIE_NAME, verifySessionValue } from "@/lib/session"
import { EventForm } from "@/components/admin/event-form"

export default async function NewEventPage() {
  const session = cookies().get(COOKIE_NAME)?.value
  if (!verifySessionValue(session)) redirect("/admin/login")

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-gh-bg dark:text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Add event</h1>
        <EventForm />
      </div>
    </main>
  )
}
