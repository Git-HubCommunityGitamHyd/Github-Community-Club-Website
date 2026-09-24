import Link from "next/link"
import { Button } from "@/components/ui/button"

const LINKS = [
  { href: "/admin", label: "Applications" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/journey", label: "Journey" },
]

export function AdminNav({ active }: { active: string }) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-gh-border pb-4">
      <nav className="flex gap-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium ${
              active === link.href
                ? "text-gh-text"
                : "text-gh-muted hover:text-gh-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action="/api/admin/logout" method="POST">
        <Button variant="outline" type="submit" size="sm">
          Log out
        </Button>
      </form>
    </div>
  )
}
