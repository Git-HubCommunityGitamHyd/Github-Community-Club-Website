import Link from "next/link"
import { Button } from "@/components/ui/button"

const LINKS = [
  { href: "/admin", label: "Applications" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/events", label: "Events" },
]

export function AdminNav({ active }: { active: string }) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gh-border">
      <nav className="flex gap-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium ${
              active === link.href
                ? "text-black dark:text-gh-text"
                : "text-gray-500 hover:text-black dark:text-gh-muted dark:hover:text-gh-text"
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
