import Link from "next/link"

/** Filter links over an admin list; plain links, so they work without JS. */
export function StatusTabs({
  base,
  active,
  tabs,
}: {
  base: string
  active: string
  tabs: { key: string; label: string; count: number }[]
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.key === "all" ? base : `${base}?status=${tab.key}`}
          className={`rounded-full border px-3 py-1 text-sm ${
            active === tab.key
              ? "border-gh-accent bg-gh-accent/10 text-gh-text"
              : "border-gh-border text-gh-muted hover:text-gh-text"
          }`}
        >
          {tab.label}{" "}
          <span className="tabular-nums text-gh-muted">{tab.count}</span>
        </Link>
      ))}
    </div>
  )
}

/** The private details a submission came with, for the admins' eyes only. */
export function SubmitterCard({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[]
}) {
  return (
    <aside className="h-fit rounded-lg border border-gh-border bg-gh-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gh-muted">
        Sent by (private)
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-gh-muted">{row.label}</dt>
            <dd className="mt-0.5 break-words text-gh-text">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-gh-border pt-4 text-xs leading-relaxed text-gh-muted">
        Never shown on the site. Registration number and phone are only here.
      </p>
    </aside>
  )
}
