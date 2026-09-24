/**
 * A place the octocat is asked to go and sit, overriding its scroll dock.
 *
 * The project hover preview used to mount its own `GhMascot3D` inside the
 * card. That is two octocats: the page's one carried on down the projects
 * section on its rail while a second one blinked into existence on the card,
 * and when the preview closed the second one vanished rather than going
 * anywhere. The mascot is one character, so there is one of it, and a preview
 * borrows it rather than casting an understudy.
 *
 * Deliberately a bare module-level value rather than context or state. The
 * only reader is `V2Mascot`'s requestAnimationFrame loop, which is already
 * running every frame and simply reads the current value; routing this through
 * React would re-render the mascot on every pointer move to deliver a number
 * that a ref carries for free. The writer is whichever component currently
 * wants the mascot, and there is only ever one.
 *
 * A null perch means "go back to the dock the scroll position says you belong
 * in" — which is what happens for a project with no live URL, and therefore
 * what happens automatically when the CMS marks something in progress and no
 * preview opens at all.
 */
export type Perch = {
  /** Viewport coordinates of where the mascot's centre should sit. */
  x: number
  y: number
}

let perch: Perch | null = null

export function setPerch(next: Perch | null) {
  perch = next
}

export function getPerch() {
  return perch
}
