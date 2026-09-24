import type { Metadata } from "next"
import { FormPage } from "@/features/forms/form-page"
import { BuildForm } from "@/features/builds/build-form"

export const metadata: Metadata = {
  title: "Submit a build | GitHub Community GITAM",
  description:
    "Send the GitHub Community club at GITAM Hyderabad something you built, for the monthly builds showcase.",
}

export default function SubmitBuildPage() {
  return (
    <FormPage
      back={{ href: "/builds", label: "Builds" }}
      after={[
        {
          title: "You get a private link",
          body: "It shows whether your build was picked. No account needed, so save it.",
        },
        {
          title: "The admins look at it",
          body: "It stays private while the club goes through it.",
        },
        {
          title: "Picked for a month",
          body: "Picked builds join that month’s showcase with your name and your teammates’, and a few are picked for the week. Your number and reg. no. stay private.",
        },
      ]}
    >
      <BuildForm />
    </FormPage>
  )
}
