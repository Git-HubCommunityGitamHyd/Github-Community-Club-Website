import type { Metadata } from "next"
import { FormPage } from "@/features/v2/forms/form-page"
import { ProposalForm } from "@/features/v2/proposals/proposal-form"

export const metadata: Metadata = {
  title: "Propose a project | GitHub Community GITAM",
  description:
    "Suggest something the GitHub Community club at GITAM Hyderabad could build for campus.",
}

export default function NewProposalPage() {
  return (
    <FormPage
      back={{ href: "/proposals", label: "Proposals" }}
      after={[
        {
          title: "You get a private link",
          body: "It shows where your proposal is at any time. No account needed, so save it.",
        },
        {
          title: "The admins read it",
          body: "It stays private while the club looks at it.",
        },
        {
          title: "If it’s taken on",
          body: "It goes up on the proposals page with your first name, and its status moves as work starts and ships. Your number and reg. no. are never shown.",
        },
      ]}
    >
      <ProposalForm />
    </FormPage>
  )
}
