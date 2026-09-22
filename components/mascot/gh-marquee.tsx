const WORDS = [
  "OPEN SOURCE",
  "COMMUNITY",
  "COLLABORATION",
  "INNOVATION",
  "GIT & GITHUB",
  "MENTORSHIP",
]

function MarqueeRow() {
  return (
    <div className="flex w-max animate-infinite-scroll items-center">
      {WORDS.map((word) => (
        <span
          key={word}
          className="flex items-center gap-7 whitespace-nowrap px-7 font-mono text-sm font-semibold text-white"
        >
          {word}
          <span className="text-gh-accent">◆</span>
        </span>
      ))}
    </div>
  )
}

export function GhMarquee() {
  return (
    <div className="overflow-hidden border-y border-gray-800 bg-black py-4 dark:border-gh-border">
      <div className="flex w-max">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  )
}
