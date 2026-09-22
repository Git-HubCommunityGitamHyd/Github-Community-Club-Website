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
