import { notFound } from "next/navigation"
import { getJourneyEntry } from "@/lib/db/journey"
import { JourneyForm } from "@/features/admin/journey-form"

export default async function EditJourneyEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  const entry = Number.isNaN(id) ? null : await getJourneyEntry(id)
  if (!entry) notFound()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Edit timeline entry</h1>
        <JourneyForm initial={entry} />
      </div>
    </main>
  )
}
