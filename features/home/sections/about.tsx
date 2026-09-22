import { PILLARS } from "@/features/home/content"

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <span className="font-mono text-[13px] font-bold text-black dark:text-gh-accent">
        01 — ABOUT
      </span>
      <h2 className="mb-5 mt-4 max-w-3xl text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-tight tracking-tight">
        A community of builders, designers, and open-source contributors.
      </h2>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gh-muted">
        We are a vibrant community of developers, designers, and tech
        enthusiasts at GITAM University, dedicated to promoting open source
        culture and collaborative development.
      </p>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-gh-border dark:bg-gh-border sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="bg-white p-7 dark:bg-gh-bg">
            <div className="mb-3 font-mono text-lg font-bold text-black dark:text-gh-accent">
              {pillar.code}
            </div>
            <div className="mb-2 text-lg font-bold">{pillar.title}</div>
            <div className="text-sm leading-relaxed text-gray-600 dark:text-gh-muted">
              {pillar.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
