import { TechStack } from "@/features/v2/tech/tech-stack"
import { resolveTech } from "@/features/v2/tech/tech-icons"

/**
 * The tech stack as the page will show it, under the CMS field, so a typo
 * ("Fireabse") is caught here as a monogram instead of on the live page.
 */
export function StackPreview({ value }: { value: string }) {
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (items.length === 0) return null
  const unknown = items.filter((item) => !resolveTech(item).icon)

  return (
    <div className="mt-3 space-y-2">
      <TechStack items={items} size="preview" />
      {unknown.length > 0 && (
        <p className="text-sm text-gh-muted">
          No logo for {unknown.join(", ")}, so{" "}
          {unknown.length === 1 ? "it shows" : "they show"} as initials (dashed
          border). Check the spelling, or leave it if the tool is just not in
          the list (features/v2/tech/tech-icons.ts).
        </p>
      )}
    </div>
  )
}
