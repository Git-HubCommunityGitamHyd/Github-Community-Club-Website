"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const PALETTE = ["#b3410c", "#2ea043", "#a68b00", "#2f7f9e", "#3fb950"]
const FLIP_COLOR = "#3fb950"
const CELL = 64

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

// Grid of squares behind the Join CTA. Sized to exactly cover its container
// (no auto-fill/centering void), flips whichever cell is under the cursor —
// tracked at the section level so it keeps flipping even while the cursor is
// over the CTA card or its overlay, not just a bare square — and reshuffles
// its colors each time the section scrolls fully out of view.
export function JoinSquares() {
  const rootRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const colsRef = useRef(0)
  const wasInView = useRef(false)
  const [grid, setGrid] = useState<{ cols: number; colors: string[] }>({
    cols: 0,
    colors: [],
  })

  const regenerate = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const { width, height } = root.getBoundingClientRect()
    const cols = Math.max(1, Math.ceil(width / CELL))
    const rows = Math.max(1, Math.ceil(height / CELL))
    colsRef.current = cols
    setGrid({ cols, colors: Array.from({ length: cols * rows }, randomColor) })
  }, [])

  useLayoutEffect(() => {
    regenerate()
    const resizeObserver = new ResizeObserver(() => regenerate())
    if (rootRef.current) resizeObserver.observe(rootRef.current)
    return () => resizeObserver.disconnect()
  }, [regenerate])

  useEffect(() => {
    const section = rootRef.current?.closest("section")
    if (!section) return
    const onMove = (e: MouseEvent) => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return
      const index =
        Math.floor(y / CELL) * colsRef.current + Math.floor(x / CELL)
      const cell = cellRefs.current[index]
      if (cell) cell.style.transform = "rotateX(180deg)"
    }
    section.addEventListener("mousemove", onMove)
    return () => section.removeEventListener("mousemove", onMove)
  }, [])

  useEffect(() => {
    const section = rootRef.current?.closest("section")
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wasInView.current = true
        } else if (wasInView.current) {
          cellRefs.current.forEach((cell) => {
            if (cell) cell.style.transform = "rotateX(0deg)"
          })
          regenerate()
          wasInView.current = false
        }
      },
      { threshold: 0 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [regenerate])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-0 grid overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, ${CELL}px)`,
        gridAutoRows: `${CELL}px`,
      }}
      aria-hidden="true"
    >
      {grid.colors.map((color, i) => (
        <div key={i} className="h-16 w-16" style={{ perspective: 220 }}>
          <div
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(0deg)",
              transitionProperty: "transform",
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              transitionDuration: "850ms",
              transitionDelay: `${(i * 37) % 320}ms`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden", background: color }}
            />
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
                background: FLIP_COLOR,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
