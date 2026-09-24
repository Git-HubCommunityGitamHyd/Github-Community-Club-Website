"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CornerDownLeft,
  PenLine,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A one-question-per-screen form, in the manner of Typeform, shared by the
 * proposal and build forms.
 *
 * Why this shape rather than one long form: both forms are aimed at students
 * who are not necessarily technical and have never talked to the club. A wall
 * of twelve fields reads as paperwork. One plain question at a time, with a
 * sentence under it saying why it is asked, reads as a conversation, and the
 * later questions can use what they already said ("Nice to meet you, Asha").
 *
 * The details that make it feel like one:
 * - Enter moves on (Cmd/Ctrl+Enter in a text box, where Enter is a new line),
 *   and choices answer to their letter keys, so a keyboard user never reaches
 *   for the mouse.
 * - Picking a choice moves on by itself after a beat, long enough to see the
 *   selection land.
 * - Each question slides in from the direction you are travelling.
 * - A review screen at the end lists every answer with an edit button that
 *   comes straight back to the review, rather than making you step forward
 *   through everything after it again.
 * - Answers survive a refresh for the life of the tab (sessionStorage, not
 *   localStorage: these forms carry a phone number, and a shared lab computer
 *   should not keep it after the tab is closed).
 */

export type StepValues = Record<string, string | string[]>

type Question = string | ((values: StepValues) => string)

type StepBase = {
  /** Heading over a run of questions, e.g. "The idea" or "About you". */
  section?: string
  question: Question
  hint?: ReactNode
  /** Short name for the answer on the review screen. */
  summary: string
}

export type TextField = {
  field: string
  placeholder?: string
  maxLength: number
  minLength?: number
  multiline?: boolean
  optional?: boolean
  type?: "text" | "url" | "tel"
  inputMode?: "text" | "url" | "tel" | "numeric"
  autoComplete?: string
  /** Shown above the input when a step has several. */
  label?: string
  /** Message when a required field is empty. */
  requiredMessage?: string
}

export type TextStep = StepBase & { kind: "text" } & TextField

export type ChoiceStep = StepBase & {
  kind: "choice"
  field: string
  options: { value: string; label: string }[]
}

/** Several short, usually optional, inputs on one screen (e.g. two links). */
export type FieldsStep = StepBase & { kind: "fields"; fields: TextField[] }

/** Anything else (the image uploader). The form only needs its field names. */
export type CustomStep = StepBase & {
  kind: "custom"
  fields: string[]
  render: (props: {
    values: StepValues
    setValue: (field: string, value: string | string[]) => void
    error?: string
  }) => ReactNode
  validate?: (values: StepValues) => string | null
  display: (values: StepValues) => ReactNode
}

export type Step = TextStep | ChoiceStep | FieldsStep | CustomStep

/** `track` is the private link token the API hands back, for the thank-you. */
export type SubmitResult =
  { ok: true; track?: string } | { ok: false; errors: Record<string, string> }

const LETTERS = "ABCDEFGHIJ"

function fieldsOf(step: Step): string[] {
  if (step.kind === "fields") return step.fields.map((f) => f.field)
  if (step.kind === "custom") return step.fields
  return [step.field]
}

function asText(value: StepValues[string] | undefined): string {
  return typeof value === "string" ? value : ""
}

/** Client-side checks, the same limits the API enforces. */
function checkText(field: TextField, value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return field.optional
      ? null
      : (field.requiredMessage ?? "This one's needed to go on")
  }
  if (field.minLength && trimmed.length < field.minLength) {
    return `A little more, at least ${field.minLength} characters`
  }
  if (field.type === "url") {
    try {
      const url = new URL(trimmed)
      if (url.protocol !== "https:" && url.protocol !== "http:") throw 0
    } catch {
      return "Paste the full link, starting with https://"
    }
  }
  return null
}

function checkStep(step: Step, values: StepValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step.kind === "text") {
    const error = checkText(step, asText(values[step.field]))
    if (error) errors[step.field] = error
  } else if (step.kind === "fields") {
    for (const field of step.fields) {
      const error = checkText(field, asText(values[field.field]))
      if (error) errors[field.field] = error
    }
  } else if (step.kind === "choice") {
    if (!asText(values[step.field])) errors[step.field] = "Pick one to go on"
  } else if (step.validate) {
    const error = step.validate(values)
    if (error) errors[step.fields[0]] = error
  }
  return errors
}

function questionText(question: Question, values: StepValues): string {
  return typeof question === "function" ? question(values) : question
}

export function StepperForm({
  storageKey,
  intro,
  steps,
  onSubmit,
  done,
  submitLabel = "Send it",
}: {
  storageKey: string
  intro: { kicker: string; title: string; body: ReactNode; minutes: number }
  steps: Step[]
  onSubmit: (values: StepValues & { company: string }) => Promise<SubmitResult>
  done: (values: StepValues, track: string | null) => ReactNode
  submitLabel?: string
}) {
  // -1 is the intro, steps.length the review, steps.length + 1 the thank you.
  const [index, setIndex] = useState(-1)
  const [direction, setDirection] = useState(1)
  const [values, setValues] = useState<StepValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [track, setTrack] = useState<string | null>(null)
  // Set when an answer is being edited from the review screen.
  const [returnToReview, setReturnToReview] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const advanceTimer = useRef<number | null>(null)

  const review = steps.length
  const finished = steps.length + 1

  // Restore a draft once, after hydration, so the server render and the
  // first client render agree.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (!saved) return
      const parsed = JSON.parse(saved) as { values?: StepValues }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off restore from storage
      if (parsed.values) setValues(parsed.values)
    } catch {
      // Private mode or a mangled draft: start empty.
    }
  }, [storageKey])

  useEffect(() => {
    if (index === finished) return
    try {
      if (Object.keys(values).length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify({ values }))
      }
    } catch {
      // Storage is a convenience; losing it loses nothing but the draft.
    }
  }, [values, storageKey, index, finished])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    }
  }, [])

  const go = useCallback(
    (to: number) => {
      setDirection(to >= index ? 1 : -1)
      setIndex(to)
      setFormError(null)
    },
    [index],
  )

  const next = useCallback(
    (current: StepValues = values) => {
      if (index >= 0 && index < steps.length) {
        const stepErrors = checkStep(steps[index], current)
        if (Object.keys(stepErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...stepErrors }))
          return
        }
      }
      if (returnToReview && index < review) {
        setReturnToReview(false)
        go(review)
        return
      }
      go(Math.min(index + 1, review))
    },
    [values, index, steps, returnToReview, review, go],
  )

  const setValue = useCallback((field: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const rest = { ...prev }
      delete rest[field]
      return rest
    })
  }, [])

  const choose = useCallback(
    (field: string, value: string) => {
      const updated = { ...values, [field]: value }
      setValue(field, value)
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
      // Long enough to see the choice land, short enough not to feel slow.
      advanceTimer.current = window.setTimeout(() => next(updated), 320)
    },
    [values, setValue, next],
  )

  // Focus the step's input (or the chosen option) once it has arrived, so
  // typing or Enter works straight away without a click. On the enter
  // animation's completion rather than on the index change: with
  // AnimatePresence in "wait" mode the new step is not mounted until the old
  // one has left, so an earlier focus lands on the outgoing step and is lost
  // to <body> when it unmounts.
  const focusStep = useCallback(() => {
    panelRef.current
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus({ preventScroll: true })
  }, [])

  // Letter keys pick a choice, unless the visitor is typing somewhere.
  const step = index >= 0 && index < steps.length ? steps[index] : null
  useEffect(() => {
    if (!step || step.kind !== "choice") return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select")) return
      const at = LETTERS.indexOf(event.key.toUpperCase())
      if (at >= 0 && at < step.options.length) {
        event.preventDefault()
        choose(step.field, step.options[at].value)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, choose])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return
    const target = event.target as HTMLElement
    const inTextarea = target.tagName === "TEXTAREA"
    if (inTextarea && !(event.metaKey || event.ctrlKey)) return
    // Buttons handle their own Enter.
    if (target.tagName === "BUTTON") return
    event.preventDefault()
    if (index === review) void submit()
    else if (index < review) next()
  }

  async function submit() {
    if (submitting) return
    // Every step again, in case a draft skipped one.
    for (let i = 0; i < steps.length; i++) {
      const stepErrors = checkStep(steps[i], values)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        setReturnToReview(true)
        go(i)
        return
      }
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const result = await onSubmit({
        ...values,
        company: honeypot.current?.value ?? "",
      })
      if (result.ok) {
        try {
          sessionStorage.removeItem(storageKey)
        } catch {}
        setTrack(result.track ?? null)
        go(finished)
        return
      }
      setErrors(result.errors)
      const first = steps.findIndex((s) =>
        fieldsOf(s).some((field) => field in result.errors),
      )
      if (first >= 0) {
        setReturnToReview(true)
        go(first)
      } else {
        setFormError(
          result.errors.form ?? "That didn't go through. Try once more.",
        )
      }
    } catch {
      setFormError("Couldn't reach the server. Check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  const progress = index < 0 ? 0 : Math.min(1, (index + 1) / (steps.length + 1))
  const sectionHere =
    step?.section ?? steps.slice(0, index).findLast((s) => s.section)?.section

  return (
    <div
      ref={panelRef}
      onKeyDown={onKeyDown}
      // Focusable (but not in the tab order) so a click on the panel's empty
      // space keeps the keyboard inside it instead of dropping to <body>.
      tabIndex={-1}
      className="relative flex min-h-[540px] flex-col overflow-hidden rounded-3xl border border-gh-border bg-gh-surface/75 shadow-[0_40px_80px_-40px_rgba(1,4,9,0.9)] outline-none backdrop-blur-sm"
    >
      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <input
        ref={honeypot}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* Progress. A hairline that fills, and a count, so there is always an
          answer to "how much more of this is there". */}
      <div className="flex items-center gap-4 border-b border-gh-border px-6 py-4 sm:px-10">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gh-muted">
          {index < 0
            ? intro.kicker
            : index >= review
              ? index === review
                ? "Review"
                : "Sent"
              : sectionHere}
        </span>
        <div
          className="relative h-1 flex-1 overflow-hidden rounded-full bg-gh-border/60"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={Math.max(0, Math.min(index, steps.length))}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gh-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-gh-muted">
          {index >= 0 && index < steps.length
            ? `${index + 1} / ${steps.length}`
            : index === review
              ? `${steps.length} / ${steps.length}`
              : ""}
        </span>
      </div>

      <div className="relative flex flex-1 items-center px-6 py-10 sm:px-10 lg:px-14">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, y: dir * 36 }),
              center: { opacity: 1, y: 0 },
              exit: (dir: number) => ({ opacity: 0, y: dir * -36 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={(definition) => {
              if (definition === "center") focusStep()
            }}
            className="w-full max-w-2xl"
          >
            {index < 0 && <Intro intro={intro} onStart={() => go(0)} />}

            {step && (
              <StepView
                step={step}
                number={index + 1}
                values={values}
                errors={errors}
                setValue={setValue}
                choose={choose}
              />
            )}

            {index === review && (
              <Review
                steps={steps}
                values={values}
                onEdit={(i) => {
                  setReturnToReview(true)
                  go(i)
                }}
              />
            )}

            {index === finished && done(values, track)}
          </motion.div>
        </AnimatePresence>
      </div>

      {index >= 0 && index <= review && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gh-border px-6 py-4 sm:px-10">
          <button
            type="button"
            onClick={() => {
              setReturnToReview(false)
              go(index - 1)
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gh-muted transition-colors hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent active:scale-[0.97]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </button>

          <div className="flex items-center gap-4">
            {formError && (
              <p role="alert" className="text-sm text-red-400">
                {formError}
              </p>
            )}
            <EnterHint step={step} review={index === review} />
            <button
              type="button"
              disabled={submitting}
              onClick={() => (index === review ? void submit() : next())}
              className="group inline-flex items-center gap-2 rounded-full bg-gh-accent px-5 py-2.5 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface active:scale-[0.97] disabled:opacity-60"
            >
              {index === review ? (
                submitting ? (
                  "Sending"
                ) : (
                  <>
                    {submitLabel}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )
              ) : returnToReview ? (
                <>
                  Back to review
                  <Check aria-hidden="true" className="size-4" />
                </>
              ) : (
                <>
                  OK
                  <Check aria-hidden="true" className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EnterHint({ step, review }: { step: Step | null; review: boolean }) {
  const multiline =
    step?.kind === "text" && step.multiline
      ? true
      : step?.kind === "fields"
        ? step.fields.some((f) => f.multiline)
        : false
  return (
    <span className="hidden items-center gap-1.5 text-xs text-gh-muted md:inline-flex">
      {step?.kind === "choice" ? (
        "or press a letter"
      ) : (
        <>
          press
          <kbd className="inline-flex items-center gap-1 rounded-md border border-gh-border bg-gh-elevated px-1.5 py-0.5 font-mono text-[11px] text-gh-text">
            {multiline && !review ? "Ctrl" : null}
            {multiline && !review ? " + " : null}
            Enter
            <CornerDownLeft aria-hidden="true" className="size-3" />
          </kbd>
        </>
      )}
    </span>
  )
}

function Intro({
  intro,
  onStart,
}: {
  intro: { kicker: string; title: string; body: ReactNode; minutes: number }
  onStart: () => void
}) {
  return (
    <div>
      {/* The page's h1: the form page has no separate heading above the
          panel, which only repeated this one. */}
      <h1 className="text-balance text-[clamp(32px,4.2vw,52px)] font-extrabold leading-[1.04] tracking-[-0.03em] text-gh-text">
        {intro.title}
      </h1>
      <div className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-gh-muted">
        {intro.body}
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button
          type="button"
          data-autofocus
          onClick={onStart}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gh-accent px-6 py-3 text-[15px] font-semibold text-gh-deep transition-[transform,background-color] duration-200 hover:bg-gh-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-surface active:scale-[0.97]"
        >
          Start
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
        <span className="font-mono text-xs text-gh-muted">
          About {intro.minutes} minutes
        </span>
      </div>
    </div>
  )
}

function StepView({
  step,
  number,
  values,
  errors,
  setValue,
  choose,
}: {
  step: Step
  number: number
  values: StepValues
  errors: Record<string, string>
  setValue: (field: string, value: string | string[]) => void
  choose: (field: string, value: string) => void
}) {
  const headingId = `step-${number}-question`
  const error = fieldsOf(step)
    .map((field) => errors[field])
    .find(Boolean)

  return (
    <fieldset aria-labelledby={headingId} className="min-w-0">
      <legend className="sr-only">{questionText(step.question, values)}</legend>
      <h3
        id={headingId}
        className="flex gap-3 text-balance text-[clamp(22px,2.8vw,32px)] font-bold leading-snug tracking-[-0.02em] text-gh-text"
      >
        <span className="mt-[0.4em] inline-flex shrink-0 items-center gap-1 font-mono text-sm font-semibold text-gh-accent">
          {number}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
        <span>{questionText(step.question, values)}</span>
      </h3>
      {step.hint && (
        <p className="mt-3 max-w-[56ch] text-pretty pl-10 text-base leading-relaxed text-gh-muted">
          {step.hint}
        </p>
      )}

      <div className="mt-8 pl-10">
        {step.kind === "text" && (
          <TextInput
            field={step}
            value={asText(values[step.field])}
            onChange={(v) => setValue(step.field, v)}
            error={errors[step.field]}
            labelledBy={headingId}
            autoFocus
          />
        )}

        {step.kind === "fields" && (
          <div className="space-y-7">
            {step.fields.map((field, i) => (
              <TextInput
                key={field.field}
                field={field}
                value={asText(values[field.field])}
                onChange={(v) => setValue(field.field, v)}
                error={errors[field.field]}
                autoFocus={i === 0}
              />
            ))}
          </div>
        )}

        {step.kind === "choice" && (
          <Choices
            step={step}
            value={asText(values[step.field])}
            onChoose={(v) => choose(step.field, v)}
            labelledBy={headingId}
            error={error}
          />
        )}

        {step.kind === "custom" &&
          step.render({ values, setValue, error: error })}
      </div>
    </fieldset>
  )
}

function TextInput({
  field,
  value,
  onChange,
  error,
  labelledBy,
  autoFocus,
}: {
  field: TextField
  value: string
  onChange: (value: string) => void
  error?: string
  labelledBy?: string
  autoFocus?: boolean
}) {
  const id = `field-${field.field}`
  const shared = {
    id,
    value,
    maxLength: field.maxLength,
    placeholder: field.placeholder,
    autoComplete: field.autoComplete ?? "off",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    "aria-labelledby": field.label ? undefined : labelledBy,
    "data-autofocus": autoFocus ? "" : undefined,
    className: cn(
      "w-full border-0 border-b-2 bg-transparent px-0 pb-3 text-[clamp(18px,2vw,24px)] text-gh-text caret-gh-accent outline-none transition-colors placeholder:text-gh-muted/50 focus:outline-none focus:ring-0 focus-visible:outline-none",
      error ? "border-red-400/70" : "border-gh-border focus:border-gh-accent",
    ),
  }
  const near = value.length >= field.maxLength * 0.8

  return (
    <div>
      {field.label && (
        <label
          htmlFor={id}
          className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gh-muted"
        >
          {field.label}
          {field.optional && (
            <span className="ml-2 normal-case tracking-normal text-gh-muted/70">
              optional
            </span>
          )}
        </label>
      )}
      {field.multiline ? (
        <textarea
          {...shared}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared.className, "resize-none leading-relaxed")}
        />
      ) : (
        <input
          {...shared}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <div className="mt-2 flex min-h-5 items-start justify-between gap-4 text-sm">
        <span
          id={`${id}-error`}
          role={error ? "alert" : undefined}
          className="text-red-400"
        >
          {error}
        </span>
        {(field.multiline || near) && (
          <span
            className={cn(
              "shrink-0 font-mono text-xs tabular-nums",
              near ? "text-gh-text" : "text-gh-muted",
            )}
          >
            {value.length} / {field.maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

function Choices({
  step,
  value,
  onChoose,
  labelledBy,
  error,
}: {
  step: ChoiceStep
  value: string
  onChoose: (value: string) => void
  labelledBy: string
  error?: string
}) {
  const selectedIndex = step.options.findIndex((o) => o.value === value)
  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        className="grid max-w-xl gap-2.5"
      >
        {step.options.map((option, i) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-autofocus={
                selected || (selectedIndex < 0 && i === 0) ? "" : undefined
              }
              onClick={() => onChoose(option.value)}
              className={cn(
                "group flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left text-[17px] transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent active:scale-[0.99]",
                selected
                  ? "border-gh-accent bg-gh-accent/10 text-gh-text"
                  : "border-gh-border bg-gh-bg/40 text-gh-text/90 hover:border-gh-muted/60 hover:bg-gh-elevated/60",
              )}
            >
              <kbd
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors",
                  selected
                    ? "border-gh-accent bg-gh-accent text-gh-deep"
                    : "border-gh-border text-gh-muted group-hover:text-gh-text",
                )}
              >
                {LETTERS[i]}
              </kbd>
              <span className="flex-1">{option.label}</span>
              <Check
                aria-hidden="true"
                className={cn(
                  "size-4 text-gh-accent transition-opacity",
                  selected ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function Review({
  steps,
  values,
  onEdit,
}: {
  steps: Step[]
  values: StepValues
  onEdit: (index: number) => void
}) {
  const rows = useMemo(
    () =>
      steps.map((step, i) => {
        let shown: ReactNode
        if (step.kind === "choice") {
          const value = asText(values[step.field])
          shown = step.options.find((o) => o.value === value)?.label ?? value
        } else if (step.kind === "custom") {
          shown = step.display(values)
        } else {
          const fields = step.kind === "fields" ? step.fields : [step]
          const filled = fields
            .map((f) => asText(values[f.field]).trim())
            .filter(Boolean)
          shown = filled.length ? filled.join("\n") : null
        }
        return { step, i, shown }
      }),
    [steps, values],
  )

  return (
    <div>
      <h3 className="text-balance text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.02em] text-gh-text">
        Look right?
      </h3>
      <p className="mt-2 text-base text-gh-muted">
        Edit anything before it goes. Nothing is sent until you press the
        button.
      </p>
      <dl className="mt-8 divide-y divide-gh-border border-y border-gh-border">
        {rows.map(({ step, i, shown }) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-start gap-4 py-3"
          >
            <dt className="pt-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gh-muted">
              {step.summary}
            </dt>
            <dd className="min-w-0 whitespace-pre-line break-words text-[15px] leading-relaxed text-gh-text">
              {shown ?? <span className="text-gh-muted">Skipped</span>}
            </dd>
            <dd>
              <button
                type="button"
                onClick={() => onEdit(i)}
                aria-label={`Edit ${step.summary}`}
                className="flex size-8 items-center justify-center rounded-md text-gh-muted transition-colors hover:bg-gh-elevated hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <PenLine aria-hidden="true" className="size-4" />
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
