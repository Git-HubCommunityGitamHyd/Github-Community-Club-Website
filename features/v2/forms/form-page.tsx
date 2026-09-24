import type { ReactNode } from "react"
import { ProjectsPageChrome } from "@/features/v2/projects/page-chrome"
import { ProjectsBackLink } from "@/features/v2/projects/back-link"
import { MascotSlot } from "@/features/v2/mascot/mascot-slot"
import { SectionTexture } from "@/components/ui/texture"

/**
 * The page around a stepper form: the form, and beside it the octocat and the
 * three things that happen after you press send. That rail is there because
 * the honest answer to "what happens to this?" is the most useful thing to
 * tell someone about to hand over their phone number.
 *
 * There is no heading above the form. There was one ("Propose a project",
 * then a lede) and the form's intro screen said the same thing again right
 * under it, which cost a screen of height and put the Start button below the
 * fold at 900px. The intro is the page's h1 now, and the mascot's slot moved
 * from the header into the rail, into space that was empty anyway.
 */
export function FormPage({
  back,
  after,
  children,
}: {
  back: { href: string; label: string }
  after: { title: string; body: string }[]
  children: ReactNode
}) {
  return (
    <ProjectsPageChrome>
      <section className="relative">
        <SectionTexture />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
          style={{
            background:
              "radial-gradient(ellipse 40% 50% at 85% 25%, rgba(63,185,80,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <ProjectsBackLink href={back.href}>{back.label}</ProjectsBackLink>

          <div
            data-mascot-dock
            className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12"
          >
            <div className="min-w-0">{children}</div>
            <aside aria-label="What happens next">
              <div className="-mt-4 mb-4 hidden justify-center lg:flex">
                <MascotSlot />
              </div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
                After you send it
              </p>
              <ol className="relative mt-6 space-y-7 border-l border-gh-border pl-6">
                {after.map((item, i) => (
                  <li key={item.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-0 flex size-[18px] items-center justify-center rounded-full border border-gh-border bg-gh-bg font-mono text-[10px] font-semibold text-gh-accent"
                    >
                      {i + 1}
                    </span>
                    <p className="text-[15px] font-semibold text-gh-text">
                      {item.title}
                    </p>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-gh-muted">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>
    </ProjectsPageChrome>
  )
}
