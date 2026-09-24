"use client"

import { FaGithub, FaLinkedinIn, FaRegEnvelope } from "react-icons/fa6"
import type { IconType } from "react-icons"
import type { ReactNode } from "react"
import { DialogShell } from "@/features/site/dialog-shell"
import { boardAccent } from "@/features/board/accents"
import { initialsOf } from "@/components/ui/avatar-circles"
import { MemberAvatar } from "@/features/people/member-avatar"
import { displayHandle, type Profile } from "@/features/people/profile"

/**
 * A person's profile: a board member from the board section, or someone
 * tagged on a project. The coming members page opens this same dialog, which
 * is why it takes a `Profile` rather than either table's row. `children` is
 * for context that belongs to where it was opened from, such as what they did
 * on the project being viewed.
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
  "inline-flex items-center gap-2 rounded-full border border-gh-border px-4 py-2 text-sm font-medium text-gh-text transition hover:border-gh-muted hover:bg-gh-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"

export function ProfileDialog({
  member,
  onClose,
  children,
  after,
  perchMascot = false,
}: {
  member: Profile | null
  onClose: () => void
  /** Above the bio: context from where it was opened. */
  children?: ReactNode
  /** Below the bio, above the links. */
  after?: ReactNode
  /** Calls the page's octocat over to sit on the popup while it is open. */
  perchMascot?: boolean
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
      perchMascot={perchMascot}
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
              className="pointer-events-none absolute -top-6 right-4 select-none text-[140px] font-extrabold leading-none tracking-[-0.06em] text-gh-text/[0.05]"
            >
              {initialsOf(member.name)}
            </span>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <MemberAvatar person={member} size={128} spin="always" />

              <div className="min-w-0">
                <h3
                  id="member-dialog-name"
                  className="text-balance text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-gh-text"
                >
                  {member.name}
                </h3>
                {(member.team_name || member.role) && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    {member.team_name && (
                      <span className="rounded-full border border-gh-accent/40 bg-gh-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gh-accent">
                        {member.team_name} team
                      </span>
                    )}
                    {member.role && (
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gh-muted">
                        {member.role}
                      </span>
                    )}
                  </p>
                )}
                {displayHandle(member) && (
                  <p className="mt-2 font-mono text-sm text-gh-muted">
                    @{displayHandle(member)}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="border-t border-gh-border px-8 py-8 sm:px-10">
            {children}
            {member.tagline && (
              <p className="mb-4 text-pretty text-lg font-medium leading-snug text-gh-text">
                {member.tagline}
              </p>
            )}
            {member.description && (
              <p className="max-w-[58ch] text-pretty text-base leading-relaxed text-gh-muted">
                {member.description}
              </p>
            )}
            {after}

            {socials.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3 first:mt-0">
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
