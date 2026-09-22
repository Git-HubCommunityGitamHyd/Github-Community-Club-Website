function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className ?? ""}`} />
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gh-border dark:bg-gh-surface">
      <SkeletonBlock className="h-20 w-20 rounded-full" />
      <SkeletonBlock className="h-5 w-32" />
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-2 h-3 w-16" />
    </div>
  )
}

function SkeletonEventCard() {
  return (
    <div className="flex h-80 flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gh-border dark:bg-gh-surface">
      <SkeletonBlock className="h-16 w-16 rounded-full" />
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-auto h-6 w-24 rounded-full" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gh-bg dark:text-gh-text">
      {/* Nav skeleton */}
      <div className="fixed top-0 z-40 flex h-16 w-full items-center border-b border-gray-200 bg-white/90 px-8 dark:border-gh-border dark:bg-gh-surface/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <SkeletonBlock className="h-5 w-48" />
          </div>
          <div className="hidden gap-8 md:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-16" />
            ))}
          </div>
          <SkeletonBlock className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Hero skeleton */}
      <section className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4">
          <SkeletonBlock className="h-24 w-24 rounded-full" />
          <SkeletonBlock className="h-14 w-72 md:w-96" />
          <SkeletonBlock className="h-10 w-48 md:w-64" />
          <SkeletonBlock className="mt-2 h-6 w-80 md:w-full" />
          <SkeletonBlock className="h-5 w-64" />
          <div className="mt-4 flex gap-4">
            <SkeletonBlock className="h-12 w-36 rounded-xl" />
            <SkeletonBlock className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </section>

      {/* About skeleton */}
      <section className="bg-gray-50 py-20 dark:bg-gh-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center gap-4">
            <SkeletonBlock className="h-10 w-64" />
            <SkeletonBlock className="h-5 w-96" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gh-border dark:bg-gh-surface"
              >
                <SkeletonBlock className="h-12 w-12 rounded-xl" />
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board skeleton */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center gap-4">
            <SkeletonBlock className="h-10 w-56" />
            <SkeletonBlock className="h-5 w-72" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Events skeleton */}
      <section className="bg-gray-50 py-20 dark:bg-gh-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center gap-4">
            <SkeletonBlock className="h-10 w-72" />
            <SkeletonBlock className="h-5 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonEventCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
