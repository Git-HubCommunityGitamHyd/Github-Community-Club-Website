import { STATS } from "@/features/home/content"

export function StatsSection() {
  return (
    // Tinted band, like journey/events. Without it this strip and the
    // about section below ran together as one undifferentiated block and
    // broke the plain/tinted alternation the rest of the page keeps.
    // border-b only — the marquee directly above already closes with its
    // own border, and border-y here would stack two hairlines.
    <section className="border-b border-gh-border bg-gh-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l border-gh-border pl-4">
              <div className="font-mono text-[clamp(28px,4vw,44px)] font-bold tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-gh-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
