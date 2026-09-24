"use client"

/* eslint-disable react-hooks/immutability -- Three.js meshes are mutated in useFrame by design */

import { Suspense, useMemo, useRef, type MutableRefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import type * as THREE from "three"
import {
  BASE_ROTATION_X,
  BASE_ROTATION_Y,
  MAX_YAW,
} from "@/components/mascot/pose"

useGLTF.preload("/models/github-octocat.glb")

type PointerRef = MutableRefObject<{ x: number; y: number }>
type SpinRef = MutableRefObject<boolean>

// Framing: read straight out of the .glb's POSITION accessor bounds, the
// whole model (NODE_333 carries the silhouette, whiskers and tentacles
// included) spans x 0..12.98, y 0..9.99 — 12.98 x 9.99, aspect 1.299, which
// is near enough the container's 1.25 to fit whole. So <Center> alone
// frames it: no head-only offset, and crucially nothing overruns the canvas
// edge, so no vignette mask is needed to hide a cut (the mask was itself
// the "blurred frame" — it dimmed the whisker tips and the left tentacle).

// The model already has eyes: sclera ovals (NODE_321) with reddish-brown
// pupils (NODE_320). Rather than adding foreign geometry we restyle the
// real ones — the sclera ships at 60% opacity, which over the tan face
// reads as a pale blob rather than an eyeball, so it gets forced opaque.
const SCLERA_NODE = "NODE_321"
const PUPIL_NODE = "NODE_320"
// Measured play between each pupil and its sclera: 0.197 on x, 0.297 on y.
// Staying just inside keeps the pupil from clipping through the white.
const PUPIL_TRACK_X = 0.16
const PUPIL_TRACK_Y = 0.24

function OctocatModel({
  pointerRef,
  spinRef,
}: {
  pointerRef: PointerRef
  spinRef: SpinRef
}) {
  const { scene } = useGLTF("/models/github-octocat.glb")
  const group = useRef<THREE.Group>(null)
  const spinProgress = useRef(0)

  const pupils = useMemo(() => {
    // Idempotent: useGLTF caches the scene, so this may re-run on remount.
    const sclera = scene.getObjectByName(SCLERA_NODE) as THREE.Mesh | undefined
    if (sclera) {
      const material = sclera.material as THREE.MeshStandardMaterial
      material.color.set("#ffffff")
      material.transparent = false
      material.opacity = 1
      material.needsUpdate = true
    }

    const mesh = scene.getObjectByName(PUPIL_NODE) as THREE.Mesh | undefined
    if (!mesh) return null
    const material = mesh.material as THREE.MeshStandardMaterial
    material.color.set("#000000")
    material.needsUpdate = true

    // useGLTF caches the scene globally, and reactStrictMode double-mounts
    // in dev — so on the second mount `mesh.position` is wherever useFrame
    // last left the pupils, not their rest pose. Capturing that as `base`
    // made the eyes track around a drifted origin (and drift further every
    // remount). Stash the true rest pose on the mesh so it survives.
    if (!mesh.userData.restPosition) {
      mesh.userData.restPosition = mesh.position.clone()
    }
    const base = (mesh.userData.restPosition as THREE.Vector3).clone()
    mesh.position.copy(base) // clear any drift left by a previous mount
    return { mesh, base }
  }, [scene])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const ease = Math.min(1, delta * 6)

    if (spinRef.current) {
      spinProgress.current = Math.min(
        Math.PI * 2,
        spinProgress.current + delta * 4,
      )
      g.rotation.y = BASE_ROTATION_Y + spinProgress.current
      if (spinProgress.current >= Math.PI * 2) {
        spinProgress.current = 0
        spinRef.current = false
        // Snap back to the base angle. A full turn is visually identical,
        // but leaving rotation.y at BASE + 2π makes the tracking easing
        // below unwind the whole turn backwards on the next frame.
        g.rotation.y = BASE_ROTATION_Y
      }
      // Recentre the pupils mid-flip instead of tracking through it.
      if (pupils) {
        pupils.mesh.position.x +=
          (pupils.base.x - pupils.mesh.position.x) * ease
        pupils.mesh.position.y +=
          (pupils.base.y - pupils.mesh.position.y) * ease
      }
      return
    }

    // The yaw swings symmetrically about facing the camera, not about the
    // resting pose.
    //
    // It used to be `BASE_ROTATION_Y + x * 0.5`, which looks symmetric and is
    // not: BASE_ROTATION_Y is 0.4, so a full left deflection reached 0.65 rad
    // and a full right one only 0.15 - still almost front-on. Docked on the
    // left the mascot turned its head convincingly; docked on the right it
    // barely moved, which is exactly what that looked like.
    //
    // Weighting the base by `1 - |x|` keeps the resting three-quarter pose at
    // x = 0, where it is a good portrait angle, and blends it out as the gaze
    // deflects so the two extremes are mirror images at +/- MAX_YAW.
    // Clamped because the caller adds an idle wobble on top of a full-
    // deflection dock bias, which can carry it just past 1. Past 1 the base
    // weight below goes negative and the yaw overshoots away from the turn.
    const swing = Math.max(-1, Math.min(1, pointerRef.current.x))
    // The base is a resting pose, so it belongs to the rest state and nowhere
    // else: full strength facing forward, faded out entirely at either
    // extreme, where only MAX_YAW remains and the two sides mirror. Added
    // rather than faded, it would compound with the deflection on one side and
    // cancel against it on the other.
    const targetY = BASE_ROTATION_Y * (1 - Math.abs(swing)) + swing * MAX_YAW
    const targetX = BASE_ROTATION_X + pointerRef.current.y * -0.3
    g.rotation.y += (targetY - g.rotation.y) * ease
    g.rotation.x += (targetX - g.rotation.x) * ease

    if (pupils) {
      // Clamp the cursor vector to a circle so the pupils never leave the
      // white of the eye, however far away the cursor is.
      const dx = pointerRef.current.x
      const dy = pointerRef.current.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const scale = len > 1 ? 1 / len : 1
      const goalX = pupils.base.x + dx * scale * PUPIL_TRACK_X
      const goalY = pupils.base.y - dy * scale * PUPIL_TRACK_Y
      pupils.mesh.position.x += (goalX - pupils.mesh.position.x) * ease
      pupils.mesh.position.y += (goalY - pupils.mesh.position.y) * ease
    }
  })

  return (
    <group ref={group} rotation={[BASE_ROTATION_X, BASE_ROTATION_Y, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

export function GhMascot3D({
  pointerRef,
  spinRef,
  rimIntensity = 0,
}: {
  pointerRef: PointerRef
  spinRef: SpinRef
  /**
   * Strength of the back-lights that pick out the silhouette. Defaults to 0,
   * which is exactly the lighting `/` has always shipped — only v2 opts in.
   *
   * The model is near-black and the dark theme canvas is #0d1117, so with only
   * a key and a fill the edges dissolve into the page (the mascot reads as a
   * hole rather than a character). These sit behind and to the sides: surfaces
   * whose normals curve away from the camera but face the back-light catch a
   * grazing highlight, which is what redraws the outline.
   */
  rimIntensity?: number
}) {
  return (
    <Canvas
      // Model is 12.98 x 9.99 units. At fov 35 visible height is
      // 0.63*distance, so d=17.1 shows 13.48 x 10.78 — the octocat fills
      // 96% of the width and 93% of the height, entirely inside the frame
      // with margin on every side. Nothing touches an edge, so there is no
      // crop to hide and no mask required. Closer crops the whiskers.
      camera={{ position: [0, 0, 17.1], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "none" }}
      // r3f defaults to useMeasure({ scroll: true, debounce: {scroll: 50} }),
      // which re-measures the canvas on every scroll and fires a state
      // update ~50ms AFTER scrolling stops — the "lag when scroll stops".
      // This canvas moves on every scroll, so that fired constantly. We
      // never use r3f pointer events (pointerEvents is none; the DOM button
      // handles clicks), so the measurement bought nothing.
      //
      // offsetSize is the other half of that. react-use-measure defaults to
      // getBoundingClientRect, which bakes in ancestor transforms — and this
      // canvas lives inside a wrapper that is CSS-scaled down as the mascot
      // docks. So the canvas was being measured at its *docked* size and r3f
      // pinned the drawing buffer there. Load the page already scrolled (scroll
      // restoration does this on every refresh) and the first measurement is the
      // 55x44 docked box; scrolling back to the top restores the wrapper's scale
      // but never changes its layout size, so no ResizeObserver fires and the
      // octocat stays a thumbnail inside a full-size hero slot. offsetWidth /
      // offsetHeight are layout-only and ignore transforms, which is the size
      // the canvas should always have been drawing at.
      resize={{
        scroll: false,
        offsetSize: true,
        debounce: { scroll: 0, resize: 0 },
      }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <directionalLight position={[-2, -1, -3]} intensity={0.4} />
      {rimIntensity > 0 && (
        <>
          <directionalLight
            position={[-7, 3, -5]}
            intensity={rimIntensity}
            color="#7ee787"
          />
          <directionalLight
            position={[7, 1, -5]}
            intensity={rimIntensity * 0.75}
            color="#e6edf3"
          />
        </>
      )}
      <Suspense fallback={null}>
        <OctocatModel pointerRef={pointerRef} spinRef={spinRef} />
      </Suspense>
    </Canvas>
  )
}
