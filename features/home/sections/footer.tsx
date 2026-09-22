import { ArrowUp, MapPin } from "lucide-react"
import { FaGithub, FaInstagram, FaRegEnvelope } from "react-icons/fa6"
import { NAV_ITEMS } from "@/features/home/content"

// The page's own section anchors, plus Join — six entries sit as a tidy
// 2x3 block instead of the five-deep single column that left a hole in
// the bottom-left of the footer grid.
const SECTION_LINKS = [...NAV_ITEMS, "Join"]

const SOCIALS = [
  {
    label: "GitHub organisation",
    href: "https://github.com/Git-HubCommunityGitamHyd",
    Icon: FaGithub,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/github.gitam.hyd",
    Icon: FaInstagram,
  },
  {
    label: "Email us",
    href: "mailto:github.gitamhyd@gmail.com",
    Icon: FaRegEnvelope,
  },
]

export function FooterSection() {
  return (
    // gh-deep, not #000: the footer is the one surface that sits below the
    // page, so it takes the palette's darkest canvas rather than a pure
    // black that belongs to no palette at all. Every grey here is from the
    // same GitHub family the rest of the site uses.
    <footer className="border-t border-gh-border bg-gh-deep text-gh-text">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-12 lg:gap-x-12">
          <div className="md:col-span-5">
            <div className="mb-4 flex items-center gap-2.5">
              <FaGithub className="h-7 w-7" aria-hidden="true" />
              <span className="text-base font-extrabold tracking-tight">
                GitHub Community{" "}
                <span className="font-semibold text-gh-muted">GITAM</span>
              </span>
            </div>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-gh-muted">
              Empowering the next generation of developers through collaboration
              and open source.
            </p>
            {/* Squircles rather than the default icon-circle, and they
                carry the hover/press feedback the old text-only links
                never had. */}
            <ul className="mt-7 flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gh-border bg-gh-surface/60 text-gh-muted transition duration-200 hover:border-gh-accent/60 hover:bg-gh-surface hover:text-gh-accent active:scale-95"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="md:col-span-4" aria-label="Page sections">
            <h2 className="mb-5 font-mono text-[13px] font-bold uppercase tracking-wide text-gh-accent">
              On this page
            </h2>
            {/* Column-major: filling row-major put About/Board/Benefits down
                the first column, so scanning a column skipped every other
                section instead of following the page order. */}
            <ul className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-6 gap-y-3.5">
              {SECTION_LINKS.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="inline-block text-sm text-gh-muted transition duration-200 hover:translate-x-0.5 hover:text-gh-text"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="mb-5 font-mono text-[13px] font-bold uppercase tracking-wide text-gh-accent">
              Contact
            </h2>
            <ul className="flex flex-col gap-3.5 text-sm text-gh-muted">
              <li>
                <a
                  href="mailto:github.gitamhyd@gmail.com"
                  className="inline-flex items-start gap-2.5 transition duration-200 hover:text-gh-text"
                >
                  <FaRegEnvelope
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="underline decoration-gh-border underline-offset-4 transition-colors duration-200 hover:decoration-gh-accent">
                    github.gitamhyd@gmail.com
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>GITAM University, Hyderabad</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Was centred under a left-aligned grid, which read as a stray
            block. Split to the two edges so it closes the same measure the
            columns above it open. */}
        <div className="mt-16 flex flex-col-reverse items-start gap-6 border-t border-gh-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 font-mono text-xs leading-relaxed text-gh-muted">
            <div>© 2026 GitHub Community GITAM. All rights reserved.</div>
            <div>
              <a
                href="https://skfb.ly/oHnR9"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gh-border underline-offset-4 transition-colors duration-200 hover:text-gh-text hover:decoration-gh-accent"
              >
                &quot;GitHub Octocat&quot;
              </a>{" "}
              by pissang is licensed under{" "}
              <a
                href="http://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-gh-border underline-offset-4 transition-colors duration-200 hover:text-gh-text hover:decoration-gh-accent"
              >
                Creative Commons Attribution
              </a>
            </div>
          </div>

          {/* A real anchor, not a scripted button — keeps the footer a
              server component and survives middle-click and keyboard. */}
          <a
            href="#hero"
            className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-gh-border px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-gh-muted transition duration-200 hover:border-gh-accent/60 hover:text-gh-accent active:scale-95"
          >
            Back to top
            <ArrowUp
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
