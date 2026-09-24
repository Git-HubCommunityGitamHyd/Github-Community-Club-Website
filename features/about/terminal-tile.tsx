"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useInView } from "framer-motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

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
 * Exactly six lines: three commands, each with its response, the last of which
 * is the win.
 *
 * The tuple is not decoration. The finished transcript is rendered invisibly
 * to reserve the tile's height (see the note further down), so a variant with
 * a different number of lines would resize the tile when it is picked, and the
 * tile shares a bento row. Six is enforced here rather than remembered.
 *
 * Lines are kept under about fifty characters for the same reason: a line that
 * wraps at some widths and not others reserves a different height at each.
 */
type Script = [Line, Line, Line, Line, Line, Line]

const input = (text: string): Line => ({ kind: "input", text })
const output = (text: string): Line => ({ kind: "output", text })
const success = (text: string): Line => ({ kind: "success", text })

/**
 * Ten sessions a member of this club would actually have.
 *
 * They are deliberately not ten spellings of the same thing. Opening a first
 * pull request, reviewing someone else's, picking up a good-first-issue,
 * cutting a hotfix and reverting a bad deploy are different days, and between
 * them they say more about what the club does than any one of them repeated.
 *
 * Hashes, PR numbers and timings are made up but plausible - a short hash, a
 * PR number in a believable range, a package count that is not a round figure.
 * Round placeholder values are the thing that makes an invented terminal read
 * as invented.
 */
const SCRIPTS: Script[] = [
  [
    input("git switch -c fix/broken-link"),
    output("Switched to a new branch 'fix/broken-link'"),
    input("git commit -am 'fix: dead link in setup guide'"),
    output("[fix/broken-link 8f2a91c] 1 file changed"),
    input("gh pr create --fill"),
    success("✓ Opened pull request #218"),
  ],
  [
    input("gh issue list --label 'good first issue'"),
    output("#63  Add a dark mode toggle to the docs"),
    input("gh issue develop 63 --checkout"),
    output("Switched to a new branch '63-dark-mode-toggle'"),
    input("gh pr create --fill"),
    success("✓ Opened pull request #221"),
  ],
  [
    input("gh pr checkout 204"),
    output("Switched to branch 'feat/event-rsvp'"),
    input("npm test"),
    output("46 passing (2.1s)"),
    input("gh pr review --approve -b 'Reads well, ship it'"),
    success("✓ Approved pull request #204"),
  ],
  [
    input("gh repo fork gcgitam/handbook --clone"),
    output("✓ Cloned fork to ./handbook"),
    input("git switch -c docs/fix-install-steps"),
    output("Switched to a new branch 'docs/fix-install-steps'"),
    input("gh pr create --fill"),
    success("✓ Opened pull request #57"),
  ],
  [
    input("git push -u origin feat/qr-checkin"),
    output("* [new branch]  feat/qr-checkin"),
    input("gh run watch"),
    output("✓ build (20.x) completed in 47s"),
    input("gh pr merge --squash --delete-branch"),
    success("✓ Merged pull request #187"),
  ],
  [
    input("git fetch origin"),
    output("From github.com:gcgitam/site"),
    input("git rebase origin/main"),
    output("Successfully rebased and updated feat/search"),
    input("git push --force-with-lease"),
    success("✓ Pushed 3 commits to feat/search"),
  ],
  [
    input("git stash push -m 'wip: board cards'"),
    output("Saved working directory and index state"),
    input("gh pr checkout 231"),
    output("Switched to branch 'fix/form-validation'"),
    input("gh pr review --comment -b 'Try useId() here'"),
    success("✓ Reviewed pull request #231"),
  ],
  [
    input("git revert --no-edit 9c4d1a2"),
    output("[main 1f80e6b] Revert 'feat: new nav'"),
    input("git push origin main"),
    output("To github.com:gcgitam/site.git"),
    input("gh run watch"),
    success("✓ deploy completed in 1m 12s"),
  ],
  [
    input("git clone git@github.com:gcgitam/site.git"),
    output("Cloning into 'site'..."),
    input("npm install"),
    output("added 412 packages in 14s"),
    input("npm run dev"),
    success("✓ Ready on http://localhost:3000"),
  ],
  [
    input("git switch -c hotfix/rsvp-count main"),
    output("Switched to a new branch 'hotfix/rsvp-count'"),
    input("git cherry-pick 7a2e5d9"),
    output("[hotfix/rsvp-count b31c8f4] fix: rsvp count"),
    input("gh pr create --fill --base main"),
    success("✓ Opened pull request #244"),
  ],
]

/**
 * The block that reserves the tile's height, independent of which script was
 * drawn.
 *
 * Reserving with the chosen script looks right and is not: the server renders
 * SCRIPTS[0] and the client swaps in a random one at hydration, so the moment
 * two variants wrap a different number of lines the tile changes height just
 * after hydration, and it shares a bento row. These lines are the longest of
 * each kind across every script, so the reservation is at least as tall as
 * any variant and is byte-identical on both sides of hydration. It costs some
 * slack at the bottom when a short script is drawn, which is the right trade
 * against a tile that resizes under the reader.
 */
const longestOf = (kind: Line["kind"]) =>
  SCRIPTS.flat()
    .filter((entry) => entry.kind === kind)
    .reduce((a, b) => (b.text.length > a.text.length ? b : a)).text

const RESERVE: Script = [
  input(longestOf("input")),
  output(longestOf("output")),
  input(longestOf("input")),
  output(longestOf("output")),
  input(longestOf("input")),
  success(longestOf("success")),
]

/**
 * Which script this visit gets.
 *
 * Picked on the client, after mount, never during render. This component
 * renders on the server too, and a `Math.random()` read while rendering would
 * give the server and the client different transcripts and throw a hydration
 * mismatch. The first paint is therefore always SCRIPTS[0]; the swap happens
 * on mount, long before the tile is scrolled into view and the typing starts,
 * so nobody sees it change.
 *
 * Module scope rather than per-instance so the pick survives a remount without
 * re-rolling mid-visit.
 */
const NEVER_CHANGES = () => () => {}
const SERVER_INDEX = () => 0

let pickedIndex: number | null = null

function pickScriptIndex() {
  if (pickedIndex === null) {
    pickedIndex = Math.floor(Math.random() * SCRIPTS.length)
  }
  return pickedIndex
}

/** ms per character on an input line. */
const CHAR_MS = 26
/** ms an output line waits before appearing, so it reads as a response. */
const OUTPUT_MS = 260

export function TerminalTile({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" })
  const reducedMotion = useReducedMotion()

  // `useSyncExternalStore` rather than a `setState` in an effect, because that
  // is exactly what its third argument is for: the server snapshot is fixed,
  // the client snapshot is the random pick, and React swaps them after
  // hydration on its own. The subscribe callback is a no-op because this value
  // never changes again once chosen.
  const scriptIndex = useSyncExternalStore(
    NEVER_CHANGES,
    pickScriptIndex,
    SERVER_INDEX,
  )
  const SCRIPT = SCRIPTS[scriptIndex]

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
  }, [inView, reducedMotion, done, line, chars, SCRIPT])

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
        Announcing a terminal character by character is unusable, and there
        is no live information here. The label is built from whichever script
        this visit drew rather than describing one of them, which is the kind
        of thing that silently goes stale.
      */}
      <div
        className="mt-7 flex-1 font-mono text-[12.5px] leading-[1.9] sm:text-[13px]"
        aria-label={`A terminal session: ${SCRIPT.map((entry) => entry.text).join(". ")}`}
        role="img"
      >
        {/*
          A worst-case transcript is rendered invisibly underneath to reserve
          the tile's final height, and the typed copy is laid over it. Without
          this the tile grows a line at a time while it types, and because it
          shares a bento row with the "Start contributing" tile, that tile and
          everything below the grid shifts on every line. Reserving with real
          lines rather than a `min-h` value keeps it exact at any font size or
          wrap; see RESERVE for why it is not the drawn script's own lines.
        */}
        <div aria-hidden="true" className="relative">
          <div className="invisible">
            {RESERVE.map((entry, index) => (
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
