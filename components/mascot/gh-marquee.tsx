const WORDS = [
  "OPEN SOURCE",
  "COMMUNITY",
  "COLLABORATION",
  "INNOVATION",
  "GIT & GITHUB",
  "MENTORSHIP",
]

/**
 * How many times the word list is repeated inside one half of the track.
 *
 * The six words measure roughly 1200px. A half narrower than the viewport
 * leaves bare band visible at the moment the track wraps, which is the defect
 * this file used to have. Three repeats puts one half at about 3500px, wider
 * than any display this is likely to meet.
 */
const REPEATS = 3

function Half() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {Array.from({ length: REPEATS }).flatMap((_, pass) =>
        WORDS.map((word) => (
          <span
            key={`${pass}-${word}`}
            className="flex items-center gap-7 whitespace-nowrap px-7 font-mono text-sm font-semibold text-white"
          >
            {word}
            <span className="text-gh-accent">◆</span>
          </span>
        )),
      )}
    </div>
  )
}

/**
 * The word band under the hero.
 *
 * It used to animate each of its two rows by `translateX(-100%)`
 * independently. A row only travels its own width that way, so at the end of a
 * cycle the second row sat at x=0 and the track ran out at one row's width.
 * On any viewport wider than that the band emptied out and visibly restarted
 * rather than looping.
 *
 * The track is the animated element now, and it travels `-50%` of itself
 * across two identical halves. Landing exactly one half along is periodic by
 * construction: the frame after the wrap is the same picture as the frame
 * before it, whatever the viewport is. The only remaining requirement is that
 * one half be wider than the screen, which is what REPEATS is for.
 */
export function GhMarquee() {
  return (
    <div className="overflow-hidden border-y border-gh-border bg-black py-4">
      <div className="gh-marquee-track flex w-max">
        <Half />
        <Half />
      </div>
      {/* The band is decoration. The words reach a screen reader once, as a
          sentence, rather than twelve times as loose fragments. */}
      <p className="sr-only">
        What this club is about: {WORDS.join(", ").toLowerCase()}.
      </p>
    </div>
  )
}
