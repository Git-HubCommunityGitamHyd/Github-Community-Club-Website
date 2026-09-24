"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MergeConflictCaptcha } from "@/features/honeypot/captcha"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

const GhMascot3D = dynamic(
  () => import("@/features/mascot/gh-mascot-3d").then((m) => m.GhMascot3D),
  { ssr: false },
)

/** Tries before the decoy "lets them in". */
const TRIES = 5

// Shown after failed tries 1 to 4. The first is what a real login says, so
// the joke only lands once they are committed.
const ERRORS = [
  "Invalid username or password.",
  "fatal: Authentication failed for 'admin'.",
  "! [rejected] password -> admin (non-fast-forward). hint: your guess is behind the real one.",
  "CONFLICT (content): Merge conflict in password.txt. Automatic login failed; fix conflicts and then commit the result.",
]

const BUSY = [
  "Signing in",
  "Checking again",
  "Asking a maintainer",
  "Running git bisect on your password",
  "Almost there",
]

const TERMINAL = [
  { text: "$ git clone admin@github-community:cms.git", tone: "text-gh-text" },
  { text: "Cloning into 'cms'...", tone: "text-gh-muted" },
  { text: "remote: Enumerating objects: 1337, done.", tone: "text-gh-muted" },
  {
    text: "remote: Counting members: 100% (1337/1337), done.",
    tone: "text-gh-muted",
  },
  { text: "Receiving objects:  97% (1297/1337)", tone: "text-gh-muted" },
  { text: "Receiving objects:  99% (1336/1337)", tone: "text-gh-muted" },
  { text: "Receiving objects:  99% (1336/1337)", tone: "text-gh-muted" },
  { text: "Receiving objects:  99% (1336/1337)", tone: "text-gh-muted" },
  { text: "error: RPC failed; HTTP 418 I'm a teapot", tone: "text-red-400" },
  { text: "fatal: the remote end hung up, laughing", tone: "text-red-400" },
]

type Stage = "login" | "granted" | "caught"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** A stable fake commit hash for the blame card, from the visitor's IP. */
function shortHash(seed: string) {
  let h = 0x811c9dc5
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193)
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7)
}

/**
 * The octocat, watching. Its eyes follow the cursor, it looks politely away
 * while the password field has focus, and it spins when `spinKey` changes.
 */
function Watcher({
  lookAway,
  spinKey,
  className,
}: {
  lookAway: boolean
  spinKey: number
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const spinRef = useRef(false)
  const away = useRef(lookAway)

  useEffect(() => {
    away.current = lookAway
    if (lookAway) pointerRef.current = { x: 1, y: -0.9 }
  }, [lookAway])

  useEffect(() => {
    if (spinKey > 0) spinRef.current = true
  }, [spinKey])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (away.current || !box.current) return
      const r = box.current.getBoundingClientRect()
      const clamp = (v: number) => Math.max(-1, Math.min(1, v))
      pointerRef.current = {
        x: clamp(
          (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2),
        ),
        y: clamp(
          (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2),
        ),
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={cn("h-[144px] w-[180px]", className)}
    >
      <GhMascot3D pointerRef={pointerRef} spinRef={spinRef} rimIntensity={3} />
    </div>
  )
}

function LoginCard({
  onGranted,
  onFocusPassword,
}: {
  onGranted: (usernames: string[]) => void
  onFocusPassword: (focused: boolean) => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [tries, setTries] = useState(0)
  const [usernames, setUsernames] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captcha, setCaptcha] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const n = tries + 1
    setBusy(true)
    setError(null)
    const started = Date.now()
    try {
      // Only the username is sent. The password never leaves this tab.
      await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
    } catch {
      // Offline or blocked: the decoy carries on regardless.
    }
    // Each try takes longer than the last.
    await wait(Math.max(0, 400 + n * 450 - (Date.now() - started)))
    const tried = username.trim() ? [...usernames, username.trim()] : usernames
    setUsernames(tried)
    setTries(n)
    setPassword("")
    setBusy(false)
    if (n >= TRIES) {
      onGranted(tried)
    } else {
      setError(ERRORS[n - 1])
    }
  }

  const field =
    "w-full rounded-md border border-gh-border bg-gh-bg px-3 py-2 text-sm text-gh-text focus:border-gh-accent focus:outline-none focus:ring-1 focus:ring-gh-accent"

  return (
    <div className="w-full max-w-sm rounded-xl border border-gh-border bg-gh-surface p-7 shadow-[0_24px_60px_-30px_rgba(1,4,9,0.9)]">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-gh-text">Admin console</h1>
        <p className="mt-1 text-sm text-gh-muted">
          GitHub Community GITAM. Staff only.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="hp-user"
            className="mb-1 block text-sm font-medium text-gh-muted"
          >
            Username
          </label>
          <input
            id="hp-user"
            name="hp-user"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label
              htmlFor="hp-pass"
              className="block text-sm font-medium text-gh-muted"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setCaptcha(true)}
              className="-my-2 py-2 text-xs text-gh-accent hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="hp-pass"
            name="hp-pass"
            type="password"
            autoComplete="off"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => onFocusPassword(true)}
            onBlur={() => onFocusPassword(false)}
            className={field}
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs leading-relaxed text-red-300"
          >
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              {BUSY[Math.min(tries, BUSY.length - 1)]}…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gh-muted">
        <Lock aria-hidden="true" className="h-3 w-3" />
        Sessions are monitored.
      </p>
      <MergeConflictCaptcha open={captcha} onClose={() => setCaptcha(false)} />
    </div>
  )
}

function Terminal({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await wait(1100)
      for (let i = 1; i <= TERMINAL.length; i++) {
        if (cancelled) return
        setShown(i)
        // The stuck 99% lines hang a little longer each time.
        await wait(i >= 6 && i <= 8 ? 700 + (i - 5) * 350 : 380)
      }
      await wait(1400)
      if (!cancelled) done.current()
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="w-full max-w-xl">
      <p className="mb-4 text-center text-2xl font-semibold text-gh-accent">
        Access granted
      </p>
      <div className="overflow-hidden rounded-xl border border-gh-border bg-gh-deep">
        <div className="flex items-center gap-1.5 border-b border-gh-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gh-elevated" />
          <span className="h-2.5 w-2.5 rounded-full bg-gh-elevated" />
          <span className="h-2.5 w-2.5 rounded-full bg-gh-elevated" />
          <span className="ml-2 font-mono text-xs text-gh-muted">
            admin@github-community
          </span>
        </div>
        <pre
          aria-live="polite"
          className="min-h-[260px] overflow-x-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed"
        >
          {TERMINAL.slice(0, shown).map((line, i) => (
            <span key={i} className={cn("block", line.tone)}>
              {line.text}
            </span>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-gh-text/70 align-middle" />
        </pre>
      </div>
    </div>
  )
}

function Caught({
  ip,
  browser,
  path,
  usernames,
  onRetry,
}: {
  ip: string | null
  browser: string | null
  path: string
  usernames: string[]
  onRetry: () => void
}) {
  // git blame's own date format, in the visitor's local time.
  const [time] = useState(() => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  })
  const hash = shortHash(ip ?? browser ?? "anon")
  const lastName = usernames.at(-1)
  const lines = [
    `visited ${path}`,
    `tried ${TRIES} passwords, got none of them right`,
    lastName && `typed the username "${lastName}"`,
    ip && `from ${ip}`,
    browser && `using ${browser}`,
    "and the maintainers can read this list",
  ].filter(Boolean) as string[]

  return (
    <div className="w-full max-w-2xl">
      <p className="font-mono text-sm text-gh-accent">honeypot.tsx</p>
      <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gh-text md:text-5xl">
        You found the honeypot.
      </h1>
      <p className="mt-4 max-w-[60ch] text-pretty leading-relaxed text-gh-muted">
        There is no admin panel behind this page. It exists to be found by
        people who try URLs like this one, and you did. None of those passwords
        got anywhere, and they never left your browser tab.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gh-border bg-gh-deep">
        <div className="border-b border-gh-border px-4 py-2.5 font-mono text-xs text-gh-muted">
          $ git blame admin
        </div>
        <ol className="overflow-x-auto p-4 font-mono text-[13px] leading-7">
          {lines.map((line, i) => (
            <li key={i} className="whitespace-nowrap">
              <span className="text-amber-300">^{hash}</span>{" "}
              <span className="text-gh-muted">
                (you {time} {String(i + 1).padStart(2, " ")})
              </span>{" "}
              <span className="text-gh-text">{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 rounded-xl border border-gh-border bg-gh-surface p-6">
        <p className="font-medium text-gh-text">
          Curious enough to try /admin? Point that somewhere useful.
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-gh-muted">
          The club builds projects for students at GITAM and recruits in rounds.
          Experience is not the filter; curiosity helps.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/#join">Apply to the club</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to the site</Link>
          </Button>
          <Button variant="ghost" onClick={onRetry}>
            Try again anyway
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * The decoy at /admin. A believable login that refuses every try with
 * steadily less believable git errors, "lets them in" on the fifth, stalls
 * at 99% and then tells them. Every visit and try is logged (IP, browser,
 * username, never a password) to the CMS security page.
 */
export function Honeypot({
  ip,
  browser,
  path,
}: {
  ip: string | null
  browser: string | null
  path: string
}) {
  const [stage, setStage] = useState<Stage>("login")
  const [usernames, setUsernames] = useState<string[]>([])
  const [lookAway, setLookAway] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    console.log(
      "%cNice try.%c\nThe CMS is not here, and this console will not help.\nIf you like poking at things, apply: /#join",
      "font: 600 20px system-ui; color: #3fb950",
      "font: 13px ui-monospace, monospace; color: #8b949e",
    )
  }, [])

  const fade = reduced
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-gh-bg px-4 py-16 text-gh-text">
      <Watcher
        lookAway={lookAway && stage === "login"}
        spinKey={spinKey}
        className="mb-2"
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          {...fade}
          transition={{ duration: 0.3 }}
          className="flex w-full justify-center"
        >
          {stage === "login" && (
            <LoginCard
              onFocusPassword={setLookAway}
              onGranted={(names) => {
                setUsernames(names)
                setStage("granted")
              }}
            />
          )}
          {stage === "granted" && (
            <Terminal
              onDone={() => {
                setStage("caught")
                setSpinKey((k) => k + 1)
              }}
            />
          )}
          {stage === "caught" && (
            <Caught
              ip={ip}
              browser={browser}
              path={path}
              usernames={usernames}
              onRetry={() => setStage("login")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
