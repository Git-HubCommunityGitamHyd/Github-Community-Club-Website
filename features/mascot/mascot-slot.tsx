import { cn } from "@/lib/utils"

/**
 * The id the slot carries, one per page. Lives here, not in page-mascot.tsx:
 * a value exported from a "use client" module reaches a server component as
 * a client reference, not as the string.
 */
export const PAGE_MASCOT_SLOT = "page-mascot-slot"

/**
 * Where the octocat rests in an inner page's header. An empty box: the mascot
 * is drawn fixed over it by <PageMascot />, which measures this.
 *
 * Width to height stays 1.25 (MASCOT_ASPECT), because the rig derives its
 * scale from height alone and any other ratio stretches the model as it
 * shrinks to its dock. Hidden below md, where the mascot is too.
 */
export function MascotSlot({ className }: { className?: string }) {
  return (
    <div
      id={PAGE_MASCOT_SLOT}
      aria-hidden="true"
      className={cn(
        "pointer-events-none hidden h-[176px] w-[220px] shrink-0 md:block",
        className,
      )}
    />
  )
}
