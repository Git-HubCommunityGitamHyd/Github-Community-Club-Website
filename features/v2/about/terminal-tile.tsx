"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"

/**
 * The dark tile in the about bento.
 *
 * What was here before was an eyebrow, the word "Innovation" and one line of
 * mono description — a label with nothing underneath it. Every other tile in
 * the grid carries something a reader can take away (a number, a claim, a
 * button); this one asserted a value and stopped, which is why it read as
 * filler next to them.
 *
 * It is a terminal now, running the exact sequence a first-time contributor
 * goes through at a workshop: branch, commit, push, pull request opened. That
 * is the same claim the old tile was making, except shown rather than stated,
 * and it is specific to this club in a way that the word "Innovation" was not.
 *
 * It also settles the dark tile's presence. A dark panel inside a light bento
 * needs a reason, or it reads as a stray section pasted in; a terminal is the
 * one surface everybody already expects to be dark, so the tile now explains
 * its own colour.
 *
 * The typing runs once, on entry, and then stops with a blinking cursor. A
 * looping terminal in the middle of a page is a distraction that never
 * resolves — you cannot read past it because it keeps restarting.
 */

type Line = {
  kind: "input" | "output" | "success"
  text: string
}

/**
 * Deliberately a real, working sequence with plausible output — a made-up
 * short hash and a plausible PR number rather than round placeholder values.
 */
const SCRIPT: Line[] = [
  { kind: "input", text: "git switch -c fix/broken-link" },
  { kind: "output", text: "Switched to a new branch 'fix/broken-link'" },
  { kind: "input", text: "git commit -am 'fix: dead link in setup guide'" },
  { kind: "output", text: "[fix/broken-link 8f2a91c] 1 file changed" },
  { kind: "input", text: "gh pr create --fill" },
  { kind: "success", text: "✓ Opened pull request #218" },
]

/** ms per character on an input line. */
const CHAR_MS = 26
/** ms an output line waits before appearing, so it reads as a response. */
const OUTPUT_MS = 260

export function TerminalTile({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" })
  const reducedMotion = useReducedMotion()

  // How far through the script we are: which line, and how much of it.
  const [typed, setTyped] = useState(0)
  const [chars, setChars] = useState(0)

  // Reduced motion gets the finished transcript, not a frozen empty box: the
  // content is the point and the typing is decoration. Derived rather than
  // pushed into state by an effect, so there is no render where the box is
  // empty and no second pass to correct it.
  const line = reducedMotion ? SCRIPT.length : typed
  const done = line >= SCRIPT.length

  useEffect(() => {
    if (!inView || reducedMotion || done) return

    const current = SCRIPT[line]
    const isInput = current.kind === "input"

    // Output lines land whole. Watching a machine "type" its own response is
    // the tell that makes a fake terminal look fake.
    if (!isInput) {
      const id = window.setTimeout(() => setTyped((n) => n + 1), OUTPUT_MS)
      return () => window.clearTimeout(id)
    }

    if (chars >= current.text.length) {
      const id = window.setTimeout(() => {
        setTyped((n) => n + 1)
        setChars(0)
      }, 420)
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => setChars((n) => n + 1), CHAR_MS)
    return () => window.clearTimeout(id)
  }, [inView, reducedMotion, done, line, chars])

  const visible = SCRIPT.slice(0, line)
  const typing = done ? null : SCRIPT[line]

  return (
    <div ref={ref} className="relative z-10 flex h-full flex-col">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-gh-accent shadow-[0_0_10px_rgba(63,185,80,0.8)]"
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          {label}
        </span>
      </div>

      {/*
        The whole transcript is exposed to assistive tech as one static block.
        Announcing a terminal character by character is unusable, and there is
        no live information here — it is the same six lines every time.
      */}
      <div
        className="mt-7 flex-1 font-mono text-[12.5px] leading-[1.9] sm:text-[13px]"
        aria-label="A first pull request, from branch to merge: git switch, git commit, gh pr create, pull request 218 opened."
        role="img"
      >
        {/*
          The finished transcript is rendered invisibly underneath to reserve
          the tile's final height, and the typed copy is laid over it. Without
          this the tile grows a line at a time while it types, and because it
          shares a bento row with the "Start contributing" tile, that tile —
          and everything below the grid — shifts on every line. Reserving with
          the real content rather than a `min-h` value keeps it exact at any
          font size or wrap.
        */}
        <div aria-hidden="true" className="relative">
          <div className="invisible">
            {SCRIPT.map((entry, index) => (
              <TerminalLine key={index} line={entry} />
            ))}
            <p>
              <Cursor />
            </p>
          </div>

          <div className="absolute inset-0">
            {visible.map((entry, index) => (
              <TerminalLine key={index} line={entry} />
            ))}

            {typing && (
              <TerminalLine
                line={
                  typing.kind === "input"
                    ? { kind: "input", text: typing.text.slice(0, chars) }
                    : { kind: typing.kind, text: "" }
                }
                cursor
              />
            )}

            {done && (
              <p className="text-gh-accent">
                <Cursor />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TerminalLine({ line, cursor }: { line: Line; cursor?: boolean }) {
  if (line.kind === "input") {
    return (
      <p className="text-gray-100">
        <span className="mr-2 select-none text-gh-accent">$</span>
        {line.text}
        {cursor && <Cursor />}
      </p>
    )
  }

  return (
    <p
      className={
        line.kind === "success" ? "text-gh-accent" : "pl-4 text-gray-500"
      }
    >
      {line.text}
    </p>
  )
}

/** A block cursor, not a bar — this is meant to read as a terminal, not an input. */
function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="terminal-cursor ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-gh-accent"
    />
  )
}
