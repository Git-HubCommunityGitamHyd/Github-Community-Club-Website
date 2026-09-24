import type { CSSProperties, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev "Team 2" agents grid, adapted.
 *
 * Kept from the original: the card whose avatar floats half out of its top
 * edge on a raised plate, the lift on hover (card and avatar at different
 * rates, so the avatar reads as sitting on the card rather than printed on
 * it), and the ruled-off footer at the bottom.
 *
 * Changed, and why:
 *
 * - It renders one person, not a hardcoded list of agents with phone numbers.
 *   The grid, the grouping and the data belong to the page using it.
 * - The avatar is a slot. The members page puts the member's avatar in their
 *   profile border there (features/v2/people/member-avatar.tsx); a plain
 *   `<img>` in a grey circle could not carry that.
 * - The whole card, avatar included, opens the profile (a stretched button
 *   on the name). The original's `tel:` and `mailto:` links used a `render`/`nativeButton` Button API
 *   (Base UI's) that the shadcn button in this project does not have, and a
 *   club members page has no phone numbers to show; contact lives in the
 *   profile, one click away.
 * - Colours are the site's GitHub-dark tokens, not shadcn's neutral card
 *   defaults, and the hover shadow is tinted to the page rather than black.
 * - The footer under the rule holds the person's tagline and handle, both
 *   from the CMS, where the original had a "Listed Properties" figure.
 * - The header ("Check out / Agents Grid") is gone: it is the page's job, and
 *   the page already has one.
 */
export function Team2Card({
  avatar,
  name,
  headline,
  tagline,
  handle,
  onOpen,
  glow,
  className,
}: {
  /** Drawn in the floating plate; sized by the caller (96-112px suits it). */
  avatar: ReactNode
  name: string
  headline?: string | null
  /** One line in their own words, under the rule. */
  tagline?: string | null
  /** Shown as "@handle" under the tagline. Pass it without the @. */
  handle?: string | null
  onOpen: () => void
  /**
   * A colour (any CSS colour) the card lights up in on hover: a pool of it
   * from the top, where the avatar sits, and a hairline of it on the border.
   * The members page passes the member's ring colour, so the card and the
   * ring read as one object.
   */
  glow?: string
  className?: string
}) {
  return (
    <div
      style={glow ? ({ "--card-glow": glow } as CSSProperties) : undefined}
      className={cn(
        "group relative pt-14 transition-transform duration-300 ease-out hover:-translate-y-1 has-[button:active]:translate-y-0 has-[button:active]:scale-[0.99]",
        className,
      )}
    >
      <Card className="relative flex h-full flex-col overflow-visible rounded-2xl border-gh-border bg-gh-surface/80 pt-16 text-center shadow-none transition-[border-color,box-shadow] duration-300 group-hover:border-gh-muted/50 group-hover:shadow-[0_18px_40px_-18px_rgba(1,4,9,0.9)] has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-gh-accent has-[button:focus-visible]:ring-offset-4 has-[button:focus-visible]:ring-offset-gh-bg">
        {glow && (
          // Inside the card, not a shadow around it: the light comes from
          // the avatar downwards and fades out before the rule, and the
          // border takes the same colour. Fades in on opacity alone.
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse 85% 65% at 50% 0%, color-mix(in srgb, var(--card-glow) 38%, transparent) 0%, color-mix(in srgb, var(--card-glow) 12%, transparent) 48%, transparent 75%)",
              boxShadow:
                "inset 0 0 0 1px color-mix(in srgb, var(--card-glow) 60%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--card-glow) 80%, transparent)",
            }}
          />
        )}
        {/* The floating plate. Its own lift on hover is on top of the
              card's, so the avatar rises a little further than the card. */}
        <div className="absolute inset-x-0 -top-14 flex justify-center">
          <div className="rounded-full border border-gh-border bg-gh-bg p-1.5 shadow-[0_10px_24px_-12px_rgba(1,4,9,0.9)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
            {avatar}
          </div>
        </div>

        <CardContent className="relative flex flex-1 flex-col p-6 pt-2">
          <h3 className="text-balance text-lg font-semibold leading-snug text-gh-text">
            {/* Stretched over the card and up over the avatar, so the whole
                thing is one target while the markup stays a heading and a
                paragraph rather than block content inside a button. */}
            <button
              type="button"
              onClick={onOpen}
              className="after:absolute after:inset-0 after:-top-14 after:rounded-2xl focus-visible:outline-none"
            >
              {name}
            </button>
          </h3>
          {headline && (
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-gh-muted">
              {headline}
            </p>
          )}
          {(tagline || handle) && (
            <div className="mt-auto pt-6">
              <div className="border-t border-gh-border pt-4">
                {tagline && (
                  <p className="text-pretty text-sm leading-relaxed text-gh-text/90">
                    {tagline}
                  </p>
                )}
                {handle && (
                  <p
                    className={cn(
                      "font-mono text-xs text-gh-muted",
                      tagline && "mt-2",
                    )}
                  >
                    @{handle}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
