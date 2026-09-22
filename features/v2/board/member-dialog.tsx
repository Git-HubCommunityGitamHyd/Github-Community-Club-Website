"use client"

import Image from "next/image"
import { FaGithub, FaLinkedinIn, FaRegEnvelope } from "react-icons/fa6"
import type { IconType } from "react-icons"
import type { BoardMember } from "@/lib/db/board-members"
import { DialogShell } from "@/features/v2/dialog-shell"

/**
 * The showcase shows only a face, a name and a role, so the CMS's
 * `description` needs somewhere to live — this is it, opened by clicking either
 * a photo or a name.
 */
export function MemberDialog({
  member,
  onClose,
}: {
  member: BoardMember | null
  onClose: () => void
}) {
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
    >
      {member && (
        <>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gh-elevated">
              {member.image_url && (
                <Image
                  src={member.image_url}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <h3
                id="member-dialog-name"
                className="text-3xl font-extrabold tracking-[-0.02em] text-gray-900 dark:text-gh-text"
              >
                {member.name}
              </h3>
              <p className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gh-accent-light dark:text-gh-accent">
                {member.role}
              </p>
            </div>
          </div>

          <p className="mt-8 text-pretty text-base leading-relaxed text-gray-600 dark:text-gh-muted">
            {member.description}
          </p>

          {socials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gh-border">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light dark:border-gh-border dark:text-gh-text dark:hover:border-gh-muted dark:hover:bg-gh-elevated dark:focus-visible:ring-gh-accent"
                >
                  <social.icon className="h-4 w-4" />
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </DialogShell>
  )
}
