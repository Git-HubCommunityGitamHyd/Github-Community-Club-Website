import { monogram, resolveTech } from "@/features/tech/tech-icons"
import { cn } from "@/lib/utils"

/**
 * A project's or a build's tech stack as logo tiles: the mark and the name,
 * like the homepage's "What we build with" marquee, set still. Marks are
 * single-colour and take the text colour, as they do there, rather than each
 * brand's own colour, which would put a dozen accents on one page.
 *
 * A tool with no logo gets a monogram in the same box, so a row of known and
 * unknown tools stays even instead of some tiles going blank.
 */
export function TechStack({
  items,
  size = "page",
}: {
  items: string[]
  /** "preview" is the CMS's smaller version. */
  size?: "page" | "preview"
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => {
        const { name, icon: Icon } = resolveTech(item)
        return (
          <li
            key={item}
            className={cn(
              "group flex items-center rounded-xl border bg-gh-surface/70 transition-colors duration-300 hover:border-gh-muted/60",
              size === "page" ? "gap-3 px-4 py-3" : "gap-2 px-3 py-2 text-sm",
              Icon ? "border-gh-border" : "border-dashed border-gh-border",
            )}
          >
            {Icon ? (
              <Icon
                aria-hidden="true"
                className={cn(
                  "shrink-0 text-gh-text/75 transition-colors duration-300 group-hover:text-gh-text",
                  size === "page" ? "h-7 w-7" : "h-5 w-5",
                )}
              />
            ) : (
              <span
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md bg-gh-elevated font-mono font-semibold text-gh-muted ring-1 ring-inset ring-gh-border",
                  size === "page"
                    ? "h-7 w-7 text-[11px]"
                    : "h-5 w-5 text-[9px]",
                )}
              >
                {monogram(name)}
              </span>
            )}
            <span
              className={cn(
                "whitespace-nowrap font-semibold tracking-[-0.01em] text-gh-text",
                size === "page" && "text-[15px]",
              )}
            >
              {name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
