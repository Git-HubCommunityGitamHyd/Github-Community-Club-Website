import { STATS } from "@/features/home/content"

export function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border-l border-gray-200 pl-4 dark:border-gh-border"
          >
            <div className="font-mono text-[clamp(28px,4vw,44px)] font-bold tracking-tight">
              {stat.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gh-muted">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
