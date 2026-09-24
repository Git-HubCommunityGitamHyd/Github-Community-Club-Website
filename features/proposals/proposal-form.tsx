"use client"

import Link from "next/link"
import { TrackLink } from "@/features/tracking/track-link"
import { ArrowRight, Check } from "lucide-react"
import {
  StepperForm,
  type Step,
  type StepValues,
} from "@/features/forms/stepper-form"
import {
  firstNameOf,
  postJson,
  studentSteps,
} from "@/features/forms/student-steps"
import {
  PROPOSAL_AUDIENCES,
  PROPOSAL_FORMATS,
  PROPOSAL_HELP,
} from "@/features/proposals/keys"

const options = (set: Record<string, string>) =>
  Object.entries(set).map(([value, label]) => ({ value, label }))

/**
 * The questions are written for someone who has never built software. None of
 * them asks for a stack, a feature list or a platform by name: "how would
 * people use it" with "not sure, you decide" as an answer covers what a
 * "platform" question would, without making anyone feel they got it wrong.
 */
const STEPS: Step[] = [
  {
    kind: "text",
    section: "The idea",
    summary: "Idea",
    field: "title",
    question: "What should the club build?",
    hint: "A working name is fine. “The lost and found thing” works.",
    placeholder: "Give it a name",
    maxLength: 80,
    requiredMessage: "Give it a name, even a rough one",
  },
  {
    kind: "text",
    summary: "Problem",
    field: "idea",
    question: "What problem would it solve?",
    hint: "Who is stuck with what, today? Two or three sentences is plenty.",
    placeholder:
      "Every semester people lose ID cards and there’s no single place to...",
    maxLength: 1000,
    minLength: 20,
    multiline: true,
  },
  {
    kind: "choice",
    summary: "For",
    field: "audience",
    question: "Who would use it most?",
    options: options(PROPOSAL_AUDIENCES),
  },
  {
    kind: "choice",
    summary: "How",
    field: "format",
    question: "How do you picture people using it?",
    hint: "No wrong answer. If you’re not sure, that’s what we’re for.",
    options: options(PROPOSAL_FORMATS),
  },
  {
    kind: "choice",
    summary: "Joining in",
    field: "help",
    question: "Do you want to be part of building it?",
    hint: "You don’t need to know how to code. Testing it and shaping it count.",
    options: options(PROPOSAL_HELP),
  },
  ...studentSteps("Only your first name is ever shown on the site."),
]

export function ProposalForm() {
  return (
    <StepperForm
      storageKey="proposal-draft"
      intro={{
        kicker: "Propose a project",
        title: "Got an idea the campus needs?",
        body: (
          <>
            Tell us what you’d want built and who it’s for. You don’t need to
            know how it would work. The club reads every proposal, and the ones
            we take on show up on the{" "}
            <Link
              href="/proposals"
              className="text-gh-text underline decoration-gh-accent/60 underline-offset-4 hover:decoration-gh-accent"
            >
              proposals page
            </Link>
            .
          </>
        ),
        minutes: 3,
      }}
      steps={STEPS}
      submitLabel="Send proposal"
      onSubmit={(values) => postJson("/api/proposals", values)}
      done={(values, track) => <Done values={values} track={track} />}
    />
  )
}

function Done({ values, track }: { values: StepValues; track: string | null }) {
  const name = firstNameOf(values)
  const helping = values.help === "build" || values.help === "test"
  return (
    <div>
      <span className="flex size-14 items-center justify-center rounded-full bg-gh-accent text-gh-deep">
        <Check aria-hidden="true" className="size-7" strokeWidth={2.5} />
      </span>
      <h3 className="mt-8 text-balance text-[clamp(28px,3.6vw,42px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-gh-text">
        Got it{name ? `, ${name}` : ""}.
      </h3>
      <p className="mt-4 max-w-[52ch] text-pretty text-lg leading-relaxed text-gh-muted">
        It’s with the club’s admins now. Nothing is public until they accept it.
        If they do, it goes up on the proposals page with your first name on it
        {helping
          ? ", and since you want to be part of it, we’ll use your number to get in touch."
          : "."}
      </p>
      {track && (
        <TrackLink path={`/proposals/track/${track}`} noun="proposal" />
      )}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/proposals"
          className="group inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-6 py-3 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface active:scale-[0.97]"
        >
          See accepted proposals
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
        <Link
          href="/#ideas"
          className="rounded-full px-4 py-3 text-[15px] font-medium text-gh-muted transition-colors hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
        >
          Back to the homepage
        </Link>
      </div>
    </div>
  )
}
