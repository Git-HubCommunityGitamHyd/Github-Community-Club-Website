"use client"

import type { IconType } from "react-icons"
import {
  SiDocker,
  SiFigma,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si"
import { InfiniteSlider } from "@/components/ui/infinite-slider"

/**
 * The tools the club actually teaches and builds with.
 *
 * The snippet fed its marquee remote SVGs from a third-party CDN. Those are
 * someone else's uptime, another origin to allow in `next.config.js`, and they
 * arrive as flat black bitmap-ish marks that need `dark:brightness-0 invert` to
 * survive dark mode — which is exactly the hack that makes a logo wall look
 * cheap. `react-icons/si` is Simple Icons, already a dependency, vector, one
 * stroke weight, and it inherits `currentColor`, so both themes come free and
 * nothing is fetched at runtime.
 */
const TOOLS: { icon: IconType; label: string }[] = [
  { icon: SiGit, label: "Git" },
  { icon: SiGithub, label: "GitHub" },
  { icon: SiGithubactions, label: "Actions" },
  { icon: SiTypescript, label: "TypeScript" },
  { icon: SiReact, label: "React" },
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiNodedotjs, label: "Node" },
  { icon: SiPython, label: "Python" },
  { icon: SiDocker, label: "Docker" },
  { icon: SiLinux, label: "Linux" },
  { icon: SiTailwindcss, label: "Tailwind" },
  { icon: SiFigma, label: "Figma" },
]

export function ToolMarquee() {
  return (
    <div className="relative">
      <p className="mb-8 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gh-muted">
        What we build with
      </p>

      {/* The fade is a mask rather than two gradient overlays, so it works over
          whatever this section's background happens to be instead of having to
          be recoloured per theme. `mask-image` needs the -webkit- pair for
          Safari; Tailwind v3 has no `mask-*` utility, so it is inline. */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <InfiniteSlider gap={72} duration={48} durationOnHover={140} reverse>
          {TOOLS.map((tool) => (
            <div
              key={tool.label}
              className="flex shrink-0 items-center gap-3.5 text-gray-400 transition-colors duration-300 hover:text-gray-900 dark:text-gh-muted dark:hover:text-gh-text"
            >
              <tool.icon
                aria-hidden="true"
                className="h-8 w-8 md:h-10 md:w-10"
              />
              <span className="whitespace-nowrap text-lg font-semibold tracking-[-0.01em] md:text-xl">
                {tool.label}
              </span>
            </div>
          ))}
        </InfiniteSlider>
      </div>

      {/* The marquee is decoration; the list itself is the content, so it is
          also available to a screen reader in one readable sentence. */}
      <p className="sr-only">
        Tools we work with: {TOOLS.map((tool) => tool.label).join(", ")}.
      </p>
    </div>
  )
}
