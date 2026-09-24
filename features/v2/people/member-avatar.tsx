import Image from "next/image"
import { Identicon } from "@/components/ui/identicon"
import { boardAccent } from "@/features/v2/board/accents"
import {
  identiconColor,
  profilePhoto,
  type Profile,
} from "@/features/v2/people/profile"
import { cn } from "@/lib/utils"

/**
 * Someone's avatar inside their profile border: the conic ring whose colours
 * are their `accent` key from the CMS. One component for the members grid,
 * the profile popup and the CMS preview, so the border an admin picks is the
 * border the page draws.
 *
 * `spin` controls the ring. "always" is for the popup, where one person is
 * on screen. "hover" is for grids: twenty rings turning at once is noise and
 * twenty compositor animations, so a card's ring turns only while that card
 * is hovered (it needs a `group` ancestor). "never" is for small sizes.
 *
 * `overflow-hidden` on the outer circle is load-bearing: the conic layer is
 * inset by -45% so rotating it never sweeps an empty corner through the
 * ring, which makes it much larger than the circle and it has to be clipped.
 */
export function MemberAvatar({
  person,
  size,
  spin = "never",
  priority = false,
  className,
}: {
  person: Pick<Profile, "name" | "image_url" | "accent">
  /** Rendered diameter in px, used for the image request. */
  size: number
  spin?: "always" | "hover" | "never"
  priority?: boolean
  className?: string
}) {
  const accent = boardAccent(person.accent)
  const src = profilePhoto(person)
  // The ring's thickness scales with the avatar, within limits, so a 40px
  // face does not get a 4px ring and a 160px one a hairline.
  const ring = Math.max(2, Math.min(5, Math.round(size / 32)))

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size, padding: ring }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-[-45%]",
          spin === "always" && "board-ring",
          spin === "hover" &&
            "board-ring [animation-play-state:paused] group-hover:[animation-play-state:running] group-focus-visible:[animation-play-state:running]",
        )}
        style={{
          background: `conic-gradient(from 0deg, ${accent.stops.join(", ")})`,
        }}
      />
      {/* The gap between ring and avatar is the page background, so the ring
          reads as a border around the picture rather than a disc behind it. */}
      <span className="relative block h-full w-full overflow-hidden rounded-full bg-gh-bg p-[3px]">
        <span className="relative block h-full w-full overflow-hidden rounded-full bg-gh-elevated">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes={`${size}px`}
              priority={priority}
              className="object-cover"
            />
          ) : (
            <Identicon
              seed={person.name}
              color={identiconColor(person)}
              className="p-[20%]"
            />
          )}
        </span>
      </span>
    </span>
  )
}
