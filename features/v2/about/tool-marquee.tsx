"use client"

import type { IconType } from "react-icons"
import {
  SiCloudflare,
  SiCockroachlabs,
  SiDocker,
  SiFigma,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGooglecloud,
  SiHuggingface,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPytorch,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
} from "react-icons/si"
import { AwsIcon } from "@/features/v2/about/aws-icon"
import { cn } from "@/lib/utils"
import { InfiniteSlider } from "@/components/ui/infinite-slider"

/**
 * The tools the club actually teaches and builds with.
 *
 * The snippet fed its marquee remote SVGs from a third-party CDN. Those are
 * someone else's uptime, another origin to allow in `next.config.js`, and they
 * arrive as flat black bitmap-ish marks that need a `brightness-0 invert`
 * filter to survive a dark page, which is exactly the hack that makes a logo
 * wall look
 * cheap. `react-icons/si` is Simple Icons, already a dependency, vector, one
 * stroke weight, and it inherits `currentColor`, so both themes come free and
 * nothing is fetched at runtime.
 */
/*
 * Grouped rather than shuffled. A marquee is read in sequence, so neighbours
 * should belong together: version control, then languages, then the web stack,
 * mobile, data, machine learning, infrastructure, and design last. Twenty-four
 * names arriving in no order reads as a dump; in runs it reads as a stack.
 */
const TOOLS: {
  icon: IconType
  label: string
  /** A wordmark rather than a glyph: sized by height, not boxed square. */
  wide?: boolean
}[] = [
  { icon: SiGit, label: "Git" },
  { icon: SiGithub, label: "GitHub" },
  { icon: SiGithubactions, label: "Actions" },

  { icon: SiTypescript, label: "TypeScript" },
  { icon: SiPython, label: "Python" },

  { icon: SiReact, label: "React" },
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiNodedotjs, label: "Node" },
  { icon: SiTailwindcss, label: "Tailwind" },

  { icon: SiFlutter, label: "Flutter" },

  { icon: SiPostgresql, label: "Postgres" },
  { icon: SiMongodb, label: "MongoDB" },
  { icon: SiSupabase, label: "Supabase" },
  // Simple Icons carries the company mark, Cockroach Labs, not a separate one
  // for the database. The label is the product, which is what anyone reading
  // the marquee is looking for.
  { icon: SiCockroachlabs, label: "CockroachDB" },

  { icon: SiTensorflow, label: "TensorFlow" },
  { icon: SiPytorch, label: "PyTorch" },
  { icon: SiHuggingface, label: "Hugging Face" },

  { icon: SiDocker, label: "Docker" },
  { icon: SiLinux, label: "Linux" },
  { icon: SiCloudflare, label: "Cloudflare" },
  { icon: SiVercel, label: "Vercel" },
  { icon: SiGooglecloud, label: "Google Cloud" },
  { icon: AwsIcon, label: "AWS", wide: true },

  { icon: SiFigma, label: "Figma" },
  { icon: SiFramer, label: "Framer" },
]

export function ToolMarquee() {
  return (
    <div className="relative">
      <p className="mb-8 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gh-muted">
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
        {/* Twice the names means twice the distance, and InfiniteSlider
            covers one copy of the list in `duration` seconds regardless of how
            wide that copy is. Left at 48 the marquee would simply run twice as
            fast; these are doubled to hold the original speed. */}
        <InfiniteSlider gap={72} duration={96} durationOnHover={280} reverse>
          {TOOLS.map((tool) => (
            <div
              key={tool.label}
              className="flex shrink-0 items-center gap-3.5 text-gh-muted transition-colors duration-300 hover:text-gh-text"
            >
              {/* Square for glyphs, height-only for wordmarks. Forcing a
                  wordmark into the glyphs' square box letterboxes it and it
                  reads as the one small logo in the row. */}
              <tool.icon
                aria-hidden="true"
                className={cn(
                  "h-8 md:h-10",
                  tool.wide ? "w-auto" : "w-8 md:w-10",
                )}
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
