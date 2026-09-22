"use client"

import Image from "next/image"
import { FaGithub, FaLinkedinIn, FaRegEnvelope } from "react-icons/fa6"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

/**
 * The 21st.dev team showcase, rebuilt on this project's stack.
 *
 * Three things changed from the snippet.
 *
 * 1. The socials are the club's — GitHub, LinkedIn and email. There is no
 *    Twitter or Behance to show. They keep the snippet's `react-icons` brand
 *    marks, which are the real GitHub and LinkedIn logos; lucide's equivalents
 *    are generic redrawings and look like approximations beside them. lucide
 *    still owns the plain UI affordances elsewhere — arrows, close, calendar.
 * 2. `<img>` became `next/image`, because these are Cloudinary URLs coming out
 *    of the CMS and the remote host is already configured for the optimiser.
 * 3. The photo grid is no longer a hardcoded three columns. See below.
 */

export type TeamMember = {
  id: string
  name: string
  role: string
  image: string | null
  social?: {
    github?: string
    linkedin?: string
    email?: string
  }
}

/**
 * Per-column presentation.
 *
 * The snippet hardcodes three columns with three different fixed pixel sizes
 * and three different top offsets, which only reads as deliberate when all
 * three are full — with five members the third column is short and with four it
 * looks like a mistake. The club has five today and the CMS lets that change at
 * any time, so the column count is derived from the member count and the
 * columns are fractions of the container rather than fixed widths.
 *
 * The size and offset variation is what stops the grid reading as a plain
 * table, so it is kept — just indexed by column, and only the first `columns`
 * entries are ever used.
 */
const COLUMNS = [
  { basis: "0.94fr", offset: "0rem", aspect: "13 / 14" },
  { basis: "1.06fr", offset: "3.25rem", aspect: "12 / 13" },
  { basis: "1fr", offset: "1.5rem", aspect: "13 / 14" },
]

function columnCount(memberCount: number) {
  return Math.max(1, Math.min(COLUMNS.length, memberCount))
}

export function TeamShowcase({
  members,
  activeId,
  onHover,
  onSelect,
  className,
}: {
  members: TeamMember[]
  activeId: string | null
  onHover: (id: string | null) => void
  onSelect: (member: TeamMember) => void
  className?: string
}) {
  const columns = columnCount(members.length)
  // Round-robin rather than chunking: it keeps the columns within one of each
  // other for every count, so no column is ever left conspicuously short.
  const grid = Array.from({ length: columns }, (_, column) =>
    members.filter((_, index) => index % columns === column),
  )

  return (
    <div
      className={cn(
        "flex w-full select-none flex-col items-start gap-10 md:flex-row md:gap-12 lg:gap-16",
        className,
      )}
    >
      <div
        className="grid w-full shrink-0 gap-3 md:basis-[54%]"
        style={{
          gridTemplateColumns: grid
            .map((_, column) => COLUMNS[column].basis)
            .join(" "),
        }}
      >
        {grid.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col gap-3"
            style={{ marginTop: COLUMNS[columnIndex].offset }}
          >
            {column.map((member) => (
              <PhotoCard
                key={member.id}
                member={member}
                aspect={COLUMNS[columnIndex].aspect}
                activeId={activeId}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </div>

      <ul className="flex w-full flex-1 flex-col gap-5 sm:grid sm:grid-cols-2 md:flex md:flex-col">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            activeId={activeId}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

function PhotoCard({
  member,
  aspect,
  activeId,
  onHover,
  onSelect,
}: {
  member: TeamMember
  aspect: string
  activeId: string | null
  onHover: (id: string | null) => void
  onSelect: (member: TeamMember) => void
}) {
  const isActive = activeId === member.id
  const isDimmed = activeId !== null && !isActive

  return (
    <button
      type="button"
      aria-label={`${member.name} — ${member.role}`}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(member.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(member)}
      style={{ aspectRatio: aspect }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-gray-100 transition duration-300 dark:bg-gh-elevated",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-gh-accent dark:focus-visible:ring-offset-gh-bg",
        isDimmed ? "opacity-55" : "opacity-100",
      )}
    >
      {member.image ? (
        <Image
          src={member.image}
          alt=""
          fill
          sizes="(max-width: 768px) 33vw, 18vw"
          className={cn(
            "object-cover transition duration-500",
            isActive
              ? "scale-105 brightness-100 grayscale-0"
              : "scale-100 brightness-[0.78] grayscale",
          )}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-gray-400 dark:text-gh-muted"
        >
          {initials(member.name)}
        </span>
      )}
    </button>
  )
}

function MemberRow({
  member,
  activeId,
  onHover,
  onSelect,
}: {
  member: TeamMember
  activeId: string | null
  onHover: (id: string | null) => void
  onSelect: (member: TeamMember) => void
}) {
  const isActive = activeId === member.id
  const isDimmed = activeId !== null && !isActive
  const socials = [
    {
      href:
        member.social?.github && `https://github.com/${member.social.github}`,
      icon: FaGithub,
      label: `${member.name} on GitHub`,
    },
    {
      href:
        member.social?.linkedin &&
        `https://linkedin.com/in/${member.social.linkedin}`,
      icon: FaLinkedinIn,
      label: `${member.name} on LinkedIn`,
    },
    {
      href: member.social?.email && `mailto:${member.social.email}`,
      icon: FaRegEnvelope,
      label: `Email ${member.name}`,
    },
  ].filter(
    (social): social is { href: string; icon: IconType; label: string } =>
      Boolean(social.href),
  )

  return (
    <li
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "transition-opacity duration-300",
        isDimmed ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            "h-3 shrink-0 rounded-[5px] transition-all duration-300",
            isActive
              ? "w-5 bg-gh-accent-light dark:bg-gh-accent"
              : "w-4 bg-gray-900/20 dark:bg-gh-text/25",
          )}
        />
        <button
          type="button"
          onClick={() => onSelect(member)}
          onFocus={() => onHover(member.id)}
          onBlur={() => onHover(null)}
          className={cn(
            "rounded text-left text-base font-semibold leading-none tracking-tight transition-colors duration-300 md:text-[18px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light dark:focus-visible:ring-gh-accent",
            isActive
              ? "text-gray-900 dark:text-gh-text"
              : "text-gray-900/80 dark:text-gh-text/80",
          )}
        >
          {member.name}
        </button>

        {socials.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-200",
              isActive
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0",
            )}
          >
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded p-1 text-gray-500 transition hover:bg-gray-900/10 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-light dark:text-gh-muted dark:hover:bg-gh-text/10 dark:hover:text-gh-text dark:focus-visible:ring-gh-accent"
              >
                <social.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 pl-[27px] font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gh-muted">
        {member.role}
      </p>
    </li>
  )
}
