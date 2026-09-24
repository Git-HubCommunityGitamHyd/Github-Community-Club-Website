"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogShell } from "@/features/site/dialog-shell"
import { cn } from "@/lib/utils"

const CONFLICTS = [
  "<<<<<<< HEAD",
  "=======",
  ">>>>>>> main",
  "<<<<<<< yours",
  ">>>>>>> theirs",
]

const DECOYS = [
  "git push --force",
  'console.log("here")',
  "// TODO: fix later",
  "rm -rf node_modules",
  "npm i --legacy-peer-deps",
  "works on my machine",
  "fix: fix the fix",
  "sudo !!",
  "git commit -m 'final'",
  "git commit -m 'final2'",
  "// do not touch",
  "catch (e) {}",
]

// Said after each "Verify". The last one ends the puzzle.
const VERDICTS = [
  "Incorrect. Please try again.",
  "Closer. Some of those squares were merged while you were selecting.",
  "Verification failed successfully. Our records show you never had a password to forget.",
]

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Nine tiles, three or four of them conflict markers. */
function deal(): string[] {
  const conflicts = shuffle(CONFLICTS).slice(0, 3 + Math.round(Math.random()))
  return shuffle([
    ...conflicts,
    ...shuffle(DECOYS).slice(0, 9 - conflicts.length),
  ])
}

/**
 * The decoy's "Forgot password?": a CAPTCHA asking for every square with a
 * merge conflict in it. No answer is right. The tiles reshuffle after every
 * try, and the third try closes the matter.
 */
export function MergeConflictCaptcha({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [tiles, setTiles] = useState<string[]>([])
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [round, setRound] = useState(0)
  const [prevOpen, setPrevOpen] = useState(false)

  // Dealt when the dialog opens, never during render on the server, so the
  // random layout cannot cause a hydration mismatch.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setTiles(deal())
      setPicked(new Set())
      setRound(0)
    }
  }

  const finished = round >= VERDICTS.length

  function toggle(i: number) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function verify() {
    setRound((r) => r + 1)
    setTiles(deal())
    setPicked(new Set())
  }

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      labelledBy="hp-captcha-title"
      panelClassName="max-w-md"
      bleed
    >
      <div className="rounded-t-lg bg-[#1f6feb] px-5 py-4 text-white">
        <p className="text-sm">Select every square containing a</p>
        <p id="hp-captcha-title" className="text-2xl font-semibold">
          merge conflict
        </p>
        <p className="mt-1 text-xs text-white/80">
          Required to reset an admin password.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 bg-gh-bg p-1.5">
        {tiles.map((tile, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            disabled={finished}
            aria-pressed={picked.has(i)}
            onClick={() => toggle(i)}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-sm bg-gh-surface p-2 text-center font-mono text-[11px] leading-snug text-gh-text transition-transform sm:text-xs",
              picked.has(i) && "scale-[0.88] ring-2 ring-[#1f6feb]",
              finished && "opacity-50",
            )}
          >
            {tile}
            {picked.has(i) && (
              <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f6feb]">
                <Check aria-hidden="true" className="h-3.5 w-3.5 text-white" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-gh-border px-5 py-4">
        <p role="status" className="text-sm text-gh-muted">
          {round > 0 ? VERDICTS[round - 1] : "Take your time. We are."}
        </p>
        {finished ? (
          <Button onClick={onClose}>Fair enough</Button>
        ) : (
          <Button onClick={verify}>Verify</Button>
        )}
      </div>
    </DialogShell>
  )
}
