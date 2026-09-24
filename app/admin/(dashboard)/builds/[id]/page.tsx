import Link from "next/link"
import { notFound } from "next/navigation"
import { getBuild } from "@/lib/db/builds"
import { studentYear } from "@/features/v2/forms/student"
import { mondayOf, monthOf } from "@/features/v2/builds/keys"
import { BuildReviewForm } from "@/features/admin/build-review-form"
import { SubmitterCard } from "@/features/admin/status-tabs"
import { requireAdminPage } from "@/lib/auth/require-admin"

export default async function ReviewBuildPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const id = Number((await params).id)
  const build = Number.isNaN(id) ? null : await getBuild(id)
  if (!build) notFound()

  const now = new Date()

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/builds"
          className="text-sm text-gh-muted hover:text-gh-text"
        >
          Back to builds
        </Link>
        <h1 className="mb-1 mt-3 text-2xl font-semibold">{build.title}</h1>
        <p className="mb-8 text-sm text-gh-muted">
          Received{" "}
          {new Date(build.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <BuildReviewForm
            build={build}
            thisMonth={monthOf(now)}
            thisWeek={mondayOf(now)}
          />
          <SubmitterCard
            rows={[
              { label: "Name", value: build.name },
              {
                label: "Year and branch",
                value: `${studentYear(build.year)}, ${build.branch}`,
              },
              { label: "Registration no.", value: build.reg_no },
              {
                label: "Phone",
                value: (
                  <a
                    href={`tel:${build.phone}`}
                    className="text-gh-accent hover:underline"
                  >
                    {build.phone}
                  </a>
                ),
              },
            ]}
          />
        </div>
      </div>
    </main>
  )
}
