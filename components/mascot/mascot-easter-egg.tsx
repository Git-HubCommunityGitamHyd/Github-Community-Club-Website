"use client"

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion, useAnimation } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import type * as THREE from "three"

// NOT gh-mascot-3d.tsx's exported GhMascot3D — that renders
// `<primitive object={scene}>` where `scene` is useGLTF's globally-cached
// object (same URL = same object, cache-wide). A Three.js object can only
// have one parent, so mounting a second live GhMascot3D here reparented the
// model into this popup's canvas and out of the real mascot's — closing the
// popup didn't give it back, so the navbar mascot stayed empty. Cloning the
// scene gives this popup its own independent Object3D tree that can't steal
// from the real one. Still zero edits to gh-mascot-3d.tsx (locked).
// The hook that suspends (useGLTF) has to live in a component nested INSIDE
// the Suspense boundary, not the one that renders the boundary itself —
// same split gh-mascot-3d.tsx uses between GhMascot3D and OctocatModel.
function PopupOctocatModel() {
  const { scene } = useGLTF("/models/github-octocat.glb")
  const cloned = useMemo(() => scene.clone(true), [scene])
  return (
    <group rotation={[0.15, 0.4, 0]}>
      <Center>
        <primitive object={cloned as THREE.Object3D} />
      </Center>
    </group>
  )
}

function PopupOctocat() {
  return (
    <Canvas
      camera={{ position: [0, 0, 17.1], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <directionalLight position={[-2, -1, -3]} intensity={0.4} />
      <Suspense fallback={null}>
        <PopupOctocatModel />
      </Suspense>
    </Canvas>
  )
}

const PopupMascot = dynamic(() => Promise.resolve(PopupOctocat), {
  ssr: false,
})

// Same selector mascot-glow.tsx uses to find the real mascot button — scoped
// to its z-50 wrapper rather than the aria-label alone. A document-level
// click listener (bubble phase, no preventDefault/stopPropagation) only
// counts clicks — it never touches gh-mascot-dock.tsx's own onClick, so the
// spin still fires normally and the mascot files stay untouched.
const MASCOT_SELECTOR = '.z-50 > button[aria-label="Spin the octocat"]'
const CLICKS_TO_UNLOCK = 7

const TITLE = "Congrats on unlocking the easter egg!"
const SUBTITLE =
  "Fun fact: this site was vibecoded, but built with care, so hopefully you can't tell."
const FULL_MESSAGE = `${TITLE}\n${SUBTITLE}`
const TYPE_SPEED_MS = 18
// Matches the speech bubble's own fade-in (0.35s delay + 0.3s duration) so
// typing starts right as the bubble finishes appearing, not before.
const TYPE_START_DELAY_MS = 650

function useTypewriter(text: string) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let interval: number | undefined
    const startTimeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setCount((c) => {
          const next = c + 1
          if (next >= text.length && interval) window.clearInterval(interval)
          return next
        })
      }, TYPE_SPEED_MS)
    }, TYPE_START_DELAY_MS)
    return () => {
      window.clearTimeout(startTimeout)
      if (interval) window.clearInterval(interval)
    }
  }, [text])

  return { typed: text.slice(0, count), done: count >= text.length }
}

function TypingCursor() {
  return <span className="inline-block w-[1ch] animate-pulse">|</span>
}

// FLIP-style entrance: snaps to the real mascot's captured rect (no visible
// motion), then animates to identity — reads as the mascot itself flying to
// center from wherever it was (docked small in the navbar, or still big in
// the hero), rather than a popup that just fades in in place.
function FlyingMascot({ sourceRect }: { sourceRect: DOMRect | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!sourceRect) {
      controls.start({ x: 0, y: 0, opacity: 1 })
      return
    }
    // Position only — no scale. The popup mascot always renders at its
    // fixed intended size; only where it sits on screen is animated, so it
    // never gets stuck looking like the small pre-click (docked) size.
    const dest = el.getBoundingClientRect()
    const dx =
      sourceRect.left + sourceRect.width / 2 - (dest.left + dest.width / 2)
    const dy =
      sourceRect.top + sourceRect.height / 2 - (dest.top + dest.height / 2)
    controls.set({ x: dx, y: dy, opacity: 1 })
    controls.start({
      x: 0,
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 110 },
    })
  }, [sourceRect, controls])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={controls}
      className="h-56 w-56 sm:h-72 sm:w-72"
    >
      <PopupMascot />
    </motion.div>
  )
}

function EasterEggOverlay({
  sourceRect,
  onClose,
}: {
  sourceRect: DOMRect | null
  onClose: () => void
}) {
  const { typed, done: typingDone } = useTypewriter(FULL_MESSAGE)
  const typedTitle = typed.slice(0, TITLE.length)
  const typedSubtitle = typed.slice(TITLE.length + 1)

  const holdTimer = useRef<number | null>(null)
  const cancelHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }
  const startHold = () => {
    holdTimer.current = window.setTimeout(onClose, 3000)
  }
  useEffect(() => cancelHold, [])

  return (
    <motion.div
      className="popup-overlay fixed inset-0 flex items-center justify-center bg-black/60 p-6 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative max-w-sm rounded-2xl border border-gh-border bg-gh-surface px-6 py-4 text-center text-gh-text shadow-2xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <p className="font-semibold">
            {typedTitle}
            {!typingDone && typedTitle.length < TITLE.length && (
              <TypingCursor />
            )}
          </p>
          <p className="mt-2 min-h-[2.5em] text-sm text-gh-muted">
            {typedSubtitle}
            {!typingDone && typedTitle.length >= TITLE.length && (
              <TypingCursor />
            )}
          </p>
          {/* Speech bubble tail, pointing down at the mascot */}
          <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-2 rotate-45 border-b border-r border-gh-border bg-gh-surface" />
        </motion.div>

        <FlyingMascot sourceRect={sourceRect} />

        <motion.button
          onClick={onClose}
          className="mt-2 rounded-md border border-gh-border px-4 py-2 font-mono text-[13px] text-gh-text hover:bg-gh-elevated"
          initial={{ opacity: 0 }}
          animate={{ opacity: typingDone ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export function MascotEasterEgg() {
  const [open, setOpen] = useState(false)
  const countRef = useRef(0)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      const mascotEl = e.target.closest(MASCOT_SELECTOR)
      if (!mascotEl) return
      countRef.current += 1
      if (countRef.current >= CLICKS_TO_UNLOCK) {
        countRef.current = 0
        setSourceRect(mascotEl.getBoundingClientRect())
        setOpen(true)
      }
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <EasterEggOverlay
          sourceRect={sourceRect}
          onClose={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  )
}
