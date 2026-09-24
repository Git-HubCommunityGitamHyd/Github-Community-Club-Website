import { JourneyForm } from "@/features/admin/journey-form"

export default async function NewJourneyEntryPage() {
  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold">Add timeline entry</h1>
        <JourneyForm />
      </div>
    </main>
  )
}
