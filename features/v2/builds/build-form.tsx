"use client"

import Link from "next/link"
import { TrackLink } from "@/features/v2/tracking/track-link"
import { ArrowRight, Check } from "lucide-react"
import {
  StepperForm,
  type Step,
  type StepValues,
} from "@/features/v2/forms/stepper-form"
import {
  firstNameOf,
  postJson,
  studentSteps,
} from "@/features/v2/forms/student-steps"
import { ImageDrop } from "@/features/v2/builds/image-drop"

const imagesOf = (values: StepValues) =>
  Array.isArray(values.images) ? values.images : []

const STEPS: Step[] = [
  {
    kind: "text",
    section: "Your build",
    summary: "Name",
    field: "title",
    question: "What’s it called?",
    placeholder: "Its name",
    maxLength: 60,
    requiredMessage: "What’s it called?",
  },
  {
    kind: "text",
    summary: "One line",
    field: "tagline",
    question: "Say what it does in one line.",
    hint: "This is what people read first, under the name.",
    placeholder: "A timetable that tells you when a class moves",
    maxLength: 100,
    requiredMessage: "One line on what it does",
  },
  {
    kind: "text",
    summary: "About it",
    field: "description",
    question: "Tell us about it.",
    hint: "What it does, why you made it, and the part you’re proudest of.",
    maxLength: 1500,
    minLength: 40,
    multiline: true,
  },
  {
    kind: "custom",
    summary: "Images",
    fields: ["images"],
    question: "Show us. Add a few screenshots.",
    hint: "The first one is the cover. Screens of it working beat logos.",
    render: ({ values, setValue, error }) => (
      <ImageDrop
        value={imagesOf(values)}
        onChange={(images) => setValue("images", images)}
        error={error}
      />
    ),
    validate: (values) =>
      imagesOf(values).length === 0 ? "Add at least one screenshot" : null,
    display: (values) => {
      const n = imagesOf(values).length
      return n ? `${n} image${n === 1 ? "" : "s"}` : null
    },
  },
  {
    kind: "fields",
    summary: "Links",
    question: "Where can people see it?",
    hint: "Both optional. A live link is the best thing you can give us.",
    fields: [
      {
        field: "liveUrl",
        label: "Live link",
        placeholder: "https://",
        maxLength: 300,
        optional: true,
        type: "url",
        inputMode: "url",
      },
      {
        field: "repoUrl",
        label: "Code",
        placeholder: "https://github.com/...",
        maxLength: 300,
        optional: true,
        type: "url",
        inputMode: "url",
      },
    ],
  },
  {
    kind: "text",
    summary: "Built with",
    field: "builtWith",
    question: "What did you make it with?",
    hint: "Optional. Tools, languages, anything. Separate them with commas.",
    placeholder: "e.g. Flutter, Firebase, Figma",
    maxLength: 200,
    optional: true,
  },
  {
    kind: "text",
    summary: "Dev notes",
    field: "devNotes",
    question: "Anything another developer would want to know?",
    hint: "Optional. How it works, what was hard, what you'd do next. It goes in a Dev notes section on its page.",
    placeholder: "It scrapes the timetable page every 10 minutes because...",
    maxLength: 3000,
    multiline: true,
    optional: true,
  },
  {
    kind: "text",
    summary: "Teammates",
    field: "teammates",
    question: "Did anyone build it with you?",
    hint: "Their names, separated by commas. Leave it blank if it was just you.",
    placeholder: "Names",
    maxLength: 200,
    optional: true,
  },
  ...studentSteps("Your name goes on the build, so people know who made it."),
]

export function BuildForm() {
  return (
    <StepperForm
      storageKey="build-draft"
      intro={{
        kicker: "Submit a build",
        title: "Made something? Show it off.",
        body: (
          <>
            Apps, sites, bots, games, tools, anything you built. The club looks
            at every submission and picks builds for each month’s showcase, plus
            a few for the week. Picked ones go up on the{" "}
            <Link
              href="/builds"
              className="text-gh-text underline decoration-gh-accent/60 underline-offset-4 hover:decoration-gh-accent"
            >
              builds page
            </Link>{" "}
            with your name on them.
          </>
        ),
        minutes: 4,
      }}
      steps={STEPS}
      submitLabel="Submit build"
      onSubmit={(values) => postJson("/api/builds", values)}
      done={(values, track) => <Done values={values} track={track} />}
    />
  )
}

function Done({ values, track }: { values: StepValues; track: string | null }) {
  const name = firstNameOf(values)
  return (
    <div>
      <span className="flex size-14 items-center justify-center rounded-full bg-gh-accent text-gh-deep">
        <Check aria-hidden="true" className="size-7" strokeWidth={2.5} />
      </span>
      <h3 className="mt-8 text-balance text-[clamp(28px,3.6vw,42px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-gh-text">
        Nice work{name ? `, ${name}` : ""}.
      </h3>
      <p className="mt-4 max-w-[52ch] text-pretty text-lg leading-relaxed text-gh-muted">
        Your build is with the club’s admins. It stays private until they pick
        it for a month’s showcase, and then it shows up on the builds page.
      </p>
      {track && <TrackLink path={`/builds/track/${track}`} noun="build" />}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/builds"
          className="group inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-6 py-3 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface active:scale-[0.97]"
        >
          See the builds
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
        <Link
          href="/#builds"
          className="rounded-full px-4 py-3 text-[15px] font-medium text-gh-muted transition-colors hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
        >
          Back to the homepage
        </Link>
      </div>
    </div>
  )
}
