import type { ReactNode } from "react"
import Link from "next/link"
import { Check, Circle, X } from "lucide-react"
import { PageChrome } from "@/features/site/page-chrome"
import { BackLink } from "@/features/site/back-link"
import { MascotSlot } from "@/features/mascot/mascot-slot"
import { SectionTexture } from "@/components/ui/texture"
import { cn } from "@/lib/utils"

export type Stage = {
  title: string
  body?: ReactNode
  when?: string | null
  state: "done" | "current" | "upcoming" | "stopped"
}

export function formatWhen(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * A submission's private status page, for proposals and builds alike: its
 * title and a short vertical timeline of where it has got to. Deliberately
 * shows nothing the submitter did not already know apart from the status.
 */
export function TrackPage({
  back,
  kicker,
  title,
  stages,
  footer,
}: {
  back: { href: string; label: string }
  kicker: string
  title: string | null
  stages: Stage[]
  footer?: ReactNode
}) {
  return (
    <PageChrome>
      <section className="relative">
        <SectionTexture />
        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-32 sm:px-6 lg:px-8">
          <BackLink href={back.href}>{back.label}</BackLink>

          <div className="mt-8 flex items-end justify-between gap-10">
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
                {kicker}
              </p>
              <h1 className="mt-3 text-balance text-[clamp(32px,4.8vw,56px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
                {title ?? "This link doesn’t match anything"}
              </h1>
            </div>
            <MascotSlot />
          </div>

          {title ? (
            <ol
              data-mascot-dock
              className="mt-12 rounded-2xl border border-gh-border bg-gh-surface/75 p-6 sm:p-8"
            >
              {stages.map((stage, i) => (
                <li
                  key={stage.title}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  {i < stages.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-0 left-[13px] top-8 w-px",
                        stage.state === "done"
                          ? "bg-gh-accent/60"
                          : "bg-gh-border",
                      )}
                    />
                  )}
                  <StageDot state={stage.state} />
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        "flex flex-wrap items-baseline gap-x-3 text-[17px] font-semibold",
                        stage.state === "upcoming"
                          ? "text-gh-muted"
                          : "text-gh-text",
                      )}
                    >
                      {stage.title}
                      {stage.when && (
                        <span className="font-mono text-xs font-normal text-gh-muted">
                          {stage.when}
                        </span>
                      )}
                    </p>
                    {stage.body && (
                      <p className="mt-1 max-w-[56ch] text-pretty text-[15px] leading-relaxed text-gh-muted">
                        {stage.body}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div
              data-mascot-dock
              className="mt-12 rounded-2xl border border-dashed border-gh-border px-8 py-14"
            >
              <p className="max-w-[52ch] text-pretty text-gh-muted">
                Check that the whole link was copied. If you&apos;ve lost it,
                message the club on the WhatsApp community group with your name
                and what you sent, and an admin can tell you where it is.
              </p>
            </div>
          )}

          {title && footer && <div className="mt-8">{footer}</div>}

          <p className="mt-10 text-sm text-gh-muted">
            Keep this link to yourself. Anyone who has it can see this page.{" "}
            <Link
              href="/"
              className="text-gh-text underline decoration-gh-border underline-offset-4 hover:decoration-gh-accent"
            >
              Back to the homepage
            </Link>
          </p>
        </div>
      </section>
    </PageChrome>
  )
}

function StageDot({ state }: { state: Stage["state"] }) {
  return (
    <span
      className={cn(
        "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border",
        state === "done" && "border-gh-accent bg-gh-accent text-gh-deep",
        state === "current" && "border-gh-accent bg-gh-bg text-gh-accent",
        state === "upcoming" && "border-gh-border bg-gh-bg text-gh-muted",
        state === "stopped" && "border-gh-border bg-gh-elevated text-gh-muted",
      )}
    >
      {state === "done" && (
        <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
      )}
      {state === "current" && (
        <Circle
          aria-hidden="true"
          className="size-2.5 animate-pulse fill-current"
        />
      )}
      {state === "stopped" && <X aria-hidden="true" className="size-3.5" />}
      <span className="sr-only">
        {state === "done"
          ? "Done"
          : state === "current"
            ? "In progress"
            : state === "stopped"
              ? "Stopped here"
              : "Not yet"}
      </span>
    </span>
  )
}
