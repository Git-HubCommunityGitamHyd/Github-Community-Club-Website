import Image from "next/image"
import Link from "next/link"
import { listBuilds } from "@/lib/db/builds"
import {
  BUILD_STATUSES,
  BUILD_STATUS_KEYS,
  mondayOf,
  monthLabel,
  weekLabel,
} from "@/features/builds/keys"
import { studentYear } from "@/features/forms/student"
import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/features/admin/delete-button"
import { AdminNav } from "@/features/admin/admin-nav"
import { StatusTabs } from "@/features/admin/status-tabs"
import { requireAdminPage } from "@/lib/auth/require-admin"
import { adminUrl } from "@/lib/auth/admin-path"

export default async function AdminBuildsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  // Here as well as in the layout: Next renders a layout and its page in
  // parallel, so the layout's redirect alone does not stop this page from
  // reading the database and streaming the result to a logged-out visitor.
  await requireAdminPage()

  const { status = "all" } = await searchParams
  const all = await listBuilds()
  const builds = status === "all" ? all : all.filter((b) => b.status === status)
  const thisWeek = mondayOf(new Date())

  return (
    <main className="min-h-screen bg-gh-bg px-4 py-10 text-gh-text">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="/admin/builds" />
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Builds <span className="text-gh-muted">({all.length})</span>
          </h1>
          <Link href="/builds" target="_blank">
            <Button variant="outline">Public page</Button>
          </Link>
        </div>
        <p className="mb-6 max-w-2xl text-sm text-gh-muted">
          Builds sent through /builds/submit. Accepting one puts it in a
          month&apos;s showcase on /builds. Giving it a week as well makes it
          one of that week&apos;s picks; the page leads with the latest week
          that has any.
        </p>

        <StatusTabs
          base={adminUrl("/admin/builds")}
          active={status}
          tabs={[
            { key: "all", label: "All", count: all.length },
            ...BUILD_STATUS_KEYS.map((key) => ({
              key,
              label: BUILD_STATUSES[key],
              count: all.filter((b) => b.status === key).length,
            })),
          ]}
        />

        <div className="overflow-x-auto rounded-lg border border-gh-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gh-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Build</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Week</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build) => (
                <tr
                  key={build.id}
                  className="border-t border-gh-border align-top"
                >
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {build.images[0] && (
                        <Image
                          src={build.images[0]}
                          alt=""
                          width={72}
                          height={54}
                          className="h-[54px] w-[72px] shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{build.title}</p>
                        <p className="line-clamp-1 text-gh-muted">
                          {build.tagline}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {build.name}
                    <p className="text-gh-muted">
                      {studentYear(build.year)}, {build.branch}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        build.status === "pending"
                          ? "border-gh-accent text-gh-accent"
                          : "border-gh-border text-gh-muted"
                      }`}
                    >
                      {BUILD_STATUSES[build.status] ?? build.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gh-muted">
                    {build.month ? monthLabel(build.month) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gh-muted">
                    {build.week_of
                      ? build.week_of === thisWeek
                        ? "This week"
                        : weekLabel(build.week_of)
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={adminUrl(`/admin/builds/${build.id}`)}>
                        <Button variant="outline" size="sm">
                          {build.status === "pending" ? "Review" : "Edit"}
                        </Button>
                      </Link>
                      <DeleteButton
                        url={adminUrl(`/api/admin/builds/${build.id}`)}
                        confirmMessage={`Delete "${build.title}" for good? Declining keeps a record; deleting does not.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {builds.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gh-muted"
                  >
                    Nothing here.
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
