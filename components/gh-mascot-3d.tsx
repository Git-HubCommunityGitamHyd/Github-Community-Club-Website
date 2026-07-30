"use client"

import { Suspense, useMemo, useRef, type MutableRefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import type * as THREE from "three"

useGLTF.preload("/models/github-octocat.glb")

type PointerRef = MutableRefObject<{ x: number; y: number }>
type SpinRef = MutableRefObject<boolean>

// Baseline tilt so the (fairly flat) model reads as 3D even at rest.
const BASE_ROTATION_Y = 0.4
const BASE_ROTATION_X = 0.15

// Framing: the .glb is the whole Octocat (head, whiskers, tentacle legs), so
// fitting the entire model made the head tiny. These offsets come from
// rasterising the model's own triangles and measuring it, not from guessing:
// the head+ears occupy world x 2.60–10.39, y 4.11–10.17, whose centre is
// (6.50, 7.14). The full model's bbox centre — what <Center> moves to the
// origin — is (6.49, 4.99, 1.07), so shifting by the difference re-centres
// the view on the head instead of the whole body.
const HEAD_SHIFT: [number, number, number] = [-0.01, -2.15, -0.42]

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
    return { mesh, base: mesh.position.clone() }
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

    const targetY = BASE_ROTATION_Y + pointerRef.current.x * 0.5
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
      <group position={HEAD_SHIFT}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  )
}

export function GhMascot3D({
  pointerRef,
  spinRef,
}: {
  pointerRef: PointerRef
  spinRef: SpinRef
}) {
  return (
    <Canvas
      // Head is ~7.8 world units wide; at fov 35 a distance of ~14 frames it
      // with a little margin so the silhouette isn't cut off at the edges.
      camera={{ position: [0, 0, 14.2], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <directionalLight position={[-2, -1, -3]} intensity={0.4} />
      <Suspense fallback={null}>
        <OctocatModel pointerRef={pointerRef} spinRef={spinRef} />
      </Suspense>
    </Canvas>
  )
}
