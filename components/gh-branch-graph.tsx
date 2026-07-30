"use client"

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion"

const BRANCHES = [
  { d: "M270,500 C270,420 250,380 250,300", width: 2.5, delay: 0 },
  { d: "M270,500 C280,460 290,440 285,410", width: 1.5, delay: 0.2 },
  { d: "M250,300 C250,220 230,180 230,100", width: 2.5, delay: 0.4 },
  { d: "M250,300 C200,280 150,250 120,190", width: 2, delay: 0.6 },
  { d: "M250,300 C270,260 290,230 280,190", width: 1.5, delay: 0.8 },
  { d: "M120,190 C100,150 90,130 70,90", width: 1.5, delay: 1.0 },
  { d: "M120,190 C140,155 165,135 190,115", width: 1.5, delay: 1.1 },
  { d: "M230,100 C210,70 190,55 160,45", width: 2, delay: 1.3 },
  { d: "M230,100 C245,75 260,65 270,50", width: 1.5, delay: 1.5 },
]

const NODES = [
  { cx: 270, cy: 500, r: 5, delay: 0.3 },
  { cx: 285, cy: 410, r: 3, delay: 0.9 },
  { cx: 250, cy: 300, r: 5, delay: 1.1 },
  { cx: 280, cy: 190, r: 3, delay: 1.5 },
  { cx: 120, cy: 190, r: 4, delay: 1.4 },
  { cx: 70, cy: 90, r: 3, delay: 1.8 },
  { cx: 190, cy: 115, r: 3, delay: 1.9 },
  { cx: 230, cy: 100, r: 5, delay: 1.6 },
  { cx: 270, cy: 50, r: 3, delay: 2.3 },
  { cx: 160, cy: 45, r: 4, delay: 2.1 },
]

// Decorative git-graph in the hero — draws in on mount, then fades/blurs
// as the page scrolls past it so it doesn't fight with content below.
export function GhBranchGraph() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [0.9, 0.3])
  const blur = useTransform(scrollY, [0, 500], [0, 8])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{ opacity, filter }}
      className="pointer-events-none absolute bottom-0 right-0 z-0 hidden h-[460px] w-[300px] sm:block"
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 500"
        fill="none"
        className="overflow-visible"
      >
        {BRANCHES.map((b) => (
          <motion.path
            key={b.d}
            d={b.d}
            stroke="currentColor"
            strokeWidth={b.width}
            strokeLinecap="round"
            className="text-gray-300 dark:text-gh-elevated"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: b.delay }}
          />
        ))}
        {NODES.map((n) => (
          <motion.circle
            key={`${n.cx}-${n.cy}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            className="fill-[#1a7f37] dark:fill-[#3fb950]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.4, delay: n.delay }}
          />
        ))}
      </svg>
    </motion.div>
  )
}
