import Link from "next/link"
import { Button } from "@/components/ui/button"
import { countPendingProposals } from "@/lib/db/proposals"
import { countPendingBuilds } from "@/lib/db/builds"
import { adminUrl } from "@/lib/auth/admin-path"

const LINKS = [
  { href: "/admin", label: "Applications" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/journey", label: "Journey" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/proposals", label: "Proposals" },
  { href: "/admin/builds", label: "Builds" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/docs", label: "Docs" },
]

export async function AdminNav({ active }: { active: string }) {
  // Submissions from the public forms wait here until someone looks, so the
  // nav says how many are waiting rather than relying on someone checking.
  const [proposals, builds] = await Promise.all([
    countPendingProposals(),
    countPendingBuilds(),
  ])
  const pending: Record<string, number> = {
    "/admin/proposals": proposals,
    "/admin/builds": builds,
  }

  return (
    <div className="mb-8 flex items-center justify-between border-b border-gh-border pb-4">
      <nav className="flex flex-wrap gap-x-6 gap-y-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={adminUrl(link.href)}
            className={`text-sm font-medium ${
              active === link.href
                ? "text-gh-text"
                : "text-gh-muted hover:text-gh-text"
            }`}
          >
            {link.label}
            {pending[link.href] > 0 && (
              <span className="ml-1.5 rounded-full bg-gh-accent px-1.5 py-px text-[11px] font-semibold tabular-nums text-gh-deep">
                {pending[link.href]}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <form action={adminUrl("/api/admin/logout")} method="POST">
        <Button variant="outline" type="submit" size="sm">
          Log out
        </Button>
      </form>
    </div>
  )
}
