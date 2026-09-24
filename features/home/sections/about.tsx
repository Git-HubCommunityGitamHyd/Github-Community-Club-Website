import { PILLARS } from "@/features/home/content"

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <span className="font-mono text-[13px] font-bold text-gh-accent">
        01 / ABOUT
      </span>
      <h2 className="mb-5 mt-4 max-w-3xl text-balance text-[clamp(32px,4.5vw,56px)] font-extrabold leading-tight tracking-tight">
        A community of builders, designers, and open-source contributors.
      </h2>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gh-muted">
        We are a vibrant community of developers, designers, and tech
        enthusiasts at GITAM University, dedicated to promoting open source
        culture and collaborative development.
      </p>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-gh-border bg-gh-border sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="bg-gh-bg p-7">
            <div className="mb-3 font-mono text-lg font-bold text-gh-accent">
              {pillar.code}
            </div>
            <div className="mb-2 text-lg font-bold">{pillar.title}</div>
            <div className="text-sm leading-relaxed text-gh-muted">
              {pillar.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
