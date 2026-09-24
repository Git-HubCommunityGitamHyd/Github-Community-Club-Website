# v2 redesign — working notes

Scratch notes and decisions for the `/v2` redesign. Temporary: `/v2` runs beside the
live `/` so nothing ships half-finished. When a section is approved it gets promoted
into `features/home/` and this file plus `TODO.md` get deleted.

Task list lives in [TODO.md](TODO.md). This file holds the _why_.

---

## Ground rules

- `/v2` is additive. **Zero edits to `features/home/**`** until a section is signed off.
  New work lives in `features/v2/**`; genuinely reusable primitives go to
  `components/ui/` per the existing `components.json` aliases.
- Existing stack only: Next 16 App Router, Tailwind **v3.4.19**, framer-motion 13,
  lucide icons, D1 via `lib/db`. No framework or styling-library migration.
- `/v2` reads the same D1 tables through the same `lib/db` helpers, and is
  `export const dynamic = "force-dynamic"` for the same reason `/` is — otherwise
  Next freezes the board/events query at build time.

## Hard constraints found while scanning (these change the copy-paste instructions)

The component snippets in the brief were written against a different project shape.
Four of their assumptions are false here, so each one gets hand-ported rather than
pulled through `npx shadcn@latest add`:

| Snippet assumes               | Reality here                                                            | What we do                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tailwind **v4**               | **v3.4.19** (`tailwind.config.js`, `@tailwind` directives, no `@theme`) | Hand-port. v4-only syntax gets rewritten to v3.                                                                   |
| `motion/react`                | `motion` is **not installed**; we have `framer-motion@13.4.0`           | Rewrite imports to `framer-motion`. Same API for `motion`, `AnimatePresence`, `useScroll`, `useMotionValueEvent`. |
| `@tabler/icons-react`         | **not installed**                                                       | Use `lucide-react` (already the declared `iconLibrary` in `components.json`).                                     |
| `react-icons` (team showcase) | **not installed**                                                       | Use `lucide-react`. Also swaps Twitter/Behance for the socials the club actually has: GitHub, LinkedIn, email.    |

Running the registry CLI would install two icon libraries and a duplicate motion
package for components we're going to restyle anyway. Not worth it — and the skill
says check the dependency file before importing anything new.

## Architectural finding: Lenis is owned by the wrong component

`lenis` is instantiated in exactly one place — `components/motion/scroll-stack.tsx`.
Because the benefits section passes `useWindowScroll`, that one section's component
takes over **the entire page's scrolling** as a side effect. That is why
`document.documentElement` carries a `lenis` class, and why programmatic
`window.scrollTo({behavior:"instant"})` still animates for ~1s.

Consequences we have to design around in v2:

- Dropping in React Bits' `ScrollStack` as-is creates a **second** window-level Lenis
  while the first is alive → two RAF loops fighting over `scrollTop`.
- Anything that measures scroll position (the nav's scroll-spy, the resizable navbar's
  `useScroll`, the mascot dock) is reading a value Lenis is still animating.

**Decision:** lift Lenis to a page-level provider (`features/v2/smooth-scroll.tsx`),
have v2's ScrollStack subscribe to it instead of constructing its own. One instance,
one RAF loop, and scroll-reading components have a single source of truth.

## Gotcha found while building: the scroll spy was holding detached nodes

Worth writing down because it fails silently and looks healthy from the outside.

v2's scroll spy started as a copy of `/`'s: resolve the section elements once in
the effect, keep them in a closure, watch them with an IntersectionObserver. On
`/` that works. On `/v2` it reported "no active section" forever while every
measurement taken from the console said a section was plainly under the line.

The cause is that the section DOM is replaced after the first commit, so the
references captured at mount end up **detached**. A detached element's
`getBoundingClientRect()` is all zeros, which means `top <= offset` passes and
`bottom >= offset` fails — so the predicate is never true and the spy reports
nothing, with no error anywhere. The IntersectionObserver variant hides it even
better: it delivers its one guaranteed initial callback and then goes silent,
because a detached node never crosses anything. Half an hour went into suspecting
Lenis, StrictMode and the registry port before the probe showed `last: "none"`
against a live `journey.top` of 40.

**Fix:** `features/v2/use-active-section.ts` looks the elements up _inside_ the
resolve call rather than caching them. `getElementById` is a hash lookup; six per
animation frame costs nothing next to being wrong. The hook also reads from the
page-level Lenis instead of a raw scroll listener, so there is one scroll source
of truth.

Not touching `/`'s spy — it is verified working there, and this is a v2 file.

## Resolved: the ScrollStack "will not drive" problem was the browser, not the code

`components/ui/scroll-stack.tsx` drives correctly and `/v2` uses it. The long
hunt that preceded this was chasing an artifact of how the section was being
inspected, and the conclusion is worth keeping because it invalidates a whole
class of evidence gathered here.

**The browser pane's tab reports `document.hidden === true`, and browsers do not
fire `requestAnimationFrame` in a hidden tab.** The driver is a rAF loop, so it
executed zero frames and wrote zero transforms — while every other signal looked
healthy: the component was mounted with the correct fiber chain, the layout
effect had run (its `margin-bottom` / `will-change` / `transform-origin` were on
the live nodes), the freshly built bundle was the one being served, and there
were no console errors. A frame counter added inside the update callback stayed
`undefined`, which is what finally separated "the effect never ran" from "the
effect ran and requested a frame that never arrived".

Two consequences for anyone verifying motion on this project:

- Check `document.hidden` before concluding that anything rAF-driven is broken.
  Taking a screenshot pumps frames, so the working pattern is: set the scroll
  position, take a screenshot, then read the DOM.
- Lenis owns the scroll position and also advances inside rAF, so
  `window.scrollTo` gets pulled back to Lenis's target on the next frame. Drive
  it with `lenis.scrollTo(y, { immediate: true, force: true })` instead. The
  instance is reachable from the `SmoothScroll` fiber's hooks; match on an
  object having **both** `scrollTo` and `raf`, because a bare `scrollTo` also
  matches any ref holding a DOM element.

Earlier entries in this file claimed that `lenis.on("scroll")` and a native
window scroll listener both failed to fire here. Those conclusions came from the
same hidden-tab sessions and should not be trusted. The component polls per
frame anyway, which is the right shape for riding Lenis's inertia, so the
question is moot.

Three fixes made during the hunt are real and stay:

- **`documentTop()` instead of `getBoundingClientRect().top + scrollY`.** The
  rect is the _painted_ position, which already includes the transform this
  function's own result produces, so each frame derives a new translate from the
  previous one and the card oscillates between two positions forever.
  `offsetTop` is layout-only and cannot feed back into itself.
- **Upstream's `isUpdating` re-entrancy guard is removed.** It exists because
  upstream drives updates from several listeners; with a single rAF driver it
  guards nothing and can only latch.
- **The card nodes are queried per frame, not cached at mount.** Caching races
  the streaming render — the same failure the scroll spy had.

A fourth, found during verification rather than debugging: `baseScale` is the
**bottom** card's resting scale, and each card above it is one `itemScale` step
larger. `baseScale={0.9}` with six cards put the top card at 1.05, so it grew
past full size as it pinned. Callers should pass `1 - (count - 1) * itemScale`;
the component now clamps at 1 so a wrong value degrades instead of breaking.

`stackPosition` is pixels, not a percentage of the viewport. Verified: the first
card pins at exactly 130px from the top on both a 900px and a 1300px viewport,
which is the whole point of the change.

One more thing worth writing down: this page ships a duplicate of the benefits
markup inside React's streaming placeholder (`<div id="S:0">`, `display:none`).
`document.querySelector(".scroll-stack-card")` finds _that_ copy first. Several
early measurements were of the inert ghost, not the live cards. Any DOM probing
on this page should filter with `:not([id^="S:"] *)` or equivalent.

## Section decisions

### 1. Typography (skill priority #1)

No font is configured anywhere — no `next/font`, no `fontFamily` in the Tailwind
config. The site renders in Tailwind's default `ui-sans-serif, system-ui` stack, which
is why it looks fine on the Mac it was built on and will fall back to Segoe UI / Arial
on Windows. For a design leaning this hard on big display type, that is the single
biggest available win.

**Choice: Geist + Geist Mono** via `next/font/google`. Geist is a developer-tool
grotesque — it sits naturally next to the GitHub palette, has a true mono companion for
the `01 — ABOUT` eyebrows, and ships the 500/600 weights the skill asks for.

**Scoping trick so `/` is not touched:** Tailwind's `fontFamily.sans` becomes
`["var(--font-geist-sans)", ...existing default stack]`. The CSS variable is only
defined on the `/v2` subtree. On `/`, the variable is undefined, so every
`font-sans` resolves to the same default stack it uses today — byte-identical
rendering — while `/v2` picks up Geist. Same trick for mono.

### 2. Navbar — aceternity resizable navbar

Port to `components/ui/resizable-navbar.tsx`. Changes from the snippet:

- `motion/react` → `framer-motion`; tabler icons → lucide.
- `sticky top-20` → `fixed top-4`. The snippet is written for a demo container; this
  site needs a real fixed nav.
- **Nav height changes, so two tuned constants must move with it:** `section[id]`'s
  `scroll-margin-top: 4rem` in `globals.css`, and the scroll-spy's `100px` activation
  line. Both were tuned to a 64px fixed bar. v2 gets its own values.
- Logo/buttons rebranded: Octocat + wordmark, theme toggle, Join.
- The demo's pastel `boxShadow` and `bg-white/80` get re-toned to the GitHub palette.

**The mascot docks into the pill.** An earlier draft of this file proposed dropping
the dock, on the grounds that a pill collapsing to a fraction of its width has nowhere
sane to put it. That was the wrong call and was overruled: the mascot is one of the
best things on the site, so the answer was to do both.

It works because of an inversion. v1 measures both slots with offsetTop/offsetLeft,
deliberately, because getBoundingClientRect bakes in transforms and v1's navbar
animates in from `y: -100` on mount. v2 keeps layout measurement for the hero slot
(it scrolls with the document, so it is cached once and converted by subtracting
scrollY) but reads the **nav slot's live client rect every frame**. The pill is not
animating once — it continuously shrinks and slides as you scroll, all of it
transform — so its client rect is the only thing that says where the slot actually
is. Layout measurement would dock the mascot to where the pill would be if it never
animated.

It is driven by rAF rather than the scroll event, because the pill is spring-animated
and keeps moving for a few hundred ms after scrolling stops; a scroll listener froze
the mascot mid-flight while the bar slid out from under it. Verified pixel-exact: at
full scroll the mascot's rect equals the slot's rect, and the slot moves from x=1277
to x=1133 as the pill collapses with the mascot tracking it.

### 3. Hero — octocat disappears into the background

Real problem, visible in image 6: a black 3D model rendered against `#0d1117`. Its
silhouette has nothing to separate it from the page. Three fixes, cheapest first:

1. A rim/back light in the r3f scene so the model's edges catch a highlight.
2. A soft radial plate behind the canvas — lifts the local background a few percent
   without the heavy green wash the current `MascotGlow` produces.
3. Failing those, a subtle outline pass.

Also restaging the hero itself for asymmetry rather than the current
headline-left / cat-right / buttons-under-cat arrangement.

### 4. Journey timeline

Current version is already two-sided, but the cards are small and the alternation
reads as accidental. Target is the reui `c-timeline-4` structure (icon node on the
spine, title, body, timestamp) but **bigger and genuinely two-sided**, with the node
icons carrying real git semantics rather than generic dots:

founding → `GitBranch`, first event → `GitCommit`, award → `Star`, new board →
`Users`, 700 members → `GitMerge`, flagship → `GitPullRequest`.

Spine draws in on scroll progress.

### 5. Benefits — React Bits ScrollStack

Swap the vendored copy for the canonical TS version, wired to the shared Lenis.

**Trap to not walk back into:** the vendored file carries a long comment explaining
that `stackPosition` as a `%` is a fraction of `window.innerHeight`, so the gap above
the stack grows on large monitors while the fixed-height cards do not. Upstream
defaults to `"20%"`. v2 must pass absolute px, or the "why is this huge on my monitor"
bug returns.

### 6. Board — team showcase (built)

Port with lucide icons. Two real mismatches with the snippet:

- It hard-codes a 3-column photo grid sized for 6 people. The club has 5, and the
  count is DB-driven, so it has to degrade for any N.
- It has no surface for a member's `description`, which the current card popup shows.
  **Keep the popup:** hovering reveals socials, clicking a name opens the existing
  detail card. No functionality lost.

Two things in the snippet did not survive contact with this project.

`react-icons` is not a dependency and the icon set declared in components.json is
lucide, so the socials are lucide's and are GitHub / LinkedIn / email — the three
fields the CMS actually stores. There is no Twitter or Behance to show.

The photo grid was three hardcoded columns at three fixed pixel widths. The club
has five board members today and the CMS can change that at any time, so the
column count is now `min(3, memberCount)` and the columns are fractions of the
container. Members are distributed round-robin, which keeps the columns within
one of each other at every count, and the per-column size and offset variation —
which is what stops the grid reading as a plain table — is kept but indexed by
column. Verified at 2, 4, 5 and 7.

The showcase shows only a face, a name and a role, so the CMS's `description`
needed somewhere to go: clicking a photo or a name opens a dialog
(`features/v2/board/member-dialog.tsx`). It stops Lenis while open rather than
relying on `overflow: hidden`, which Lenis ignores because it scrolls by
transforming the document — without that the background glides under the dialog.

### 7. Events — gradient card (built)

The snippet is the biggest tonal mismatch in the brief. Its four pastel gradients
(orange / slate / **purple-indigo** / emerald) are exactly the "purple-blue AI
gradient" and "more than one accent colour" the skill tells us to strip out, and they
are built for a light page.

**Re-tone rather than reject:** keep the structure — badge, title, body, arrow CTA,
decorative object bleeding off the bottom-right corner, spring hover — but rebuild the
surfaces from the GitHub palette with the single green accent. Categories get
distinguished by the badge dot and the object, not by a different gradient each.

The decorative object is the open question: real events carry Cloudinary `images[]`,
so the card should use the event's own first image. Local D1 is empty, so this is
unverifiable here — see Open questions.

The snippet's four `gradient` variants — orange, slate, purple, emerald — were
the loudest thing it brought with it, and a different hue per card is exactly
the "AI gradient" fingerprint on a page that is otherwise neutral surfaces plus
one GitHub green. The variants are gone. What is left is a `tone` that decides
how present a card is, so the featured event can sit forward of the others
without introducing a second colour.

The decorative object is the category's glyph rather than the event's own photo.
The photo was the earlier plan, but the answer to the open question was
per-category glyphs, and they are the better fit anyway: a decorative photo is a
request, a layout shift and a colour that can clash, while an icon is none of
those. The photos are not lost — they are in the dialog, with a "3 photos"
count on the card face pointing at them.

`events.category` is free text in the schema, so `categoryGlyph()` is a lookup
with a calendar fallback rather than a union type; rows written before this
existed still render. The admin form's category field became a dropdown of the
glyph-backed categories, which is what makes the mapping something the CMS
manages rather than something only this file knows. A value a row already holds
is kept as an option so editing an old event never silently rewrites it.

The layout is a full-width featured card plus a two-up grid, not three equal
columns. The CTA row is `flex-1`-pushed to the bottom of each card, because
without that two cards in the same row end their CTAs at different heights
whenever their descriptions differ in length.

### 8. Join (built)

- Keep `JoinSquares` — the turning tiles are the best thing in that section.
- Replace `ParticleText`. The canvas-rendered "Join Our Community" is the "font is
  bad" complaint in image 2: it rasterises glyphs to particles, so it ignores the page
  font entirely and reads as a dot-matrix artifact. Replaced with a magnetic CTA
  (aceternity-style pointer-follow, built against the site palette).
- **Form:** the dead space either side of the narrow centred card is the complaint in
  image 1. Restage as a two-column split — persuasion on the left (what happens after
  you apply, who can join), form on the right. Adds real inline validation and error
  states, which the skill flags as missing and which the current form has none of.

`JoinSquares` is untouched, as asked. Everything on top of it changed. The
banner was a centred stack in a translucent slab whose `ParticleText` headline
was also the only way to reach the form, which is a lot of weight on an effect
that is hard to read and impossible to focus with a keyboard. It is now the
pitch plus one magnetic CTA, and the form sits in a two-column split with the
reasons to apply beside it, so there is no longer a lone field column with dead
space either side.

Two details in `components/ui/magnetic-button.tsx` are worth keeping. The pull
is measured from the button's centre and normalised against its own half-extent
before being clamped, so a full-width CTA does not travel further than a small
one — the naive version multiplies the raw cursor offset and slides the button
across the screen. And the label moves further than the shell, which is what
reads as depth rather than as the whole element sliding about.

The form already had validation, but only on submit and with no accessible
wiring. It now validates a field when it is blurred, clears the error as soon as
the field stops being wrong, exposes `aria-invalid` / `aria-describedby` /
`role="alert"`, and sends focus to the first invalid field on submit — without
which a long form just appears to do nothing when the offending field is
off-screen. Per-field checks run the whole validator and read one key, so
`lib/validation/application.ts` stays the single source of truth; a second
per-field copy of those rules is how a client and a server drift apart.

### Icons: react-icons for brand marks, lucide for affordances

`react-icons` was not installed when the team showcase was ported, so its
socials were rewritten in lucide. The user asked for the dependency to be
installed instead, and it is: the GitHub, LinkedIn, Instagram and WhatsApp marks
are now the real logos from `react-icons/fa6`, which is what they should be — a
brand mark redrawn by a generic icon set reads as an approximation. lucide keeps
everything that is an affordance rather than a logo: arrows, close, calendar,
pins, the category glyphs.

## Open questions (not blocking — building under the stated assumption)

1. **Tally vs custom form.** Brief says decide after seeing the redesign. Building
   custom, because the existing D1 `applications` table, the 409-on-duplicate-email
   handling and the admin review screens all already work end to end. Moving to Tally
   throws that away.
2. **Roll the font site-wide?** v2 is scoped so `/` is unaffected. Say the word and it
   becomes one line in the Tailwind config.
3. **Event decorative objects.** Need either real event images in Cloudinary, or a
   decision to use per-category glyphs. Local D1 is empty so nothing renders right now
   — happy to seed sample rows to demo it.
4. **Board photos.** Team showcase leans on portrait crops at ~170px. Current photos
   are circular avatars; they may crop badly as rectangles.

## Verification

Every section gets checked in the browser in **both themes** before it is ticked off,
plus `tsc --noEmit`, `eslint .`, `prettier --check` and a production `next build`.
Local D1 is empty, so board/events sections need seeded rows to verify — seed, verify,
then delete the rows again (as was done in the earlier footer/grid work).

## Verifying in the browser pane: it is a hidden tab

Worth reading before debugging anything here that "does not run".

The pane's tab reports `document.hidden === true`, and a hidden tab gets no
`requestAnimationFrame` callbacks. That is not only a motion problem: a `/v2`
load can sit indefinitely showing `app/loading.tsx` with the finished markup
parked in React's streaming placeholder, because the work that swaps it in never
gets a frame. The symptom is a page that answers `document.body.innerText.length
=== 0` while the HTML served by curl is complete and the dev server logs a clean
`GET /v2 200`.

Taking a screenshot pumps frames. So the working order for any check here is:
navigate, **screenshot**, then measure — and for anything scroll-driven, set the
position, screenshot, then read. A batch that navigates and immediately
evaluates will keep reporting that nothing is mounted.

Lenis owns the scroll position and advances in its own rAF tick, so
`window.scrollTo` is pulled back to Lenis's target on the next frame. Use
`lenis.scrollTo(y, { immediate: true, force: true })`. The instance is reachable
from the `SmoothScroll` fiber's hooks — match on an object with **both**
`scrollTo` and `raf`, since a bare `scrollTo` also matches any ref holding a DOM
element.

Two more things that cost time: `document.getElementById("board")` returns the
copy inside the streaming placeholder, so every DOM probe needs the
`:not([id^="S:"] *)` filter; and a single screenshot often catches a CSS
transition or a `whileInView` entry mid-flight, so a "wrong" colour or a blank
card is worth re-shooting before believing it.

## Hero and about revamp

### `motion` vs `framer-motion`

The slider snippet imports from `motion/react`. That package and `framer-motion`
are the same library under two names, so installing both would put two
animation runtimes in the bundle with **separate contexts** — the
`MotionConfig reducedMotion="user"` that wraps the v2 tree would not reach
anything rendered through the other one, silently undoing the reduced-motion
pass. The API is identical, so the port changes one import line and nothing
else. Switching to `motion` later is `npm i motion` plus that one line per file.

### Logos

The marquee snippet pulls its logos from a third-party CDN as flat SVGs and then
fixes dark mode with `dark:brightness-0 invert`. Those are someone else's
uptime, another `remotePatterns` entry, and a hack that only works because the
marks happen to be solid black. `react-icons/si` (Simple Icons) is already a
dependency after the react-icons install, is vector, one stroke weight, and
inherits `currentColor` — both themes come free and nothing is fetched at
runtime. The marquee is `aria-hidden` decoration with the tool list repeated
once in an `sr-only` sentence.

The snippet also renders `{children}{children}` _and_ is fed a pre-doubled
array, so every logo appears four times. Doubling once is what the -50%
translate actually requires; callers now pass their list once.

### The about bento

The reference runs on violet plus emerald with a violet CTA. Two accents would
be the loudest thing on a page that is otherwise neutral surfaces and one
GitHub green, so the structure is kept exactly — 2x2 feature tile, two small
tiles, one wide tile — and the colour is spent once, on the metric tile. The
wide CTA is deliberately quiet, because the join section already carries the
loud call to action and two competing primary CTAs mean neither reads as
primary.

The three non-CTA tiles are the three entries in `PILLARS`, so this _replaces_
the old flat three-column pillar strip instead of sitting above a duplicate of
it.

### The hero's contribution field

The right half of the hero was a mascot floating in empty space. The field
behind it is `aria-hidden`, has no caption and no number, so it reads as
GitHub's texture rather than as a statistic the club would have to stand
behind. The fill level per cell is a hash of the cell index, not
`Math.random()` — this renders on the server too, and a random fill would
produce a different grid on each side and throw a hydration mismatch.

### Why the timeline was bland, and what replaced it

It animated once and then stopped. Every card faded up as it entered and after
that the section was eight static blocks beside a drawn line: nothing responded
to the reader, and nothing said where they were in three years of history.

The fix is about state rather than more motion. One entry is active at a time —
whichever node is nearest the middle of the viewport — and it fills with the
accent while the rest sit back at 55% opacity. A sticky year rail lists the
years, marks the active one, and each year is a real button that scrolls to its
entry, so the history is navigable in a click. Hover and keyboard focus promote
an entry too, which is why the rail and the entries share one `focusedIndex`
with hover taking precedence over scroll position.

Active tracking is a single `scroll` handler comparing every node's distance to
the viewport centre, not eight IntersectionObservers. "Nearest to centre" is a
comparison across all entries, which an observer's per-element threshold cannot
express.

The active ring fades in place on each node instead of sharing a `layoutId`
across them. With a shared id the ring animated the full distance between
entries on every change — 300px or more — and when the newly active entry was
still off-screen it travelled through empty space.

### `overflow-x-hidden` silently kills `position: sticky`

`.v2-root` carried `overflow-x-hidden` to stop the marquee and mascot causing a
horizontal scrollbar. Setting `overflow` to `hidden` on one axis forces the
other axis to `auto`, which makes that element a scroll container. Every
`position: sticky` descendant then resolves against _that_ scrollport — which
never scrolls, because the page scroller is the document — so nothing sticks.
The journey year rail sat 600px above the viewport with `position: sticky` and
`top: 128px` computed and applied.

`overflow-x: clip` clips identically without establishing a scroll container.
If a sticky element inside the v2 tree ever stops sticking, check this first.

### Counting a year is not counting a quantity

`CountingNumber` formatted with `toLocaleString()`, so the founding year
rendered as "2,022". The component now takes a `format` callback; the stats
strip passes `String` for the year and leaves the default grouping on the
member and event counts.

## Phase 12 notes

### The section label was the only green text on the page

`01 — ABOUT`, bold accent-green mono at 13px, six times down the page. Green is
the page's _action_ colour — buttons, links, the active timeline node — so a
green label promised something clickable and delivered a caption. At bold 13px
with no tracking it also sat at the same visual weight as body copy, so it
competed with the headline underneath instead of introducing it.

`features/v2/section-label.tsx` keeps the accent on the index alone, because a
single digit is the right amount of colour and the ordinal is the part that is
genuinely coloured information. The word drops to the same muted grey as every
other small label on the page and gains real tracking. A short rule between
them is what makes it look placed rather than typed.

### The contribution field was animated once and then dead

It staggered in on load and froze. That is the worst of both: anyone landing
mid-page never saw the animation, and everyone else got a dead texture
afterwards. Every cell now runs its own CSS keyframe with the delay and
duration derived from the same index hash that picks its fill level, so the
field twinkles unevenly the way a contribution graph fills rather than pulsing
in unison. It is CSS, not motion values — there are 450 cells and it is
decoration.

### Ornaments expand, they do not rotate

Applied to the about bento's Invertocat, the event cards' category glyph and
anything added later. A mark that turns reads as a loading spinner, and most of
these glyphs (the Invertocat, a wrench, a microphone, a trophy) have an obvious
upright orientation that tilting simply breaks. Growing and brightening says
"closer", which is what a hover is for.

The event card's glyph was also 208px at stroke-1 hung off the corner. Cropping
a glyph by a third leaves an unrecognisable fragment — the wrench read as a
paperclip — and a hairline stroke at that size looks like a rendering artefact.
It is smaller, fully inside the card, and thicker so it survives the opacity.

### The stats strip and the bento were doing the same job

Four figures on their own full-width band, immediately above a grid of tiles.
The strip was the weaker of the two: an unbroken row of four gives every figure
identical weight, which is exactly what a bento exists to avoid. The figures
are tiles now, so the membership count can be loud and the founding year can be
small, and `features/v2/sections/stats.tsx` is gone.

### The mascot docked into 44px and disappeared

It shrank into a 55x44 slot in the nav pill — about 30px of actual cat. In dark
mode a black octocat on `#0d1117` at 30px is a smudge. The 3D model, the eye
tracking and the spin-on-click were all still running for something nobody
could see.

It docks to a corner of the viewport at 116px now and leans toward the cursor
on a leash. The leash is the part worth keeping: unbounded following turns it
into a cursor trail that covers whatever you are reading and has to be dodged;
tethered, it can be ignored. The dock also flips to the opposite side when the
pointer settles on its half, with a dead band in the middle so it does not
oscillate while the cursor wanders around the centre.

`components/mascot/mascot-glow.tsx` matches `.z-50 > button` _or_ `.z-[60] >
button` because v1 and v2 wrappers sit at different z-indexes.

### The timeline is CMS-managed now

Table `journey_entries`, `lib/db/journey.ts`, `lib/validation/journey.ts`,
public `GET /api/journey`, CRUD under `/api/admin/journey`, screens under
`/admin/journey`. The recipe in CLAUDE.md, followed exactly.

The icon is a column on the row holding a key into `JOURNEY_ICONS`
(`features/v2/journey/icons.ts`), not a class name and not an SVG. The
component used to index a fixed array of eight glyphs by entry position, which
works for a hardcoded list of eight and breaks the moment the club adds a ninth
milestone or reorders two. Validation checks the key against the same map the
timeline renders from, so the CMS cannot store a value that would silently fall
back.

The admin form uses a month picker rather than a free-text date, because the
year rail derives its years by taking the last whitespace-separated token of
`entry_date`. "Feb 2022" and "early 2022" would each produce a different or
nonsense rail entry and nobody would find out until the homepage was looked at.

### The board member ring is a key, not a colour

`board_members.accent` holds a key into `BOARD_ACCENTS`
(`features/v2/board/accents.ts`). A free hex field in the CMS would let anybody
put a colour that belongs to no palette on the site, and the first one somebody
picked would be there forever with nothing to catch it. Seven named rings, each
a conic gradient whose stops are close in hue so it reads as one material
catching the light rather than a rainbow.

The ring rotates as an element, not by animating the gradient's angle —
animating a conic-gradient angle needs `@property` to register it as an
`<angle>`, and rotating a transform is compositor work that has always worked.
The wrapper's `overflow-hidden` is load-bearing: the conic layer is inset by
-45% so rotating it never sweeps an empty corner through the ring, which means
it is far larger than its box. Without the clip it spills a green wedge across
the whole panel.

### db/schema.sql cannot add a column

It is all `CREATE TABLE IF NOT EXISTS`, so it does nothing to a table that
already exists. SQLite has no `ADD COLUMN IF NOT EXISTS`, so `accent` needed a
one-off `ALTER`, which lives in `db/migrations/` and runs through the new
`db:patch:local` / `db:patch:remote` scripts. It errors if run twice. That is
the trade CLAUDE.md records — a schema this small does not justify `wrangler d1
migrations` yet — but this was the second schema change in one phase, so the
next one probably does.

### The join background was four accent colours

`["#b3410c", "#2ea043", "#a68b00", "#2f7f9e", "#3fb950"]` — a burnt orange, an
olive, a teal and two greens, every cell fully saturated and fully opaque,
behind the single most important call to action on the site. The flip mechanic
was never the problem. The tiles are the five levels of a GitHub contribution
graph now, weighted toward empty (a real contribution graph is mostly quiet
days) and gutters between them, so it reads as a graph rather than a mosaic.
The flat `bg-gh-deep/60` wash became a left-to-right scrim, because the copy is
a left-aligned `max-w-2xl` column and that is the only part that needs to be
near-solid.

### The benefits copy was the reason the section read as bland

"Learn cutting-edge technologies", "connect with like-minded developers", "work
on cutting-edge projects and stay ahead of technology trends". Six cards of
that say nothing a reader can picture and nothing another club could not also
claim. No amount of motion rescues copy that makes no claim, which is why
`features/v2/benefits/content.ts` exists rather than just a new card component:
each entry now states one specific thing that happens and carries a short
`proof` — a cadence or a number — which also gives the card a second line of
hierarchy to design around.

The card itself gained a cursor spotlight, which is the right interaction for
this specific layout: a scroll-stack pins a card under the cursor for several
hundred pixels of scrolling. The spotlight writes two CSS custom properties
rather than React state — pointer moves fire at frame rate, and the scroll-stack
is already writing transforms to these same elements every frame.

### The event dialog opened on a heading

Badge, title, inline facts, paragraph, rule, then a sideways marquee of photos.
The photos are the most interesting thing about a past event and they were the
last thing you reached, below the fold of the panel and moving so you could not
study one. The first photo is the cover now, with the title over a scrim; the
facts are a bordered strip of _labelled_ cells (when, where, how long, how many)
instead of four icons on a line; the rest of the photos are a still grid.
`DialogShell` gained `bleed` and `panelClassName` for this.

## Phase 13 — texture, a docking mascot, photographs on the event cards

The reference for this phase was the user's own site, vidh.co, which they
pointed at explicitly. What it does that this page did not: a fine graph-paper
grid behind the content, 45-degree hatch bands at the seams, faint vertical
rules marking the container, and illustration motifs that travel _down_ the
page instead of sitting in a corner.

### Texture is not decoration

`components/ui/texture.tsx`. The grid is a pair of crossed 1px linear-gradients
at a 52px pitch, the rules are a `border-x` on a box the same width as the
section's container, the hatch is a `repeating-linear-gradient(45deg, …)` on a
32px band. Nothing is an image, so there is nothing to download and nothing to
go soft on a high-density screen.

The one structural decision worth recording: all three set their line colour
through `currentColor` and a Tailwind text utility, so light and dark get
separate values. A single alpha cannot serve both — a grid that reads correctly
on white is invisible on `#0d1117`, and one tuned for `#0d1117` is a cage on
white. This is the same two-palette problem the theme has everywhere else, and
it does not go away just because the element is faint.

The hatch is deliberately _not_ at every seam. Two bands bracket the textured
run (after the marquee, before the join band) and that is the whole rule: the
hatch marks where the paper starts and stops. Putting one at each of the five
section boundaries turns a seam detail into a page motif, which is exactly the
kind of repetition the section tones are already handling.

### The "Innovation" tile was a label with nothing under it

An eyebrow, the word "Innovation" and a line of mono description. Every other
tile in the bento carries something a reader takes away — a number, a claim, a
button — and this one asserted a value and stopped. The user's word for it was
that it "serves no purpose", which was fair.

It is a terminal now (`features/v2/about/terminal-tile.tsx`) running the exact
sequence a first-time contributor goes through: `git switch -c`, commit, `gh pr
create`, pull request opened. Same claim, shown rather than stated, and it is
specific to this club in a way the word "Innovation" was not. It also settles
the dark tile's presence — a dark panel inside a light bento needs a reason or
it reads as a stray section, and a terminal is the one surface everybody
already expects to be dark.

Two details that matter more than they look:

- The finished transcript is rendered invisibly underneath and the typed copy
  laid over it, so the tile reserves its final height from the first frame.
  Without that the tile grows a line at a time while typing, and because it
  shares a bento row with the "Start contributing" tile, that tile and
  everything below the grid shift on every line.
- Output lines land whole; only the input lines type. Watching a machine "type"
  its own response is the tell that makes a fake terminal look fake.

The typing runs once and stops with a blinking cursor. A looping terminal in
the middle of a page never resolves, so you cannot read past it.

### The event cards were telling you how many photos they were not showing you

The old card was the generic gradient card with an event poured into it, and
its footer read "3 photos". Every one of these events has photographs sitting
in the database. The cards were flat because the content was flat, not because
the container needed more effects — so the photograph is the card now
(`features/v2/events/event-card.tsx`), and the remaining count moved onto the
image as a chip: the picture you can see plus the number you cannot.

`components/ui/gradient-card.tsx` is deleted. It was a vendored snippet used
only here, and once the card is this event-specific, parameterising a generic
card further is the wrong shape.

Events with no photographs keep the identical frame, filled with the dot field
and the category glyph the old card used. If a missing image collapsed the
frame, one empty event would make the whole grid look broken instead of making
that one card look quiet.

### The mascot's position was a readout of the mouse

The previous dock parked it in a viewport corner and flipped it to the other
corner when the cursor crossed the middle of the screen. Two things were wrong,
and the user named both.

The side was chosen by the _cursor_, so where the mascot sat told you nothing
about where you were on the page. It docks per section now
(`features/v2/mascot/docks.ts`): each section owns a side and a descending band
of viewport-height fractions, so the mascot arrives high, drifts down as you
read through the section, then crosses to the opposite side for the next one.
Sides alternate, which traces a zig-zag down the page rather than a rail. The
crossing is blended across the last 16% of each section — without that the
target jumps the full width of the screen the instant the boundary passes, and
the follow easing turns it into the mascot bolting sideways.

The second complaint was that it "just keeps looking towards one side". That
was a direct consequence of the first: pinned to an edge, the pointer is almost
always far off on the same side, so the tracking saturates at full deflection
and stays there. The gaze now blends by proximity — inside `GAZE_FALLOFF` the
pointer wins, outside it the mascot looks inward at the content beside it with
a slow idle drift. It only tracks you when you are actually near it, which is
also when tracking reads as attention rather than as a stuck servo.

The micro-interaction is one decaying squash when it settles into a new dock,
so a crossover ends with a visible full stop instead of just ceasing to move.

`measure()` runs from a `ResizeObserver` on the body, not just on resize:
sections change height as images load and as `whileInView` content settles,
which moves every dock below them.

### The hero CTA

`components/ui/button-colorful.tsx`. What the 21st.dev snippet contributes is
the mechanic — a solid button with a blurred gradient wash behind it that
bleeds past its edge and intensifies on hover. The colours are dropped: the
snippet washes indigo into purple into pink, three hues none of which are this
site's, on the single most important button on the page. The wash is the
accent's own green ramp instead. The snippet's `overflow-hidden` is also
dropped, because clipping the wash to the button's box cancels the blur it is
paired with.

## Phase 14 — the background stopped being a grid

### Graph paper said nothing

The Phase 13 texture was crossed hairlines on a 52px pitch. It fixed the
flatness and that was all it did. A ruled grid is the background of a thousand
developer landing pages, it belongs to no particular subject, and sitting
behind a bento grid of rectangular tiles it read as a second set of boxes
behind the first set of boxes, which is the opposite of what a background is
for.

It is a doodle field now: git branches, merges, pull requests, forks, commits,
terminals, braces, a folder, a bug, a package, and one octocat, scattered at
varying sizes, rotations and weights. Same job, and it is about something.

### Why the pattern is generated rather than drawn

`scripts/build-doodle-pattern.mjs` composes the tile from lucide-react's own
`__iconNode` data and react-icons' FaGithub path. None of the icons are
redrawn. Two reasons: the marks in the background are then literally the same
marks used in the foreground of the site, and they stay correct if either
library is updated. Hand-tracing sixteen icons into a static file would drift
from the real ones within a release, and nobody would notice until the shapes
were subtly wrong.

Three details in the generator carry real weight:

- **Stroke width is divided back out per mark.** Lucide is authored on a
  24-unit grid at stroke-width 2, so scaling an icon to 30px renders a 2.5px
  stroke and scaling it to 22px renders a 1.8px one. Left alone, the field
  looks drawn with several different pens. Each mark's stroke-width is
  corrected so every line lands at the same rendered weight, which is what
  makes it read as one hand.
- **Placement is hand-set, not seeded random.** A doodle field wants
  deliberate irregularity. A seeded RNG reliably produces clumps and bald
  patches that then have to be corrected by hand anyway, so the hand-placement
  is the shorter path to the better result.
- **Marks that cross a tile edge are re-emitted on the opposite side.** That is
  what makes the tile wrap without a visible seam. The reach is deliberately
  generous, because rotation grows a mark's effective box and an under-wrapped
  mark shows up as a clipped icon at the seam, which is far more visible than a
  redundant copy.

### The octocat was giving away the repeat

The first tile was 440px with two octocats in it. The repeat itself was
invisible, but the octocats were not: they are the only _filled_ marks in a
field of strokes, so the eye locks onto them, and at 440 they recurred about
three times across a 1440px viewport in a visibly even rhythm. The fix was to
widen the tile to 540, cut to one octocat, and drop its weight. The lesson
generalises: in a scattered field, the heaviest mark is the one that betrays
the grid, so its spacing is the spacing you actually have to hide.

### One asset, two themes

The field is painted by masking a flat `currentColor` fill with the SVG, rather
than by loading the SVG as a background image. A background image carries its
own colours and would need a second file for dark mode; a mask carries only
alpha, so the colour comes from a Tailwind text utility and light and dark get
separate values from one asset. The top and bottom fade is a second mask, and
stacking two mask-images on one element requires `mask-composite`, which is
still uneven across browsers, so the two are nested instead. Nesting composites
them for free.

### The empty tiles

Three stat tiles and the "Start contributing" tile were a small icon, a number
and a label in a box with most of its area empty, sitting next to a feature
tile carrying a 28rem Invertocat. The emptiness read as unfinished rather than
as restraint, which is the user's own observation and it was right.

Each now carries an oversized, nearly invisible glyph. The three stat tiles
echo their _own_ icon, so they stay told apart rather than all receiving the
same decorative mark. The green members tile draws its `Users` mark in the
tile's own text colour rather than a grey, so it stays a shade of the green
instead of putting a third value on an accent surface. "Start contributing"
gets a pull request arrow, because that is literally what its button asks for
and because the terminal tile diagonally opposite ends on "Opened pull request
#218" - the two tiles now answer each other.

### Phase 14b — the doodles were still too coarse, and the one parallax

The 540px tile with 22 marks at 22-36px was the wrong direction. Each mark was
large enough and far enough from its neighbours to be read as a drawing, and a
background made of readable drawings argues with the foreground instead of
sitting behind it. The user's word for it was that it was shifting focus, and
the reference they gave was right: the grip texture on a game controller, where
many very small symbols packed tight at almost no contrast stop being symbols
and become a material.

So the tile is 306px with 81 marks at 13-18px on a staggered 34px lattice. The
three variables move together and none of them works alone:

- **Small.** Below roughly 20px a glyph stops asking to be identified.
- **Tight.** A staggered lattice, so density is even with no corridors or
  clumps. The stagger matters: a square lattice this tight reads as a grid of
  dots from a distance, which is the thing being replaced.
- **Faint.** Packing it this densely raises ink per square inch several times
  over, so the layer alpha had to come down with it. Ink per square inch is
  what the eye responds to, not the opacity of any one mark.

Placement flipped from hand-set to a seeded jittered lattice, which reverses
the reasoning recorded in Phase 14 above, and the reversal is the point: at 22
sparse marks a lattice would have been obvious and hand-placement was the
shorter path to an even field; at 81 dense marks the lattice is invisible and
is the only thing that guarantees even density. The PRNG is seeded so the
committed SVG stays reproducible and unrelated rebuilds do not produce a noisy
diff.

Two implementation details worth keeping. Each icon is emitted once into
`<defs>` and referenced by `<use>` - at 93 placements, inlining the geometry
every time would be most of the file. The symbols carry no `stroke-width` of
their own, which is what lets each `<use>` wrapper inherit a different one, and
that inheritance is what makes the per-mark stroke correction possible at all.

### Dark mode is the calibration reference

Worth writing down because it is not obvious from the code: this page is judged
in dark mode first. The doodle alphas were set at 0.095 light against 0.05
dark, which looked reasonable in isolation but ran visibly hotter than dark
when the two were compared directly. Light came down to 0.055. When a value has
separate light and dark settings on this site, set dark first and bring light
to match it.

### Parallax, in exactly one place

The doodle field moves 28px either side of centre across a section and nothing
else on the page moves at a different rate. It is the one layer whose entire
job is to sit behind the content, so moving it slower is the literal thing
parallax is for.

Three constraints shaped the implementation. It uses `useScroll` against its
own element rather than a scroll listener, because this page already has Lenis,
a rAF loop for the mascot and a scroll handler for the journey rail competing
for those frames. The moving layer overhangs its container by 44px, which has
to exceed the 28px of travel or the translate exposes an uncovered strip at one
edge of the section. And the container needs `overflow-hidden` to clip that
overhang, which is safe here despite the sticky gotcha in CLAUDE.md only
because nothing sticky lives in the subtree - it holds one decorative div.

The travel is deliberately small. Past roughly 80px the field starts visibly
sliding rather than sitting slightly back, and a texture that draws attention
to its own movement fails in the same way as one drawn too large.

## Phase 15 — three things that were structurally wrong

### The fade was only half of why the pattern looked disconnected

Each section painted its own copy of the doodle field, and each copy started
its tile at its own top edge, so the pattern restarted at every boundary. The
top-and-bottom fade then drew a line under that: instead of one surface the
page sits on, you got a series of separate swatches.

Both are fixed. The fade is gone entirely - the field runs edge to edge. And
each section's mask is offset by that section's own position in the document
(`documentTop % TILE`), so every copy is a window onto one grid that runs the
whole page.

The parallax had the same flaw and it is worth stating separately, because the
first implementation looked correct in isolation. It used `useScroll` with the
section as target, so each section had its own progress through the viewport
and therefore its own phase of movement. Adjacent fields drift apart the moment
you scroll, and a seam that is invisible at rest opens up as soon as it
matters. It now reads the window's scroll and every section applies the same
value, wrapped into one tile: the pattern is periodic with period `TILE`, so
translating by a whole tile is indistinguishable from translating by nothing,
which keeps the offset bounded on an arbitrarily long page and makes the wrap
invisible.

### The mascot's follow was doing a job it could not do

`FOLLOW = 0.085` per frame was wrong twice over.

It was frame-rate dependent: the same scroll converged twice as fast at 120Hz
as at 60Hz, and under-converged on any dropped frame.

The real problem was structural though. At 0.085 a frame the mascot needs about
a second to cross the screen, and it was the _follow_ that carried it from one
dock to the opposite one. Scroll past a section faster than that, which is most
scrolling, and the next crossing began before the last finished. It never
arrived anywhere; it hovered near the middle of the viewport drifting slowly
leftward, which is exactly what got reported. Measured over a full-page scroll
it covered x=738 to x=1283 when the two docks sit at 98 and 1342 - it reached
neither, ever.

The crossing belongs to `resolveDock`, which interpolates between docks across
the last stretch of each section and is a pure function of scroll position, so
it always completes exactly when the boundary is reached. The follow is now
only a smoother on top of that, time-based (`1 - exp(-dt / FOLLOW_TAU)`) with
dt clamped so a backgrounded tab does not resume with one enormous step.

The general lesson: if an eased follow is the thing transporting an element
between two states, the transition is at the mercy of how long the user spends
there. Make the path a function of the driving input and let the easing only
take the edge off.

### The hero stare was a consequence of the docked rule

The gaze blends by proximity so that a mascot parked at the edge of the page
does not hold a saturated stare in one direction. In the hero that rule is
exactly backwards: the mascot is the largest thing on screen and the only thing
to look at, and the cursor is usually further away than `GAZE_FALLOFF`, so the
proximity term was near zero and the resting bias won every frame. It now
tracks at any distance while in the hero and fades into the proximity rule as
it docks. The inward resting bias is faded in the same way, because a mascot
presented face-on at full size should not be staring off the side of its slot.

### Semi-transparent strokes compound where sub-paths cross

A lucide glyph is several overlapping sub-paths - `git-branch` runs its line
straight through the circle it joins, rather than stopping at the circumference.
Painted with a semi-transparent _stroke colour_, each sub-path is composited
separately, so the alpha adds where they cross and you see a darker line drawn
over the shape it is supposed to connect to. At the very low alphas these
ornaments use, that doubled segment is the most visible part of the glyph.

Element `opacity` fixes it by definition: it establishes a compositing group,
so the glyph is rendered opaque and the single result is then made transparent.
Overlaps cannot compound. Every faint ornament now sets an opaque colour plus
an opacity, and a sweep of the rendered page confirms no multi-element SVG is
left with a semi-transparent `color`.

One detail worth keeping: there is a single opacity value per ornament, with
only the colour varying by theme. `dark:opacity-*` and `group-hover:opacity-*`
set the same property at equal specificity, so which wins in a dark-mode hover
would come down to Tailwind's emitted order, which is not something to rely on.

### A base rotation added to a deflection is asymmetric by construction

The mascot's yaw was `BASE_ROTATION_Y + pointer.x * 0.5`. The base exists to
give the octocat a three-quarter resting pose rather than a flat front-on
stare, which is right at centre and wrong at both extremes: at full left the
base and the deflection point the same way and compound to 0.65 rad, at full
right they oppose and cancel to 0.15, which is still almost face-on. The bug
reads as "it only turns one way" but is really "the resting pose never goes
away".

The fix is to treat the base as a pose that belongs to the rest state and
nowhere else: `BASE_ROTATION_Y * (1 - |x|) + x * MAX_YAW`. At x=0 it is exactly
the old resting pose; at either extreme the base has faded out entirely and
only `MAX_YAW` remains, so the two sides mirror.

That was necessary and not sufficient, which is the more useful half of this.
The weighting only sheds the base at `|x| = 1`, and the caller never sent it
there: the docked gaze bias in `v2-mascot.tsx` was `+/-0.5`, so half the
resting pose survived at both docks and the original asymmetry survived with
it, merely halved - left at 0.65 rad, right at -0.25. Fixing the formula while
leaving the input at half scale looked like a fix and measured like one at the
extremes, but the extremes were never reached in practice.

So the two constants are one decision, not two. The dock bias is a full
deflection (`+/-1`) because a docked mascot pinned to an edge looking across
the page _is_ the most turned it ever gets, and `MAX_YAW` carries the whole
angle at 0.65 - chosen as exactly where the left already sat, so the side that
looked right is unchanged and only the wrong side moves.

Two general lessons. Any time a constant offset is added to a symmetric input,
check both ends; the midpoint looks correct either way. And when a formula is
conditioned on its input reaching a limit, check that the caller actually
reaches it - a normalisation that is never driven to 1 silently leaves a
fraction of whatever it was meant to cancel.

### Removing a theme is mostly removing the machinery, not the colours

Collapsing 470 `dark:` variants was the mechanical part and a lexer handled it.
The parts that needed thought were all machinery:

- `color-scheme: dark` has to be declared explicitly. Scrollbars, form controls
  and the default canvas are the browser's to paint, and it paints them light
  unless told otherwise. With a theme class there was something to hang that
  off; without one it has to be stated.
- `suppressHydrationWarning` and the anti-FOUC script both existed solely to
  cover a class written to `<html>` before hydration. With one theme the server
  and client markup already agree, so both are dead weight.
- Names outlive their reasons. `GhMascotToggle` and `aria-label="Toggle theme"`
  described a job the button no longer has, and two unrelated files
  (`mascot-glow.tsx`, `mascot-easter-egg.tsx`) located the mascot _by that
  label_. Renaming had to happen in the same change as the selectors, or the
  glow would silently stop finding its target - a failure with no error, just a
  glow that never appears.

The lesson for the sweep itself: a regex that treats `'` as a string delimiter
will eat prose comments. An apostrophe in "someone else's uptime" opened a
phantom string that ran to the next apostrophe and collapsed everything
between. A real lexer that tracks comment and string states is the only safe
way to rewrite source text in bulk.

### A marquee loops on the track, not on its rows

The band under the hero animated each of its two rows by `translateX(-100%)`.
That looks like the standard trick and is not: a row translated by -100% moves
its own width, so the pair only ever covers two row-widths of travel and the
cycle ends with the second row at x=0 and nothing after it. Whether the seam is
visible then depends entirely on how the row's width compares to the viewport,
which is why it looked fine at some sizes and visibly restarted at others.

The correct shape is to animate the track and move it by a whole number of
copies of its content. With exactly two identical halves that is `-50%`: the
frame after the wrap is the same picture as the frame before it, at any
viewport, because the track is literally periodic with that period. The only
remaining requirement is that one half be wider than the screen, which is a
content-length decision (three repeats of the word list here) rather than
something the animation can fix.

Worth keeping separate from the older `infinite-scroll` keyframe, which travels
-100% and is correct for its own caller, where the animated element is each row
and the rows are wide enough. Same-looking animations with different contracts
should not share a name.

### One icon family, including the wordmark

The v2 nav carried lucide's `Github` while every other GitHub mark in the tree
came from react-icons. At a glance it reads as "the logo looks slightly wrong"
without the cause being obvious: the lucide mark is a hollow stroke outline and
the react-icons one is solid, so the wordmark was thin and unfilled next to
solid marks further down the same page.

This is the kind of leftover that survives a redesign precisely because the
wordmark is not thought of as an icon. It is worth checking the header against
the icon inventory whenever the body of a page changes families.

### An inverted vignette turns a backdrop into a rug

The hero's contribution graph read as a mat the mascot was standing on. The
cause was one gradient. The mask ran

    radial-gradient(ellipse 62% 62% at 50% 50%, transparent 16%, black 76%)

which is transparent at the centre and opaque at the rim: the exact inverse of
a vignette. The intent was sound, clearing space behind the mascot so the
graph would not compete with it. The side effect was that the cells reached
full strength precisely where the grid's rectangle ended, drawing a hard
rectangular boundary, centred on the subject. A bounded shape centred behind a
subject is a rug, and no amount of tuning the colour would have changed that,
because the shape was doing it.

The general rule: a field with visible edges is an object, and a field that
fades to nothing before its edges is environment. If a background should read
as environment, its falloff has to be outward. Anchoring the ellipse at the
edge the field bleeds off (`at 100% 50%`) gets both in one gradient: strongest
where it leaves the frame, gone before it reaches the content.

The second half of the fix was compositional rather than tonal. It was centred
on the mascot, which is what made it read as _its_ mat rather than the page's
atmosphere. Hanging it off the section instead of the mascot's column, and
letting it overhang right, top and bottom, means it is never seen whole.

The tell that the diagnosis was right: the join band runs the same motif and
never had this problem, because it was already full-bleed with a directional
scrim. When one instance of a motif works and another does not, compare their
treatment before touching either one's colours.

### The browser pane cannot judge a low-contrast animated field

Tuning the graph's weight in the pane was actively misleading. The pane
starves rAF, so the framer-motion entry animation and the per-cell CSS twinkle
both sit frozen near the keyframe's trough, and the field renders far fainter
than it actually is. Trusting that reading led to a first pass so light that
the right half of the hero was empty again, which is the defect the graph was
added to fix.

The workaround is to pin the steady state before judging: set the entry
element's `opacity` to 1 and `animation: none` on the cells, then screenshot.
That shows what a real browser shows. Any future work on a faint animated
texture should do this first rather than tuning against a frozen frame.

### Reserving height with the content that varies defeats the point

The terminal tile renders its finished transcript invisibly underneath and lays
the typing over it, so the tile is its final height from the first frame rather
than growing a line at a time and shoving the rest of the bento row down. That
was right when there was one script.

With ten scripts drawn at random it quietly stopped working, for a reason that
is not obvious. The server renders the first script and the client swaps in a
random one after hydration. The reservation was the drawn script's own lines,
so if the drawn script wrapped a different number of lines than the first one -
and at a 383px tile several of them do - the tile changed height just after
hydration. The reservation was tracking the thing it was supposed to be
insulating against.

The fix is a reservation that is not the content: six lines built from the
longest input, output and success text across every script. It is at least as
tall as any variant, and byte-identical on both sides of hydration. It costs
some slack at the bottom when a short script is drawn, which is a much better
trade than a tile that resizes under the reader.

The general shape: if a reserved dimension is computed from data that can
change after first paint, it is not a reservation. Compute it from a bound over
all possible data instead.

### Randomising something that also renders on the server

`Math.random()` during render is a hydration mismatch, which the contribution
grid already documented in this codebase. The reflex fix is to set state in a
mount effect, but that is also what `useSyncExternalStore`'s third argument
exists for, and it says the intent directly: a fixed server snapshot, a cached
client snapshot, and React swapping them after hydration. No effect, nothing
for the `react-hooks/set-state-in-effect` rule to object to, and the cache
lives at module scope so a remount does not re-roll mid-visit.

### A marquee's `duration` is per copy, not per pixel

`InfiniteSlider` animates its track from 0 to minus half the doubled content
width over `duration` seconds. That means `duration` is the time to traverse
_one copy of the list_, whatever that copy happens to be worth in pixels. Going
from twelve tools to twenty-four therefore doubles the distance covered in the
same time, and the marquee silently runs at twice the speed.

Nothing about the call site hints at this: the prop is named for a duration and
behaves like one, but the perceived speed is `width / duration` and only one of
those two is written down. Any change to the number of items has to move
`duration` with it to hold the speed. Worth checking whenever a list feeding a
marquee grows.

### Check the icon export before trusting the brand name

Brand names and Simple Icons slugs are not the same namespace, and the gaps are
not guessable. `SiCockroachlabs` exists and `SiCockroachdb` does not, because
the set carries the company mark rather than the product's. More sharply, there
is no AWS icon at all: Simple Icons removed every Amazon mark over trademark
policy, so `SiAws`, `SiAmazonaws` and `SiAmazonwebservices` are all absent from
react-icons 5.7.0.

The temptation on a miss is to reach for the nearest thing that renders, which
here would have been the Amazon retail smile standing in for AWS: a different
company's logo, shipped silently. The right move is to check every name against
the installed package first, and to report a gap as a gap rather than papering
over it with a substitute or a hand-drawn path.

### Verify transferred path data by hash, not by eye

The AWS mark had to be carried into the repo by hand because Simple Icons has
no Amazon logo and the site's own network access to the source was gated. That
meant moving 4350 characters of path coordinates, which cannot be proofread: a
single transposed digit produces a shape that still renders and is wrong in a
way nobody notices until it ships.

Hashing both ends settles it. The browser computed a SHA-256 of the `d`
attribute at the source, and the same hash was recomputed from the file after
writing. Equal hashes mean the transfer is exact, which no amount of reading
can establish. Worth doing for any opaque blob moved between systems by hand.

### A wordmark does not blend into a set of glyphs by colour alone

Matching the AWS logo to its neighbours meant `fill="currentColor"` so it
inherits the hover, which was the obvious half. The half that actually decided
whether it looked native was geometry. The source pads a 30x18 wordmark into a
32x32 square; dropped into the square box the glyphs fill, it renders
letterboxed and reads as the one small, faint logo in the row.

Cropping the viewBox to the artwork gives it an honest intrinsic ratio, and
rendering it at a shared height with `w-auto` rather than a shared box lines it
up on cap height with the glyphs. Glyphs are sized by their box; wordmarks are
sized by their height. A set containing both needs to say which each one is,
which is what the `wide` flag on the tool list does.

### A copy audit that only greps the repository is incomplete

Sweeping the source for struck phrases came back clean, and the rendered page
still contained two of them. Both were rows in the D1 `events` table: this site
has been CMS-backed since board members and events moved into the database, so
an unknown amount of its visible text simply is not in the repository.

The reliable check is to read `document.body.innerText` on the rendered page
and search that, which is what the reader actually sees regardless of where it
came from. The source grep then only tells you which half of the problem is
yours to fix in code and which half belongs in `/admin`, and the CMS half has
to be fixed on the remote database too, not just the local seed.

### A 3D model's container is not free to be any shape

The octocat inside the project hover preview was drawn as a head with no arms.
The cause was not the model or the lighting: `gh-mascot-3d` positions its
camera to frame the whole model at an aspect of about 1.25 and does not reframe
for whatever container it lands in, so a 76x88 portrait box simply cut the
sides off. Every other slot on the site happens to be 1.25 already, which is
why this had never surfaced. The box is 110x88 now, and the ratio is recorded
in a comment at the call site because the next person to nudge those numbers
has no other way to know it matters.

### A pointer-following card makes viewport-relative gaze meaningless

The same mascot was fed the cursor's position within the viewport as its gaze
target, which is the obvious thing to write and is wrong here. The preview card
is pinned to the cursor, so the mascot's offset from the cursor never changes;
feeding it viewport coordinates meant it swung its head to the extreme left or
right purely because the pointer happened to be near a screen edge, while the
thing it was supposedly looking at was in the same place the whole time.

The honest value is a constant: the angle from the mascot's corner of the card
back down to the cursor, mirrored when the card flips to the other side of the
pointer near the viewport edge. A slow sine drift sits on top, because a
perfectly still head on an otherwise animated model reads as broken rather than
as calm.

### Lazily mounting an expensive child without setting state in an effect

The WebGL mascot should not mount until someone goes near the project list.
Written as an effect watching the hover target, that is `set-state-in-effect`,
which React's lint rules now reject; written as a ref latched during render, it
is `react-hooks/refs`, which they also reject. The version that is both legal
and better is to arm it from the pointer handler that already exists on the
list container: arming is a response to an event, and the first pointer move
over the list arrives slightly before hover intent resolves, so the model gets
a head start. React bails out of the re-render once the value stops changing,
so calling the setter on every move costs nothing.

### One mascot, and a perch it can be called to

The project hover preview mounted its own `GhMascot3D` inside the card. It
looked right in a still screenshot and was wrong in motion: the page's mascot
carried on down its scroll rail while a second one blinked into existence on
the card, and when the preview closed that second one vanished rather than
going anywhere. There is one octocat in the fiction, so there is one in the
DOM.

The mechanism is a module-level perch (`features/v2/mascot/perch.ts`) that the
preview writes and the mascot's existing frame loop reads. It is deliberately
not context or state: the only reader is a requestAnimationFrame loop that is
already running every frame, and routing a pointer-rate number through React
would re-render the mascot on every mouse move to deliver something a ref
carries for free.

The mascot blends toward the perch with its own time constant, slower than the
dock follow. The dock follow is a correction and wants to be invisible; leaving
the rail to go and sit on a card is the one moment the mascot does something a
reader should notice, so it takes long enough to read as a trip. The same
weight drives the scale, so the journey is one movement rather than a slide
followed by a resize, and the last perch is kept after it is cleared so the
return has somewhere to start from rather than snapping.

The gaze needed no special case at all. Perched, the mascot is genuinely within
a few hundred pixels of the cursor, so the distance falloff that already
governs its docked gaze picks the cursor up on its own and it looks down at the
pointer. The fixed-angle hack written for the old in-card mascot went with it.

A row with no live URL publishes no preview and therefore no perch, so a
project the CMS marks in progress keeps the mascot on its rail without any code
that knows about statuses.

### Where a divider is allowed to go

The projects section ran straight into the benefits stack with nothing between
them: measured, both boundaries sat at the same pixel. The obvious fix is a
`HatchBand`, and it is the wrong one. The hatch on this page means "the
textured middle of the document starts or stops here", which is why there are
exactly two of them; a third mid-run would demote it from a structural mark to
a decorative motif. The section gets a hairline bottom rule instead, which is
the language it already speaks internally, since its own rows are separated
that way.

### Every client-only fact a component branches on has to arrive the same way

GlassSurface picks one of four style branches from three client-only facts:
whether an SVG filter works inside `backdrop-filter`, whether plain
`backdrop-filter` works at all, and whether the reader has asked for reduced
transparency. Two of them went through `useSyncExternalStore` with a
conservative server snapshot, and the third was left as a direct call in
render.

That one call was enough. It answered false on the server and true in the
browser, so the server emitted the fully solid branch and the client's first
render produced the blurred one, and React reported a hydration mismatch
listing every property of both branches - a wall of output whose actual cause
was a single unwrapped function call. The rule is not "wrap the interesting
probes"; it is that if a component branches on a client-only fact, every such
fact has to reach render through the same mechanism, because the branches are
all-or-nothing and one stray value picks the wrong one.

The same report flagged a numeric CSS custom property. React serialises
`"--glass-frost": 0.24` into the server HTML differently from the client style
object, so custom properties are set as strings.

### A backdrop filter cannot be nested inside another one

The navbar shell animates `backdrop-filter: blur(12px)` on the bar itself as it
shrinks. Dropping a refractive surface inside that does not compose: the outer
filter establishes a backdrop root, so the inner one filters an already-blurred
image and the refraction turns into a smudge. The shell grew a `backdrop` slot
that both renders the surface behind the bar's contents and switches the bar's
own filter off, so the two cannot be enabled at once by accident.

The slot is a render prop taking `visible`, because only the shell knows the
shrink state, and the surface has to fade in with it. The function is hoisted to
module scope: defined inline it would be a new identity every render, which
remounts GlassSurface and with it the `useId` its filter is keyed on, leaving
`backdrop-filter` pointing at a filter that no longer exists.

### Measure CPU against the process, then attribute it inside the page

"The site uses too much CPU" was answered by numbers rather than by suspects.
`top` against the browser pane's renderer process, averaged over several
seconds, gives a real figure (115% on `/v2` against 6% for a trivial page).
Switching one suspect off at a time from the console and resampling gives each
one's share. Wrapping `requestAnimationFrame` for a few seconds attributes the
main-thread share to individual loops by name.

The largest single cost was not on the list of suspects at all. `MascotGlow`,
mounted in the root layout and so running on every page including `/admin`,
did a document-wide `querySelector`, a layout-forcing `getBoundingClientRect`
and a `setState` on every frame, then wrote a new width and height onto an
element with `blur(70px)`, which re-laid-out and re-rasterised the blur every
frame. It cost more than everything else on the main thread combined. The
lesson is to profile before optimising: the glass, which looked expensive, was
second; the grid was third.

### A reference backdrop-filter is paid per composited frame, not per change

With every animation on the page stopped, the SVG-filter glass cost nothing
(renderer 2%). With anything moving anywhere, it re-ran every frame, because
Chromium re-renders a `backdrop-filter: url(#...)` whenever it produces a
frame, not only when the region behind it changes. So its cost is the filter's
complexity multiplied by how often the page composites. Both halves were cut:
fewer things composite constantly (the grid is a 24fps canvas that stops off
screen, the scan lines only repaint when they move a whole device pixel), and
the filter is one displacement instead of three plus recolouring and blending.
The colour split was compared side by side in the browser at the bar's tint
and was not visible, while it was about 70% of the glass's cost. It remains a
prop, on by default, so the component still does what the snippet did.

### Many small animated elements are a layer each

600 `<span>`s each running a CSS keyframe with `will-change` are 600 compositor
layers and 600 animations ticked at the display's refresh rate, whether or not
they are on screen: CSS animations on a scrolled-away element keep running.
One canvas redrawn at 24fps is visually identical for a 5-to-9-second breathing
cycle, keeps the same hash-derived pattern, and can actually stop, via an
IntersectionObserver, which a stylesheet cannot. Its backing store is capped at
1.5x device pixels because at 2x it is 11.5MB for soft, low-alpha squares under
a mask.

### Sub-pixel animation of a repaint-bound property is waste

`background-position` animates on the main thread with a repaint per frame.
The hero's scan lines travel a few pixels a second, so at 120Hz almost every
repaint moved them by a small fraction of a pixel. Stepping the animation at
half a CSS pixel, one device pixel on retina, repaints only when there is a
visible pixel to move, and cannot look different because the display cannot
show finer movement.

### Forced-flush cost moves; it does not disappear

After the glow was removed, the mascot's own loop appeared to cost more (9 to
about 25ms/s). It reads `window.scrollY` and `innerWidth`, which force a style
flush if anything changed since the last one, and the glow's loop used to run
first each frame and pay that flush inside its own, much larger, number. The
flush is work the browser does once per frame for any animated style anyway,
so moving the reads would only move the number again. Total rAF main-thread
time is the figure that matters, and it fell from about 250ms/s to 73ms/s.

### A section without a dock inherits a contradiction

The mascot's docks are a list of section ids, and projects was added to the
page without being added to that list. A section with no dock does not leave
the mascot idle: `resolveDock` keeps the previous section's dock with its
progress pinned at 100%, which puts the position fully into the crossover to
the next dock while the gaze, keyed to the dock it is nominally on, still
thinks it is on the other side. For projects that meant sitting on the right
and staring off the right edge for the entire section.

Three changes, each closing a different way back into that state. Projects has
a dock. Sides are no longer written per dock but assigned from order among
the docks actually present, because sections are CMS-driven and hard-coded
sides only zig-zag when every section exists. And during a crossing the gaze
switches to the destination's side at the midpoint, so position and gaze can
never disagree for more than half a crossing, whatever the dock list says.

Alternation is a default rather than a rule: benefits pins itself right,
because its stacked cards put their headings at the left edge and a left dock
sits on top of them. Measured, not assumed; the strict alternation looked
right until the benefits screenshot.

### Publish a follower's target from what the leader draws, continuously

The perch was sent once, on hover start, from a value that the pointer handler
kept updating and never sent again. The mascot therefore flew to the card's
first position and stayed there as the card followed the cursor away, which is
how it ended up sitting on the preview image rather than on its rim. Now the
perch is derived from the card's drawn motion values and republished on every
change, so the two cannot come apart. Once perched, the mascot also drops its
own follow smoothing (by the same eased weight that carried it there), since
the card is already spring-smoothed and easing it twice reads as dragging.

### Snap or spring is a decision for the move handler, not an effect

The card should appear at the cursor and only then glide. With `useSpring`
over a raw target that required `jump()` on the spring when the hover began,
in an effect; whether that effect ran before or after the first cursor
position was recorded depended on whether React or the native listener saw
the entering event first. When React won, the spring was left parked near the
top-left corner until the next move. Plain motion values with the decision
made inside the move handler (snap while hidden or just appeared, `animate`
with the spring once showing) have no ordering to get wrong.

### This pane starves animation frames between screenshots

A verification loop that scrolled to each section and waited on `setTimeout`
reported the mascot on the wrong side in projects, which sent me looking for a
bug that was not there: without something pumping frames the mascot had not
moved yet. Anything animated has to be measured after a screenshot or a
`computer` wait, never after a bare timer.


## Phase 23 - project pages, people, commit counts

### Facing the viewer is not gaze zero

The model's yaw is `BASE_ROTATION_Y * (1 - |x|) + x * MAX_YAW`, so a gaze of
0 keeps the resting 0.4 rad turn. That is why the perched mascot looked
sideways even with the cursor ignored. Facing the camera is
`x = -BASE / (BASE + MAX_YAW)`, about -0.38, exported as `FACING_FORWARD_X`.
The pose constants moved to `components/mascot/pose.ts` so the v2 rig can
import them without pulling three.js out of the model's lazy chunk. While
perched, cursor tracking and idle drift are blended out by the same weight
that flies it to the card.

### One people table, shaped like the board

`members` copies the board_members columns (role as headline, description
as bio, github as a username, accent as a BOARD_ACCENTS key), so a board
member and a project contributor render through one `ProfileDialog`. The
coming members page reads the same table and opens the same dialog, which
is what the brief asked for. The dialog was `MemberDialog` in
`features/v2/board/`; it moved to `features/v2/people/profile-dialog.tsx`
and takes `children` for context from where it was opened ("Team lead on
Campus Mess Menu" and their contribution).

The project role is `project_members.role`, a key into `PROJECT_ROLES`. It
is aliased to `project_role` when joined, because `members.role` is already
the person's headline. Sorting by role happens in JS from `rank`, so the
order (maintainers, lead, members) has one source.

A photo falls back to `avatars.githubusercontent.com/<username>`, which
serves the image directly (no redirect), so most contributors get a face
without anyone uploading one.

### Commit counts are cached, never fetched on a view

GitHub returns the total in one request: `per_page=1` makes the `Link`
header's `rel="last"` page number the commit count. It is stored in D1.
Saving in the CMS always re-syncs (so saving is also the way to refresh);
page views refresh counts older than a day inside `after()`, so the visitor
gets the cached number and the next visitor the fresh one. A failed refresh
keeps the old number but still stamps the time, so a dead repo is retried
daily rather than on every view. A CMS save with a failed fetch clears it,
since a changed repo URL must not keep the old repo's number.

### Why the page transition is hand-rolled

The brief wanted the opening from a card into a project to feel continuous.
The View Transitions API does that, but it has to be told when the new page
is on screen, and an App Router navigation gives no such signal. React's
`<ViewTransition>` and Next's `experimental.viewTransition` are the intended
route, and this Next build (16.3.5) has neither the flag nor the types.
Instead `TransitionLink` starts the transition and navigates, and
`<TransitionSettled />` resolves it from a layout effect once the
destination has committed. The 2.5s fallback means a slow or failed
navigation cannot leave the old page frozen. The homepage does not mount
the settler, so the back link to it opts out; any new destination has to
mount one or it will sit on the fallback.

`transitionName()` lives in its own non-client file: the project page is a
server component and cannot call a function exported from a `"use client"`
module.

The title morph uses an inline-block span on the project page, so its box
hugs the words like the card's does. Two boxes with the same shape scale
cleanly; a full-width h1 would stretch the text mid-flight.

### AvatarCircles

The shadcn install command given fails with "Authentication required": the
21st.dev registry wants a login. The component has no dependencies beyond
`cn`, so it was written from the pasted source and adapted there: people
rather than URLs (for names and initials), faces as buttons, an overflow
count computed from what was hidden (the original rendered "+undefined"
without `numPeople`, and `href=""` reloaded the page), a ring in the page
background colour, and next/image.


## Phase 24 - members page, teams, avatars, inner-page mascot

### Avatars, not photos

Members asked not to show their faces, so member images are avatars they
generate. Two consequences. The GitHub profile picture fallback from Phase
23 went, because for many people that picture is a photo of them. And the
prompt (`docs/member-avatar-prompt.md`) fixes everything about the image
except the person: square, head and shoulders, facing forward, head in the
middle 60%, flat #161B22 background, no text. A grid of avatars only looks
like a set if they are framed the same, and the site crops them all to a
circle. Pixel art is the default because it sits naturally beside the
identicon fallback and the contribution-graph look of the site; the cartoon
variant exists but mixing the two on one page reads as inconsistent.

The fallback is a GitHub-style identicon (5x5, mirrored, FNV-1a of the
name) in the first stop of their border colour. It is what GitHub shows for
an account with no picture, it is deterministic, and it reads as pixel art.

### Teams are a table, not a key set

The CMS rule is that anything picked from a fixed set is stored as a key
defined in code. Teams are not that: the club names and renames its teams,
so they are content. A `teams` table with its own admin screen, and
`members.team_id`. Deleting a team nulls the members' team explicitly
rather than relying on ON DELETE SET NULL, for the same reason the other
deletes are explicit (foreign keys may be off on the connection).

### One avatar component

`MemberAvatar` draws the avatar inside the conic profile border for the
members grid, the popup and the CMS preview, so the border an admin picks is
the one the page draws. The ring spins always in the popup, only on hover in
grids (a page of spinning rings is noise and a compositor animation each),
never at small sizes.

### Team2, adapted

Kept: the avatar floating half out of the card on a raised plate, the
two-rate lift on hover, the ruled-off figure. Changed: one card per call
rather than a hardcoded list; the avatar is a slot; the card opens the
profile through a stretched button on the name (a button wrapping headings
is invalid HTML), stretched up over the avatar too; the original's
`render`/`nativeButton` props are Base UI's API, which this project's shadcn
button does not have, and there are no phone numbers to link anyway. The
figure is how many projects they are tagged on, which is real data.

### The mascot on inner pages

`V2Mascot` was written for the homepage: a ref to the hero slot and a fixed
list of section ids. Inner pages are server components, which cannot hold a
ref, and their sections come from the CMS (one per team on `/members`). So
the rig now also takes a slot id and `docks="auto"`, which docks beside
every `data-mascot-dock` element in document order. `PageMascot` mounts it
from the shared page chrome; a page opts in with `<MascotSlot />` in its
header and the attribute on its sections. `PAGE_MASCOT_SLOT` lives in the
slot file because a string exported from a "use client" module reaches a
server component as a client reference, not as the string.

### Sitting on a popup

A popup is a perch like the project preview, with two differences carried
on the perch itself: a height (the popup is bigger than a preview card) and
`aboveDialogs`. The popup overlay is z-60, the mascot's own layer, and the
portal comes later in the DOM, so a mascot asked onto a popup landed behind
the dimmed backdrop. While going to, sitting on or returning from such a
perch its layer is raised to 70, written straight to the element's style
from the rAF loop so nothing re-renders. `DialogShell` publishes the perch
every frame while open, because the panel springs in and a position read
at mount is where it started, not where it lands.


## Phase 25 - members page fixes

### The scroll from the bottom was the global smooth-scroll rule

`html { scroll-behavior: smooth }` in globals.css is there for in-page
anchors. It also applies to the scroll reset Next performs on every route
change, so navigating from far down the homepage animated the new page from
that offset up to the top. Next 16 only neutralises this when `<html>`
carries `data-scroll-behavior="smooth"`
(`disableSmoothScrollDuringRouteTransition`): it sets `auto` around its own
navigation scroll and restores it, and leaves hash-only changes smooth.
Verified by listening for scroll events across the click: one event, at 0.

### Handle is its own field

The card's handle is not simply the GitHub username. The user asked for it
to be manageable in the CMS, and a member's public handle can differ from
their GitHub account (or they may have none), so it is a separate column
that falls back to `github` when blank (`displayHandle()` in
features/v2/people/profile.ts).


## Phase 26 - avatar style

8-bit was dropped at the user's call. The reasoning for the replacement
default: avatars are shown at about 100px in the grid and 36px in the
AvatarCircles row, and a flat cartoon with bold outlines and large features
survives that reduction where any pixel style loses the face first. 16-bit
stays as the alternative because it has enough resolution for a face to be
recognisably someone's, which 8-bit does not. The fixed framing is unchanged
so a mix of the two still crops identically, though one style per club is
recommended.

## Phase 27 - members polish, proposals, builds

### Members page: why it felt empty, and the hover glow
The doodle texture is uniform, so the page had no focal point. The header now
has a faint wall of the members' own identicons (content, not decoration),
and each team section an outlined watermark of its name plus a glow that
alternates sides, which gives the long page rhythm. The hover glow is inside
the card, as asked: a radial pool of the member's ring colour falling from
where the avatar sits, and a hairline border in the same colour, faded in on
opacity only. It uses the ring's first stop so card and ring read as one
object.

### One stepper form for both
Both forms are aimed at students who have never talked to the club, many not
technical. A long form reads as paperwork; one question per screen with a
line under it saying why it is asked reads as a conversation. Details that
matter:
- Enter moves on, Ctrl/Cmd+Enter in text boxes, letter keys for choices;
  choosing auto-advances after 320ms so the selection is seen landing.
- The review screen's edit buttons return straight to the review
  (`returnToReview`), rather than walking forward through every later step.
- Drafts live in sessionStorage, not localStorage, because the forms hold a
  phone number and lab computers are shared.
- Focus is moved on the enter animation's completion. With AnimatePresence
  "wait" the new step does not exist until the old one has left, so focusing
  on the index change focused the outgoing step and lost focus to <body>.
- Later questions use earlier answers ("Nice to meet you, Asha").
- Questions avoid technical words. "How do you picture people using it?"
  with "Not sure, you decide" replaces a platform question.

### Privacy model
Reg no and phone are collected (the user asked for them) but never leave the
admin screens. Public queries select named columns (`PUBLIC_COLUMNS`) rather
than `*` and trimming, so a future private column cannot leak by default.
Proposals show a first name only (the form says so; admins can edit
`public_name`). Builds credit the full name, because credit is the point of a
showcase, and the form says that too. Declined proposals stay private so no
student's idea is shown publicly with a "no" on it.

### Status as keys, again
Proposal status, audience, format, help, year and build status are all keys
in code, as with every other fixed choice in the CMS. Only `built` is green,
same rule as project statuses: green means "you can use this".

### Public uploads
The admin sign route is behind the session; a public one cannot be. So the
Worker now signs optional `folder` and `allowed_formats` sent by the Next.js
app (never the browser), and Cloudinary rejects an upload whose parameters
differ from what was signed. `/api/builds/upload-sign` always asks for
folder `build-submissions` and refuses to hand out a signature if the Worker
did not sign that folder (an old deployment ignores the body). The build API
then only accepts `https://res.cloudinary.com/.../image/upload/...` URLs in
that folder, so a submission cannot put an arbitrary image from anywhere on
the site. Still open for the security pass: rate limiting, Turnstile, a size
cap.

### "This week" is the latest picked week
Builds carry `week_of` (the Monday, whatever date the admin picks). The page
leads with the most recent week that has any picks, headed "This week's
builds" only if that Monday is this week and "Picked the week of X"
otherwise. Keying the section strictly to the current calendar week would
empty it every Monday morning until someone remembered to pick.

### Why the page designs
- `/proposals` is a repository issue list (status tabs with counts, #id,
  "proposed by"). A proposal is literally a request someone filed that the
  maintainers took on, and the audience reads that shape fluently.
- `/builds` lays months out as GitHub releases (tag, month, count, Latest),
  because the page is a changelog of what students shipped.
- Homepage `#ideas` is a `git log` ending in an uncommitted, dashed node that
  links to the form; `#builds` fans the week's picks like prints, mirrored
  left/right from `#ideas` so the pair do not read as one block twice. Each
  has an honest empty state that doubles as the invitation.

### The admin leak
Found while checking that private fields stay private: logged out, `curl`
on any `/admin` page returned its data, redirect and all. Next renders
layouts and pages in parallel; `redirect()` in the layout only decides what
the browser does, not what the page already queried and streamed. Every
dashboard page now checks the session itself before reading. Middleware
(Next 16 `proxy`) would be the central fix, but it defaults to the Node
runtime and OpenNext's support for that on Cloudflare needs checking before
relying on it, so per-page checks for now. Worth revisiting in the security
pass. CLAUDE.md records the rule.

### Perch at scroll 0
The perch was blended into the dock position, and the dock is itself
interpolated from the header slot by scroll progress `p`. At the top of an
inner page `p` is 0, so a popup opened there left the mascot in its slot,
merely shrunk. It is now blended over the final target instead; with `p` = 1
this is algebraically the old behaviour, so the homepage project preview is
unchanged. Dialogs that perch it also reserve 7rem of headroom, since a tall
panel otherwise starts 7.5vh from the top and the mascot's head is cut off.


## Phase 28 - form pages and tracking links

### Form pages
The page heading and lede sat above a form whose intro screen said the same
thing again, which cost a screen of height and hid Start below the fold at
900px. The intro is the page's h1 now. The mascot's slot moved from the
header into the rail, above "After you send it", where the column was empty.

### Status without accounts
Options considered: look up by reg no + phone (classmates know both, so it
exposes the status of anyone's submission, and invites guessing); email a
link (we collect no email and there is no mail service); a private link. The
link wins: a 192-bit random token, shown once with a copy button, stored only
as SHA-256 so no admin screen or backup holds a working link. Tokens are
shape-checked before hashing. The pages are noindex and no-referrer so the
token does not travel to other sites. A lost link is handled by people: the
not-found page says to ask an admin on the community group. Declined
submissions get plain, kind wording and stay private.

### Custom cursor (opinion given, not built)
Replacing the cursor site-wide fights the octocat, which already watches the
pointer; loses the native cursor's meaning (text caret, hand on links);
lags behind the hand with a spring; ignores users with enlarged system
cursors; does nothing on touch. A scoped label that appears only over a few
clickable surfaces avoids all of that.


## Phase 29 - build pages

### Popups would not scroll
Lenis is stopped while a dialog is open so the page behind stays still. A
stopped Lenis still listens to wheel events and cancels them, including the
ones inside the dialog, so any popup taller than the window was stuck. Lenis
honours `data-lenis-prevent` on an element and leaves events inside it alone,
so the attribute on the DialogShell panel fixes every popup at once.

### Why a page rather than a better popup
The user wanted builds as detailed as projects. A project page has room for
the brief, a gallery, stack, dev notes, links and people, and gives each
build a URL a student can share, which is half the point of being picked. The
card-to-page morph is the same view transition the projects use.

### Credits are names, not members
Most builders are not club members, so the People section cannot use member
profiles the way a project does. Credits are JSON rows (name, role key,
contribution), seeded from the form's name and teammates and edited in the
CMS. Roles are keys like every other fixed choice. The submitter's own name
and teammates stay in their columns as sent, shown in the CMS for reference.

### Slugs
Made from the title on submission so the submitter never sees a slug error;
a duplicate gets the row id appended. `submit` and `track` are reserved,
because `/builds/submit` and `/builds/track` are pages and would shadow a
build with that slug. Editable in the CMS, with a warning that changing a
public build's slug breaks shared links.

### Shared page parts
Block, NotesFrame, StackList and LinkCard left the project page for shared
files, and the commit-count refresh became one function over any table with
a repo and a cached count, so the two page types cannot drift apart. The
format helpers (credit line, stack split) live outside the client card
module because the server page calls them (same trap as transition names).


## Phase 30 - tech stack logos

The stack stays free text in the CMS rather than a fixed key set: tools are
open-ended, and making admins pick from a list would block any tool not on
it. Matching is forgiving (aliases, case, punctuation) and the fallback is
visible rather than silent: an unknown tool renders as a monogram tile the
same size as a logo, with a dashed border, and the CMS preview lists which
names found no logo. That keeps the page even and turns typos into something
the admin sees while editing. Marks are single colour in the text colour, as
in the homepage marquee, rather than brand colours, which would put a dozen
accents on one page. Aliases were checked for collisions, and one was
removed on purpose: D1 had been aliased to SQLite, which would have
relabelled the club's own "D1" on the page.
