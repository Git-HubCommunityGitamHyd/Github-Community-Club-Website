import { STUDENT_YEARS } from "@/features/v2/forms/student"
import type { Step, StepValues } from "@/features/v2/forms/stepper-form"

function first(values: StepValues): string {
  const name = typeof values.name === "string" ? values.name.trim() : ""
  return name.split(/\s+/)[0] ?? ""
}

/**
 * The "about you" run both forms end with. `nameHint` differs: a proposal
 * shows only a first name publicly, a build credits the full name.
 */
export function studentSteps(nameHint: string): Step[] {
  return [
    {
      kind: "text",
      section: "About you",
      summary: "Name",
      field: "name",
      question: "What's your name?",
      hint: nameHint,
      placeholder: "Your full name",
      maxLength: 80,
      autoComplete: "name",
      requiredMessage: "Tell us your name",
    },
    {
      kind: "choice",
      summary: "Year",
      field: "year",
      question: (values) =>
        first(values)
          ? `Nice to meet you, ${first(values)}. Which year are you in?`
          : "Which year are you in?",
      options: Object.entries(STUDENT_YEARS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      kind: "text",
      summary: "Branch",
      field: "branch",
      question: "And your branch?",
      placeholder: "e.g. CSE, ECE, B.Tech AI and ML, BBA",
      maxLength: 60,
      requiredMessage: "Tell us your branch",
    },
    {
      kind: "text",
      summary: "Reg. no.",
      field: "regNo",
      question: "Your registration number?",
      hint: "So we know you're at GITAM. Only the club's admins see it.",
      placeholder: "e.g. 2023004123",
      maxLength: 24,
      requiredMessage: "We need this one",
    },
    {
      kind: "text",
      summary: "Phone",
      field: "phone",
      question: "Last one. Your phone number?",
      hint: "Only the club's admins see it, and only to get in touch about this.",
      placeholder: "10 digit mobile number",
      maxLength: 16,
      type: "tel",
      inputMode: "tel",
      autoComplete: "tel",
      requiredMessage: "We need a way to reach you",
    },
  ]
}

export async function postJson(url: string, values: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  const body = await res.json().catch(() => null)
  if (res.ok) {
    return { ok: true as const, track: body?.track as string | undefined }
  }
  return {
    ok: false as const,
    errors: (body?.errors as Record<string, string>) ?? {
      form: "That didn't go through. Try once more.",
    },
  }
}

export { first as firstNameOf }
