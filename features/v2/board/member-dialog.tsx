"use client"

import Image from "next/image"
import { FaGithub, FaLinkedinIn, FaRegEnvelope } from "react-icons/fa6"
import type { IconType } from "react-icons"
import type { BoardMember } from "@/lib/db/board-members"
import { DialogShell } from "@/features/v2/dialog-shell"
import { boardAccent } from "@/features/v2/board/accents"

/**
 * A board member's profile.
 *
 * The old panel was a 112px square photo, a name, a role, a paragraph, a rule
 * and three pill links — a contact card, and a flat one. Nothing on it
 * belonged to the person it was about; swap the photo and the name and it was
 * the same object.
 *
 * Now the top of the panel is theirs. The photo sits in a rotating conic ring
 * whose colours come from their own row in the CMS (`accent`), on a plate
 * tinted by the same colour, over a masked dot field and their initials set
 * huge and nearly invisible behind it all. Six people open six visibly
 * different panels, without six colours ever appearing on the page at once —
 * only one is on screen at a time.
 *
 * The ring rotates as an element rather than by animating the gradient itself.
 * Animating a conic-gradient's angle needs `@property` to register the custom
 * property as an angle, which Firefox only shipped recently; rotating a
 * transform is compositor work and has always worked.
 */

const SOCIAL_LABEL =
  "inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light dark:border-gh-border dark:text-gh-text dark:hover:border-gh-muted dark:hover:bg-gh-elevated dark:focus-visible:ring-gh-accent"

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function MemberDialog({
  member,
  onClose,
}: {
  member: BoardMember | null
  onClose: () => void
}) {
  const accent = boardAccent(member?.accent)

  const socials = member
    ? [
        {
          href: member.github && `https://github.com/${member.github}`,
          icon: FaGithub,
          label: "GitHub",
        },
        {
          href: member.linkedin && `https://linkedin.com/in/${member.linkedin}`,
          icon: FaLinkedinIn,
          label: "LinkedIn",
        },
        {
          href: member.email && `mailto:${member.email}`,
          icon: FaRegEnvelope,
          label: "Email",
        },
      ].filter(
        (social): social is { href: string; icon: IconType; label: string } =>
          Boolean(social.href),
      )
    : []

  return (
    <DialogShell
      open={member !== null}
      onClose={onClose}
      labelledBy="member-dialog-name"
      bleed
    >
      {member && (
        <>
          <header className="relative overflow-hidden px-8 pb-8 pt-10 sm:px-10">
            {/* Their colour, as a soft plate rather than a fill. At 22% alpha
                behind a photo it tints the panel without becoming a coloured
                header band, which would put a second accent on the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 70% 130% at 18% 0%, ${accent.glow} 0%, transparent 68%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "20px 20px",
                color: "rgba(140,149,159,0.28)",
                maskImage:
                  "radial-gradient(ellipse 80% 120% at 85% 20%, black 0%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 120% at 85% 20%, black 0%, transparent 70%)",
              }}
            />
            {/* Their initials, oversized and almost invisible. Gives the panel
                a piece of typography that is specific to the person, which is
                what the old header had none of. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 right-4 select-none text-[140px] font-extrabold leading-none tracking-[-0.06em] text-gray-900/[0.05] dark:text-gh-text/[0.05]"
            >
              {initialsOf(member.name)}
            </span>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* `overflow-hidden` is load-bearing: the conic layer is inset by -45%
                  so that rotating it never sweeps an empty corner through the ring,
                  which means it is far larger than this box and has to be clipped
                  to it. Without the clip the gradient spills a green wedge across
                  the whole panel. */}
              <span className="relative block size-32 shrink-0 overflow-hidden rounded-3xl p-[3px]">
                <span
                  aria-hidden="true"
                  className="board-ring absolute inset-[-45%]"
                  style={{
                    background: `conic-gradient(from 0deg, ${accent.stops.join(", ")})`,
                  }}
                />
                <span className="relative block h-full w-full overflow-hidden rounded-[21px] bg-white dark:bg-gh-surface">
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-gray-300 dark:text-gh-border">
                      {initialsOf(member.name)}
                    </span>
                  )}
                </span>
              </span>

              <div className="min-w-0">
                <h3
                  id="member-dialog-name"
                  className="text-balance text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-gray-900 dark:text-gh-text"
                >
                  {member.name}
                </h3>
                <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gh-accent-light dark:text-gh-accent">
                  {member.role}
                </p>
                {member.github && (
                  <p className="mt-2 font-mono text-sm text-gray-400 dark:text-gh-muted">
                    @{member.github}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="border-t border-gray-200 px-8 py-8 dark:border-gh-border sm:px-10">
            <p className="max-w-[58ch] text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted">
              {member.description}
            </p>

            {socials.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={SOCIAL_LABEL}
                  >
                    <social.icon className="h-4 w-4" />
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DialogShell>
  )
}
