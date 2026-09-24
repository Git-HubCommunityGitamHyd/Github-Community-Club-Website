# v2 redesign — task list

Rationale and decisions for every item: [notes.md](notes.md).

Ordered by the skill's fix priority (font → palette → states → layout → components),
not by the order the sections appear on the page. Each task is done only when it has
been checked in the browser in **both** light and dark, and `tsc` / `eslint` /
`prettier` / `next build` all pass.

---

## Phase 0 — foundation

- [x] `notes.md` + `TODO.md` written and aligned with the brief
- [x] `app/v2/page.tsx` — server component, same parallel D1 fetch as `/`,
      `dynamic = "force-dynamic"`
- [x] `features/v2/v2-page.tsx` — client shell composing the new sections
- [x] `features/v2/smooth-scroll.tsx` — single page-level Lenis provider
      (fixes: Lenis currently owned by the benefits ScrollStack, see notes)
- [x] Verify `/v2` renders alongside `/` with `/` byte-identical

## Phase 1 — typography

- [x] Wire `next/font/google` Geist + Geist Mono as CSS variables
- [x] Extend `fontFamily.sans` / `fontFamily.mono` in `tailwind.config.js` with the
      vars in front of the existing default stacks
- [x] Confirm `/` is visually unchanged (var undefined → falls through to today's stack)
- [ ] Set the v2 type scale: tighter tracking on display, 500/600 weights in play,
      `tabular-nums` on the stat figures

## Phase 2 — navbar (image 3)

- [x] Port `components/ui/resizable-navbar.tsx` — `framer-motion` + lucide, v3 Tailwind
- [x] Re-tone the demo's pastel shadows / `bg-white/80` to the GitHub palette
- [x] Brand it: Octocat + wordmark, section links, theme toggle, Join
- [x] `fixed` not `sticky`; re-tune `scroll-margin-top` and the scroll-spy line for the
      new nav height
- [x] Keyboard + focus states on the pill and the mobile sheet

## Phase 3 — hero (image 6)

- [x] Fix the octocat fading into the dark background — rim light in the r3f scene
- [x] Keep the mascot's scroll-dock, docking it **into the resizable pill** (both,
      per request) — verified pixel-exact against the pill's animated slot
- [x] Fix the canvas collapsing to its docked size after a scrolled reload
- [x] Soft radial plate behind the canvas
- [x] Restage the hero for asymmetry (7/5 split, staggered entry, pill CTAs)
- [x] ~~Decide what replaces the removed mascot→navbar dock~~ — not removed after all

## Phase 4 — journey timeline (images 4, 5) — DONE

- [x] Two-sided, large-format timeline in `features/v2/journey/`
- [x] Git-semantic node icons (branch / commit / star / users / fork / merge / PR / tag)
- [x] Scroll-driven spine draw, sprung so it rides Lenis's inertia
- [x] Alternation verified across all 8 entries

## Phase 5 — benefits ScrollStack (images 7, 8) — DONE

- [x] Port React Bits `ScrollStack` (TS) to `components/ui/scroll-stack.tsx`
- [x] Absolute px for `stackPosition`, not `%` (the large-monitor trap)
- [x] Cards restyled to the GitHub palette (`features/v2/sections/benefits.tsx`)
- [x] Driver verified writing transforms across the stack — the earlier "it never
      runs" was `requestAnimationFrame` not firing in a hidden tab, see notes.md
- [x] Scale ramp fixed: `baseScale` is the bottom card's scale, so six cards need
      `0.85`, not `0.9`, or the top card pins at 1.05 and grows
- [x] Verify on a tall viewport that the gap above the stack does not scale —
      first card pins at exactly 130px on both 900px and 1300px viewports

## Phase 6 — board / team showcase (image 9) — DONE

- [x] Port `components/ui/team-showcase.tsx` — lucide icons, club socials
      (GitHub / LinkedIn / email), not Twitter/Behance
- [x] Map D1 `BoardMember` → `TeamMember` (`features/v2/sections/board.tsx`)
- [x] Column count derived from member count, columns as fractions not fixed
      pixels — verified at 2 (2 cols), 4 (2/1/1), 5 (2/2/1) and 7 (3/2/2)
- [x] Initials fallback for a member with no photo, and an empty state for a
      board that has not been published yet
- [x] Click-to-open dialog keeps `description`; Escape closes it, and it stops
      Lenis rather than only setting `overflow: hidden`
- [x] Seed rows are **kept** in the local D1 so the page is not empty to look
      at. Local only — `.wrangler/state` is gitignored. Clear with
      `npx wrangler d1 execute DB --local --command \"DELETE FROM board_members; DELETE FROM events\"`

## Phase 7 — events (images 10, 11) — DONE

- [x] Port `components/ui/gradient-card.tsx`, structure intact
- [x] **Re-tone**: the four hue variants are gone; neutral surfaces plus the one
      green accent, and cards are told apart by glyph rather than colour
- [x] Decorative object is the **per-category glyph** (the answer given), not the
      event's photo — see notes.md for why the photo stayed in the dialog
- [x] Glyph set + `categoryGlyph()` in `features/v2/events/categories.ts`, with a
      calendar fallback for any category written before this existed
- [x] Admin category field is now a dropdown of the glyph-backed categories, so
      the mapping is something the CMS manages
- [x] Click-to-open dialog keeps the description, the facts and the photo gallery
- [x] Featured first card + two-up rest instead of three equal columns; CTAs
      bottom-aligned so they line up across a row (verified: 524/524, 859/859)
- [x] Seed rows kept locally alongside the board ones (see above)

## Phase 8 — join (images 1, 2) — DONE

- [x] Keep `JoinSquares` untouched — the turning tiles stay
- [x] `components/ui/magnetic-button.tsx` replaces `ParticleText`; pull clamped
      against the button's own half-extent, label travels further than the
      shell, `useReducedMotion` short-circuits it
- [x] Two-column split: reasons-to-apply beside the form, form on 7 of 12
- [x] Inline validation on blur with `aria-invalid` / `aria-describedby` /
      `role="alert"`, errors clearing as the field is fixed, focus sent to the
      first invalid field on submit, live character count on the long answer
- [x] Success state with no exclamation mark; server errors in active voice
- [x] Verified end to end against the real `/api/applications` route

## Phase 8a — react-icons

- [x] `react-icons` installed at the user's request; the brand marks (GitHub,
      LinkedIn, Instagram, WhatsApp) now use it in the team showcase, the member
      dialog, the join section and the footer. lucide keeps the plain UI
      affordances — arrows, close, calendar, pins.

## Phase 9 — pass over the whole page

- [ ] Section rhythm and band alternation across the new composition
- [ ] Hover / active / focus on every new interactive element
- [ ] `prefers-reduced-motion` honoured by the new motion (magnetic CTA, spine draw,
      card springs)
- [ ] Both themes, top to bottom
- [ ] `tsc --noEmit`, `eslint .`, `prettier --check`, `next build`

## Deferred by request

- Mobile responsiveness pass — explicitly out of scope for now

## Needs an answer (see notes.md → Open questions)

- [x] Tally vs custom form → **custom** (confirmed)
- [x] Font → **v2 only** for now; v2 becomes the default later, and the font
      rides along with that promotion
- [x] Event decorative objects → **per-category glyphs**, managed via the
      existing admin CMS
- [x] Team showcase must lay out correctly for **any** member count (4, 5, 6 …),
      not just the snippet's 6

## Phase 10 — hero + about revamp — DONE

- [x] Hero texture: masked dot grid plus the existing green plate, and a
      deterministic contribution field behind the mascot so the right half is
      no longer a mascot in empty space
- [x] Hero copy rewritten — the old line was three abstractions in a row
- [x] Filled button + text link instead of the filled/ghost pair
- [x] Eyebrow became a bordered pill with the accent dot
- [x] `components/ui/infinite-slider.tsx` — 21st.dev slider ported
- [x] `features/v2/about/tool-marquee.tsx` — the tools the club works with,
      drawn with Simple Icons from `react-icons/si` rather than remote CDN SVGs
- [x] `features/v2/sections/about.tsx` — bento re-toned off violet/emerald onto
      the GitHub palette, structure kept, colour spent once on the metric tile
- [x] The three non-CTA tiles are the three pillars, so the old flat pillar
      strip is replaced rather than duplicated
- [x] Verified both themes; marquee motion confirmed moving

## Phase 11 — hero text, stats, ornament, marquee, timeline — DONE

- [x] Pill above "GitHub" removed
- [x] `components/ui/canvas-text.tsx` — scan-line fill on "Community", built as
      a gradient clipped to the glyphs rather than a real canvas; green ramp
      tuned so the word stays lit rather than fading out
- [x] `components/ui/counting-number.tsx` — 21st.dev counter, ported to
      `framer-motion`, `autoStart` defaulted to false, plus a `format` hook so
      the founding year renders "2022" and not "2,022"
- [x] `features/v2/sections/stats.tsx` — counts up on entry, lucide glyph in a
      ring'd tile beside each figure; wired into `v2-page.tsx` in place of the
      v1 strip
- [x] Contribution field enlarged to 26x13 at 16px cells and animated in
      column by column on load
- [x] About feature tile's star ornament replaced with the Invertocat
- [x] Tool marquee scaled up — larger icons, larger labels, wider gaps
- [x] Timeline revamped: an active entry tracked to the viewport centre, a
      sticky clickable year rail, hover and keyboard focus promotion
- [x] `v2-root` switched from `overflow-x-hidden` to `overflow-x-clip` so
      `position: sticky` works inside it
- [x] Verified both themes; year rail click and active tracking confirmed
- [x] `tsc --noEmit`, `eslint`, `prettier --check`, `next build` all clean

## Phase 12 — second taste pass — DONE

Twelve items from the review. Kept in order; each is ticked only after it is
verified in the browser in both themes.

### Hero

- [x] 1. Remove the dark green plate behind "Community" — the word should sit
      on the page background, not in a box
- [x] 2. Contribution field: bigger, and actually animated. Today it staggers in
      once on load and is then frozen — it needs continuous life

### About

- [x] 3. The Invertocat ornament must not rotate on hover. Expand / scale it
      instead
- [x] 4. Delete the standalone stats strip section. Its four figures move into
      the bento as proper grid tiles, each with the counter animation, and the
      bento gains more tiles so the grid reads as a grid

### Global chrome

- [x] 5. The navbar Octocat avatar is tiny and illegible in dark mode. Replace
      with a mascot that follows the cursor and docks at set positions
- [x] 6. The `01 — ABOUT` section eyebrow looks foreign to the rest of the
      design. Restyle it everywhere it appears

### Journey

- [x] 7. Make the timeline CMS-managed and extendable — table, lib/db,
      validation, public GET, admin CRUD, admin screens

### Events

- [x] 8. The large decorative category glyph watermarked into each event card
      needs to be better
- [x] 9. Redesign the event detail dialog

### Benefits

- [x] 10. "Why join us" scroll-stack cards are still bland — make them
      interactive and eye-catching

### Join

- [x] 11. Revamp the join section. The flipping-tile background idea is good;
      the execution (off-palette red / blue / olive) is not

### Board

- [x] 12. Redesign the board member dialog, with a customisable profile-photo
      border surfaced through the CMS

### Checks

- [x] Verified in the browser in both themes
- [x] Journey CRUD exercised end to end against the real API — create 201,
      unknown icon 400, patch 200, unauthenticated delete 401, delete 200
- [x] `tsc --noEmit`, `eslint .`, `prettier --check`, `next build` all clean

### Follow-ups this phase created

- [ ] The remote D1 needs `db/migrations/2026-09-board-member-accent.sql` run
      against it before deploying — `npm run db:patch:remote -- <file>`. The
      local database already has it
- [ ] The remote D1 needs `npm run db:migrate:remote` for `journey_entries`,
      and the eight existing milestones re-entered through `/admin/journey`
      (they only exist in the local database as seed rows)
- [ ] `JOURNEY_ITEMS` in features/home/content.ts is now only used by the v1
      homepage. It goes when `/v2` is promoted
- [ ] Two schema changes in one phase. The next one probably justifies
      `wrangler d1 migrations` instead of hand-run patch files

## Phase 13 — texture, docking mascot, card + button work (DONE)

Reference: the user's own site, vidh.co. What it does that this page did not:
a fine graph-paper grid behind the content, 45-degree hatch bands as section
dividers, faint vertical container rules, and illustration motifs that travel
down the page rather than sitting in one corner. All of it monochrome and
nearly invisible — texture, not decoration.

- [x] 1. Event cards — another pass. `components/ui/gradient-card.tsx` is gone;
      `features/v2/events/event-card.tsx` replaces it. The cards show the
      event's own photograph now, with the remaining count as a chip on the
      image instead of a "3 photos" footnote under it. Events with no
      photographs keep the same frame, filled with the dot field and the
      category glyph
- [x] 2. Section texture: `components/ui/texture.tsx` — `GraphPaper`,
      `ContainerRules`, `HatchBand`, and `SectionTexture` (the first two
      together, which is how sections use them). Applied to About, Journey,
      Board, Events and Benefits; two hatch bands in `v2-page.tsx` bracket the
      textured run. Line colours come through `currentColor` so light and dark
      get separate values
- [x] 3. Mascot docks per section. `features/v2/mascot/docks.ts` holds the
      table (side plus a descending band of viewport-height fractions);
      `v2-mascot.tsx` resolves the dock from scroll position, blends across the
      last 16% of each section, and plays one decaying squash on arrival. The
      cursor no longer chooses the side. Gaze falls back to looking inward with
      a slow drift once the pointer is further than `GAZE_FALLOFF`, which is
      what was making it appear to stare in one direction
- [x] 4. The dark "Innovation" tile is a terminal —
      `features/v2/about/terminal-tile.tsx` types out branch → commit → PR
      opened, once, on entry. The finished transcript is rendered invisibly
      underneath to reserve the tile's height so the bento row does not reflow
      while it types
- [x] 5. `components/ui/button-colorful.tsx`, re-toned to the accent ramp, on
      the hero's primary CTA
- [x] 6. TODO.md and notes.md updated

### Checks

- Both themes, at 1440x900, on About, Journey, Board and Events
- Mascot position sampled per section: hero slot → about right (cx 1285→1327,
  cy 291→416, drifting down) → journey left (cx ~120) → board right (cx 1323).
  Gaze points inward at each dock rather than saturating
- Terminal tile types and stops with a blinking cursor; tile height stable
- `npx tsc --noEmit` and `npx eslint components features` clean

### Follow-ups

- Reduced motion is code-correct throughout (docks, terminal, cursor, texture)
  but still cannot be verified — the browser pane cannot emulate
  `prefers-reduced-motion`
- The dock bands are tuned for desktop viewport heights. They are fractions, so
  they scale, but the mascot is `hidden md:block` and the mobile pass will need
  its own decision about whether it appears at all

### Waiting on the user

- Two more sections, which they describe as closer to two new pages. They will
  say what these are.

## Phase 14 — doodle background, filled bento tiles, parallax (DONE)

- [x] 1. Replace the graph-paper grid with a GitHub doodle field. Small marks,
      multiple icons (octocat, branch, merge, pull request, fork, commit,
      terminal, braces), static, high quality, good variance in size, rotation
      and weight. `scripts/build-doodle-pattern.mjs` generates
      `public/patterns/github-doodles.svg`; rebuild with `npm run build:doodles`
- [x] 2. The bento tiles that were empty inside now carry an oversized faint
      glyph, in the manner of the feature tile's Invertocat: the three stat
      tiles echo their own icon, the green members tile gets `Users` drawn in
      its own text colour, and "Start contributing" gets `GitPullRequestArrow`
- [x] 3. Answer the parallax question (see the pending decision below)
- [x] 4. Update TODO.md and notes.md

### Checks

- Doodle tile rendered on its own at 1:1: all 22 marks legible, none clipped at
  the tile edge, octocat path intact
- In situ at 1440x900 in both themes, on About, Journey and Board
- Dark alpha raised from 0.05 to 0.075 after a side-by-side with light, where
  0.05 was very nearly invisible
- Tile widened from 440 to 540 and cut from two octocats to one after the
  first pass: the filled octocats were the only solid marks in a stroke field,
  so the eye locked onto them and read the repeat rhythm off them
- Then rebuilt entirely, to a game-controller grip texture: 306px tile, 81
  marks at 13-18px on a staggered 34px lattice. The 540px version was still
  coarse enough that marks were read individually and pulled focus off the
  foreground, which is the user's own observation
- Dark mode is the calibration reference for this page. Light was set to 0.095
  against dark's 0.05 and ran visibly hotter, so light came down to 0.055
- No console errors; `npx tsc --noEmit` and `npx eslint components features`
  clean

### Parallax — resolved, implemented

Approved as recommended: the doodle field only, and nothing else on the page.
`DoodleField` moves 28px either side of centre across a section, driven by
framer-motion's `useScroll`/`useTransform` against its own element, static
under `useReducedMotion`. Verified by reading the layer's computed transform at
two scroll positions: y = -9.25px at scrollY 606, y = +21.67px at scrollY 1906.

The reasons it stops there are unchanged and worth keeping: the mascot already
owns moving independently down the page; Lenis is already easing the scroll, so
parallax on top compounds the lag and reads sluggish rather than deep; and the
benefits stack and journey rail are pinned, which parallax layers fight.

### Follow-ups

- Mark placement is now a seeded jittered lattice, not hand-set. Changing
  `PITCH`, `ROWS`/`COLUMNS`, the icon pool or the seed means rerunning
  `npm run build:doodles` and committing the regenerated SVG. `TILE` there and
  `DOODLE_TILE` in components/ui/texture.tsx must stay in step
- Light mode still needs a broader pass per the user; the doodle contrast was
  only the part inside this phase
- `ContainerRules` was kept from the graph-paper version. If the page later
  reads as over-ruled, that is the next thing to drop, not the doodles

## Phase 15 — continuity, mascot transport, glyph joins (DONE)

- [x] 1. The doodle field faded out at every section edge and read as
      disconnected. The fade is gone and the field is now phase-aligned to one
      document-wide tile grid, with a single global parallax value so adjacent
      sections stay in lockstep
- [x] 2. Mascot gaze in the hero: it tracked the cursor only within
      `GAZE_FALLOFF`, and in the hero the cursor is usually further away than
      that, so it held a fixed stare. It now tracks at any distance while in
      the hero and falls back to the proximity rule only once docked
- [x] 3. Mascot left/right transport. `FOLLOW` was a per-frame rate doing the
      job of carrying it across the screen; it needed about a second and a
      section passes faster, so crossings never completed and it hovered near
      the middle drifting left. Replaced with a frame-rate independent
      smoother, `FOLLOW_TAU`, with the crossing left to `resolveDock`
- [x] 4. Faint glyph ornaments showed a darker line where sub-paths cross,
      looking like a line drawn over the shape it joins. Switched from
      stroke-colour alpha to element opacity everywhere

### Checks

- Doodle phase verified numerically on all five textured sections: each
  section's `maskPosition` matches its own `documentTop % 306`, and no layer
  carries a fade mask any more
- About-to-journey seam screenshotted in dark: the field runs straight through
  with no fade and no restart
- Mascot swept over a full-page scroll under identical conditions before and
  after: x range widened from 738-1283 to 427-1305, against docks at 98 and 1342. The residual gap is this browser pane starving rAF (41 frames for the
  whole page, 3-4 per section); dock positions themselves were confirmed
  separately at rest, at x=124 left and x=1323 right
- Join fix confirmed by raising one ornament to 0.45 opacity at 340px: stroke
  weight is uniform through the circle, with no darker crossing segment
- Swept the whole rendered page for the same defect class: zero multi-element
  SVGs remain with a semi-transparent `color`
- `npx tsc --noEmit`, `npx eslint`, `npx prettier --check` all clean

### Follow-ups

- The mascot's follow can only be verified properly in a real browser; the
  pane's frame starvation puts a floor on what these measurements can show
- Light mode still needs the broader pass the user mentioned, beyond the
  doodle contrast already brought down to match dark

## Phase 16 - dark only

- [x] 1. The mascot turned to face the cursor on the left but stayed nearly
      front-on at the right. Two coupled causes, and the first fix only got
      half of it:
  - [x] The yaw was `BASE_ROTATION_Y + x * 0.5`, a resting pose _added_ to a
        symmetric deflection, so it compounded on one side and cancelled on
        the other. The base is now weighted by `1 - |x|`, full strength facing
        forward and gone entirely at either extreme
  - [x] That weighting only sheds the base at `|x| = 1`, but the dock bias in
        `v2-mascot.tsx` only ever drove x to +/-0.5, so half the resting pose
        survived at both docks: left reached 0.65 rad (37 deg) and right only
        -0.25 (14 deg), which is what the screenshots showed. The dock bias is
        a full deflection now (+/-1), and `MAX_YAW` dropped to 0.65 so the
        left keeps the exact angle it already had and only the right moves to
        meet it
  - [x] `swing` is clamped to [-1, 1] in `gh-mascot-3d.tsx`, because the idle
        wobble adds 0.14 on top of a full-deflection bias and past 1 the base
        weight goes negative and the yaw overshoots away from the turn
- [x] 2. Gap between the last benefits card and the hatch band. The
      scroll-stack pins its last card near the foot of the section, so
      symmetric `py-24` left it 19px off the divider. Bottom padding is now
      `pb-48`
- [x] 3. Light mode removed entirely
  - [x] 470 `dark:` variants collapsed to their dark value across 60 files
  - [x] `app/globals.css`: dark HSL values moved onto `:root`, the `.dark`
        block deleted, the duplicated `.skeleton` rules merged, and
        `color-scheme: dark` declared
  - [x] `tailwind.config.js`: `darkMode: ["class"]` and the `accent-light`
        (#1a7f37) light-mode green removed
  - [x] `app/layout.tsx`: `ThemeProvider`, the anti-FOUC script and
        `suppressHydrationWarning` all removed - they existed only to decide a
        theme class before paint
  - [x] `components/theme/` deleted (provider and toggle), and the four
        `<ThemeToggle />` usages with it
  - [x] Both mascot buttons stop toggling and just spin.
        `gh-mascot-toggle.tsx` is renamed `gh-mascot-dock.tsx` (`GhMascotDock`)
        since it docks and no longer toggles anything
  - [x] The `aria-label` changed from "Toggle theme" to "Spin the octocat" in
        lockstep with the `MASCOT_SELECTOR` constants in `mascot-glow.tsx` and
        `mascot-easter-egg.tsx`, which find the mascot by that label

### Checks

- `npx tsc --noEmit`, `npx eslint app components features lib` and prettier all
  clean after the sweep
- `/v2` verified live in the browser: it renders, `color-scheme` computes to
  `dark`, `body` is `rgb(13, 17, 23)`, exactly one mascot button exists, the
  glow's selector matches it, and zero elements carry the old label
- Mascot yaw confirmed at both docks in the browser: at the journey dock
  (x=59) and the board dock (x=844, 35px off the right edge) the octocat is
  turned the same amount into the page, mirrored. Arithmetic checked
  separately: hero centre +22.9 deg, left dock +37.2, right dock -37.2, and
  both wobble extremes clamp to the same 37.2
- `grep` over `app components features lib scripts workers` returns no
  `dark:`, no `useTheme`, no `ThemeToggle`, no `accent-light`

### Follow-ups

- A stale `theme` key may sit in visitors' `localStorage`. Nothing reads it any
  more, so it is inert; not worth shipping code to clear it

## Phase 17 - marquee loop, join texture, wordmark

- [x] 1. The hero word band emptied out and restarted instead of looping. Each
      of its two rows animated `translateX(-100%)` independently, so a row only
      ever travelled its own width: at the end of a cycle the second row sat at
      x=0 and the track ran out one row's width later. On any viewport wider
      than that row, bare band was visible before the restart. The track is the
      animated element now, travelling `-50%` across two identical halves,
      which lands exactly one half along and is periodic by construction. One
      half is three repeats of the word list (about 3300px) so it stays wider
      than the screen
- [x] 2. The "Apply to join" block had no doodle field. It was the only flat
      panel left on the page, which broke the run of one continuous surface
      from About down. The band above it keeps its turning tiles and stays the
      one deliberate exception
- [x] 3. The nav wordmark was a v1 remnant: lucide's `Github`, a hollow stroke
      outline, where every other GitHub mark in the v2 tree is a solid
      react-icons one. Two icon families in one page. Swapped to `FaGithub`,
      and `GITAM` became a mono uppercase tag rather than a lighter weight of
      the same sentence, which is the register v2 uses for every other
      qualifier on the page

### Checks

- Marquee measured live: track 6604px across two 3302px halves, animation
  `gh-marquee 42s`, one half wider than the viewport. The `-50%` travel is
  exactly one half
- The new keyframe is separate from `infinite-scroll` in `tailwind.config.js`,
  which still travels -100% and is still used by the v1 auto-scroll gallery,
  where the animated element is each row rather than the track
- Join doodle phase verified against its document position: expected 174.20,
  actual 174.195, so it sits on the same grid as every section above it
- Reduced motion guarded for the new marquee animation, matching the
  `.board-ring` pattern already in `globals.css`
- `npx tsc --noEmit` and `npx eslint app components features` clean

### Follow-ups

- At the join dock the mascot overlaps the "No experience needed" reason and
  covers its text. Pre-existing, not introduced here, and the dock positions
  are tuned; worth a look when the mascot docks are next touched
- The join form's "GitHub username - optional" label carries an em-dash. Left
  alone because form labels are the kind of thing analytics and autofill key
  on; worth a sweep if the copy is ever revisited

## Phase 18 - hero contribution graph

Both questions raised during Phase 17 are resolved.

- [x] Dividers at every section seam: not added. The hatched band stays at the
      two gear changes it already marks. Repeating it would reverse Phase 15's
      continuous doodle surface, spend a signal that currently means something,
      and stack three pattern languages within about 120px at every seam
- [x] The hero graph read as a carpet. The mask was the mechanism: it ran
      `transparent 16%, black 76%` outward from the centre, which clears a hole
      behind the mascot but leaves the cells at full strength exactly where the
      750x375 rectangle ends. A bounded rectangle at full strength, centred on
      the subject, is a rug
  - [x] The mask falls off outward now, one ellipse anchored at `100% 50%`:
        opaque where it leaves the screen, gone before the headline
  - [x] Hoisted out of the mascot's column onto the section, anchored right and
        overhanging, so its right, top and bottom edges are all off-screen and
        it is never seen whole
  - [x] Fades leftward toward the copy, which is the treatment the join band
        already gives this same motif and why that one never looked like a mat
  - [x] Weight lowered slightly, but only slightly (see below)

### Checks

- Measured at 1440x900: 600 cells, overhanging 50px right and 9px top and
  bottom, covering the full 631px hero height
- Cell count held flat (578 to 600) on purpose. `.contribution-cell` sets
  `will-change: opacity, transform`, so every cell is its own compositor layer
  and covering the hero at the old 25px pitch would have taken about 900 of
  them. The pitch went from 25px to 35px instead: 2.6x the area, same count
- `npx tsc --noEmit` and `npx eslint features` clean

### Follow-ups

- First pass at the weight was too light and the right half of the hero read as
  empty again, which is the problem the graph exists to solve. Corrected, but
  the margin here is narrow: this is worth a look on a real display
- The browser pane cannot judge this on its own. It starves rAF, so the entry
  animation and the per-cell twinkle both sit frozen near the keyframe trough
  and the whole field reads far fainter than it is. Verifying it meant pinning
  `opacity` and `animation: none` by hand to see the steady state

## Phase 19 - ten terminal sessions

- [x] Ten variants for the about bento's terminal tile, drawn at random per
      visit. They are deliberately not ten spellings of the same thing:
      opening a first pull request, picking up a good-first-issue, reviewing
      someone else's, forking upstream, watching CI and merging, rebasing,
      stashing to help someone, reverting a bad deploy, cloning and setting up,
      and cherry-picking a hotfix
- [x] The pick is hydration-safe. This component renders on the server too, so
      a `Math.random()` read during render would give the two sides different
      transcripts. `useSyncExternalStore` does it properly: fixed server
      snapshot, random client snapshot, React swaps after hydration
- [x] `Script` is a six-element tuple, so a variant of the wrong length is a
      type error rather than a layout bug found later
- [x] The `aria-label` is built from whichever script was drawn. It used to
      describe one transcript by hand, which would have gone quietly stale the
      moment a second variant existed
- [x] Height reservation no longer depends on the drawn script

### Checks

- Three reloads drew three different scripts with `reservedH` at 222px every
  time, and the typed overlay fits the reservation exactly
- Watched one type through to the success line and cursor in the browser
- `npx tsc --noEmit` and `npx eslint` clean

### Follow-ups

- At a 383px tile the longer command lines wrap. That is pre-existing (the
  original script's commit line wrapped too) and the reservation now absorbs
  it, but shorter lines would read better on narrow screens. Part of the
  deferred mobile pass

## Phase 20 - tool marquee

- [x] Twelve tools added: MongoDB, Flutter, Cloudflare, Vercel, Supabase,
      CockroachDB, TensorFlow, PyTorch, Hugging Face, Google Cloud, Framer and
      Postgres. Twenty-four in total, all still from `react-icons/si`, so no
      new dependency, no remote asset and no `next.config.js` change
- [x] Ordered in runs rather than appended: version control, languages, web
      stack, mobile, data, machine learning, infrastructure, design. A marquee
      is read in sequence, so neighbours should belong together
- [x] `duration` raised from 48 to 96 and `durationOnHover` from 140 to 280.
      `InfiniteSlider` covers one copy of the list in `duration` seconds
      whatever that copy's width, so doubling the list at a fixed duration
      would have doubled the speed
- [x] AWS added in Phase 21 from a source the user supplied, since Simple
      Icons carries no Amazon mark

### Checks

- 24 labels render, 48 icon elements in the DOM, which is the slider's own
  doubling and confirms nothing was dropped
- Every icon name verified against the installed package before use rather
  than assumed from the brand name: `SiCockroachlabs` exists and
  `SiCockroachdb` does not, `SiGooglecloud` exists, and no AWS spelling does
- `npx tsc --noEmit` and `npx eslint` clean

## Phase 21 - AWS mark, and an honesty pass on the copy

### AWS

- [x] Added from the monocolor SVG Repo vector the user supplied (MIT), as an
      inline component rather than an `<img>`, so there is no extra request and
      `fill="currentColor"` gives it the same muted-to-white hover the Simple
      Icons marks get
- [x] Path data verified by SHA-256 against the source rather than eyeballed,
      since 4350 characters of coordinates cannot be proofread
- [x] viewBox cropped to the artwork. The source pads a 30x18 wordmark into a
      32x32 square, which letterboxed it inside the square box the glyphs fill
      and made AWS the one visibly small logo in the row. Cropped plus a `wide`
      flag rendering `w-auto` at a shared height lines it up on cap height

### Copy

- [x] About intro rewritten. It restated the hero almost word for word; it now
      introduces the distinction between the open community group and the club
- [x] "Start contributing" tile no longer promises open membership
- [x] Board intro rewritten; it repeated itself inside two sentences
- [x] Networking: the claim that alumni return to judge build weekends is gone
- [x] Open source: the contribution-drive numbers are gone
- [x] Mentorship proof "Weekly office hours" replaced; a college club has none
- [x] Building things: rewritten to projects that benefit students plus
      internal builds, not a two-day hackathon demo
- [x] Skill development proof "Weekly sessions" softened to "Hands-on
      workshops", which is not a cadence the site has to keep
- [x] Join banner, the three reasons and the application intro all rewritten
      around the real process. "Applications are read by the board, not a
      filter" was directly contradicted by there being an interview
- [x] Every em dash removed from visible copy, v1 and admin included: section
      labels, alt text, aria-labels, form labels, the easter egg and the admin
      table's empty-cell placeholder. Zero remain outside code comments

### Checks

- AWS verified in the DOM: `fill` computes to `rgb(139, 148, 158)`, the same
  `gh-muted` the Simple Icons marks inherit, at height 40 against the glyphs'
  40, width 67 for the wordmark. 50 icon elements, being 25 tools doubled
- Swept the rendered page for every struck phrase and counted em dashes in
  `body.innerText`: zero

### Follow-ups

- [ ] **Two flagged strings are database rows, not code**, so the repository
      sweep could not reach them. Both are seeded `events` rows: one described
      as "Forty-one first-time contributors got a pull request merged", and one
      titled "Open source office hours". They need editing through
      `/admin/events`, on the remote database as well as locally
- [ ] Worth deciding whether the "700+ members" stat counts the community group
      or the club. The copy now reads as the community figure, which is the
      only reading consistent with an interview-gated club, but it is
      unconfirmed

## Phase 22 - projects (CMS) and a glass navbar - DONE

Large multi-part phase. Order matters: the data layer has to exist before the
CMS, and the CMS before anything can be seen on the page.

### A. Data layer

- [ ] `projects` table in `db/schema.sql` plus a migration under `db/migrations/`
- [ ] `lib/db/projects.ts` and `lib/validation/project.ts`
- [ ] Status stored as a **key**, never as markup or a colour, per CLAUDE.md.
      `PROJECT_STATUSES` maps key to label and icon; the admin form offers the
      known keys as a select, validation rejects unknown ones, and the render
      path falls back rather than throwing
- [ ] Public `GET /api/projects` with `dynamic = "force-dynamic"`

### B. CMS

- [ ] CRUD under `app/api/admin/projects/` behind `requireAdminApi()`
- [ ] Screens under `app/admin/(dashboard)/projects/` (list, new, edit)
- [ ] Fields: name, slug, summary, body, status key, live URL, repo URL,
      preview image, cover image, tags, featured order, published flag
- [ ] Admin nav entry

### C. Home section

- [x] `features/v2/sections/projects.tsx`, at most five rows, each with its
      number, name, links and status badge
- [x] **Hidden entirely when there are no projects**, not rendered empty
- [x] Project list hover preview: a floating preview window that follows the
      cursor, with the octocat positioned as though hanging off it. Only for
      rows that have a live URL
- [x] "View all projects" button to the projects page

### D. Projects page and detail page

- [x] `/projects` listing, no hover preview, proper grid
- [x] `/projects/[slug]` detail page
- [x] Both `dynamic = "force-dynamic"`

### E. Navigation

- [x] Decide and implement how the nav handles a projects _section_ on the home
      page and a projects _page_. The scroll spy and anchor scrolling assume
      every nav item is a section on the current page
- [x] Navbar to GlassSurface (React Bits), adapted to one theme. Installed via
      its own `shadcn add`, forked for this codebase (client directive, dark
      only, reduced-transparency branch, probes through `useSyncExternalStore`),
      wired through a new backdrop slot on the navbar shell

### F. Mascot framing inside the hover preview (raised mid-phase)

- [x] The octocat was drawn cropped: its box was 76x96 (portrait) while
      `gh-mascot-3d` frames the model at roughly 1.25. Box is now 110x88
- [x] Its gaze was driven by the cursor's position in the viewport, so it
      looked hard left or hard right purely because the pointer was near a
      screen edge. It now looks back at the cursor at a fixed angle that
      mirrors when the card flips sides, plus a slow idle drift

### G. Raised after the first pass

- [x] The mascot did not return to its normal flow after a preview closed,
      because the preview had its own second octocat rather than borrowing the
      page's one. There is now a single mascot: it comes down the projects
      section on its rail, flies to sit on the preview when one opens, and
      flies back when it closes. A row the CMS has marked in progress opens no
      preview, so nothing is needed to make it stay on its rail
- [x] No division between the projects section and what follows it
- [x] No way back to the homepage from `/projects`

### H. Nav legibility, hover shape, and CPU (raised after the glass landed)

- [x] Nav labels more legible: `text-gh-text/75` instead of `gh-muted`, a
      one-pixel dark text halo, and the glass tint raised from 0.24 to 0.5
- [x] Hover shape matches the glass: a translucent white pane with a lit rim
      instead of the opaque `bg-gh-elevated` chip
- [x] CPU. Measured with `top` against the pane's renderer process, scrolled
      to 300px with the shrunk nav over the hero. Blank page floor: 6%.
      - `/v2` before: renderer 115%, GPU 32%
      - `/v2` after: renderer 33%, GPU 32%
      - `MascotGlow` (root layout, every page) cost 207ms/s of main thread by
        itself. Removed from the root layout; v2 draws its glow as a sibling
        of the mascot on the same motion values; v1's copy only writes when
        something changed
      - 600 CSS-animated hero grid cells (600 layers) replaced by one canvas
        at 24fps that stops when the hero is off screen
      - "Community" scan lines stepped at device-pixel size
      - Glass filter: the per-channel colour split is now a prop
        (`chromaticAberration`), off on the navbar. 11 primitives to 3

### I. Mascot in the projects section (raised with two screenshots)

- [x] Without a hover, the mascot sat on the right looking off the page for
      the whole projects section. Cause: projects had no dock, so the
      mascot stayed on the events dock (left) past 100% progress, blended
      fully toward benefits' right-hand dock, while its gaze still keyed off
      "left". Projects now has a dock; sides are assigned by order among the
      sections actually present (so a CMS-hidden section cannot break the
      zig-zag); a dock can pin a side (benefits, right, clear of its card
      text); and the gaze flips side at the midpoint of a crossing
- [x] With a hover, the mascot did not sit on the card. The perch was
      published once, when the hovered row changed, and never again, so the
      mascot stayed where the card had been on entry while the card followed
      the cursor. The perch is now derived from the card's drawn position
      and republished whenever it moves; once perched, the mascot tracks it
      without a second smoothing pass
- [x] The card (and the mascot on it) flew in from the viewport's top-left
      corner on the first hover. `useSpring` + `jump()` depended on event
      ordering; replaced by snap-while-hidden, spring-while-showing inside
      the move handler

Checks, measured in the browser: projects dock right, facing inward; first
entry puts the card at the cursor; perched mascot 0px off the rim target
both settled and after moving within a row; on leaving it returns to its dock
at full size; section sides with projects present are about R, journey L,
board R, events L, projects R, benefits R, join L.

### Follow-ups from H

- [ ] RAM figures above are from `next dev`, whose resident size is dominated
      by development tooling and grows across reloads. Measure a production
      build (`npm run preview`) before quoting a memory number
- [ ] The mascot canvas keeps its drawing buffer at hero size (by design, see
      gh-mascot-3d) and renders at up to 2x even when docked at a third of
      that. Capping dpr at 1.5 would cut its fill cost; not done because it
      softens the hero mascot, which is the user's call
- [ ] The glass re-runs on every composited frame, so its cost scales with
      how often anything on the page moves. The marquee and the mascot's idle
      drift are the remaining constant frame sources

### Checks

- `/`, `/v2` and `/projects` in a fresh tab: no console errors. v1 still has
  its glow; `/projects` no longer runs the glow loop
- Main thread in rAF callbacks on `/v2`: about 250ms/s before, 73ms/s after.
  Mid-page the grid loop is absent, confirming it stops off screen
- Nav pill on `/v2` at 1440: `backdrop-filter` computes to
  `url(#glass-filter-...) saturate(1.4)`, so the real refraction path is live
  rather than the blur fallback, and hero type visibly distorts through it
- Fresh tab, no console errors: the hydration mismatch the first wiring caused
  is gone
- Hovered and unhovered a live row on `/v2`: one octocat, which leaves its
  dock, shrinks onto the card's top rim, and returns to full size on its dock
- Hovered a row with a live URL on `/v2`: the card follows the cursor and the
  octocat renders whole, on the card's top rim, turned toward the pointer
- Hovered a row without a live URL (Attendance Ledger): no card, as specified
- `/projects` and `/projects/campus-mess-menu` both render
- `npx tsc --noEmit` and `npx eslint app features lib components` both clean

### Open decision, resolved by me pending correction

The brief asks for the hover preview to show the deployed site. A live
`<iframe>` is the obvious reading and is the wrong tool: most sites send
`X-Frame-Options: DENY` or a frame-ancestors CSP, and both of the examples
named in the brief, YouTube and Google, refuse framing outright, so the demo
would render blank exactly where it was meant to be shown off. Real link
previews (Wikipedia, GitHub, Vercel) all use captured images for this reason.
The preview therefore shows a `preview_image` from the CMS, which also keeps it
fast and avoids loading third-party JavaScript on hover. Say the word and it
can be an iframe instead.

## Phase 23 - project pages, people, and a mascot that looks at you - DONE

### A. Mascot on the preview

- [x] When perched on the hover preview the mascot faces straight ahead, not
      sideways and not tracking the cursor (gaze blended to
      `FACING_FORWARD_X` by the perch weight; pose constants moved to
      `components/mascot/pose.ts`)

### B. Navigation and motion

- [x] Back buttons are real buttons: pill, arrow in a disc that turns green
      and slides on hover, "Back to" kicker, focus ring, press state
- [x] Opening a project from `/projects` morphs the card's cover and title
      into the project page (View Transitions, hand-rolled in
      `features/v2/projects/transition.tsx`); the rest of the page rises in
      a stagger. Same in reverse through the back button. Reduced motion and
      browsers without the API get a plain navigation

### C. Data

- [x] `members` table, columns mirroring `board_members`
- [x] `project_members` join table (role key, contribution, order)
- [x] Projects gain `dev_notes`, `commit_count`, `commits_synced_at`
- [x] `db/schema.sql` + `db/migrations/2026-09-project-team.sql`, applied
      locally

### D. Commit count

- [x] `lib/github/commits.ts`: one request, `Link` header last page, 5s
      timeout, optional `GITHUB_TOKEN`
- [x] Synced on every CMS save; stale (>1 day) counts refreshed with
      `after()` so no page view waits on GitHub; hidden when unknown
- [x] Counter with the homepage's curve, links to the commit history

### E. Project page layout

- [x] Back, status, name + commits, avatars, then numbered blocks: Brief
      (summary, cover, body), Tech stack, Dev notes (framed as NOTES.md),
      Links (deployed site, GitHub), People (maintainers, lead, members, with
      contributions). Empty blocks are left out and the rest renumber
- [x] Clicking a face or a person opens the profile dialog with "Team lead
      on X" and their contribution above the bio
- [x] Avatars on the `/projects` cards too, above the stretched link

### F. CMS

- [x] `/admin/members` list / add / edit / delete, in the admin nav
- [x] Project form in page order (six numbered blocks), dev notes, team
      editor (pick member, role, contribution, reorder, remove)
- [x] AvatarCircles adapted into `components/ui/avatar-circles.tsx`

### Checks

- `npx tsc --noEmit` and `npx eslint app features lib components` clean
- `/projects/campus-mess-menu` renders every block in order; counter reads
  782 for the repo it was pointed at locally, which matches GitHub's own
  `Link` header for the same request
- The first view of a never-synced project showed no counter and the next
  view showed it, confirming the `after()` refresh
- Clicked a person: the dialog opens with their project role and
  contribution
- Card to project: the transition settled at 291ms on the new page (its h1
  already in the DOM), not on the 2.5s fallback. Back button to the
  listing: 269ms
- `/v2` in a fresh tab: no console errors. Hovered a live row: the mascot
  sits on the card rim facing the viewer

### Not verified

- The admin screens were not driven in the browser: logging in means typing
  the admin password, which I do not do. They type-check and follow the
  board admin pattern exactly. Worth one pass: add a member, tag them on a
  project, save, and check the commit count line in the form

### Local test data (not real)

- Eight rows in local `members` (five mirror the board, three invented
  names), twelve `project_members` rows, and Campus Mess Menu's repo pointed
  at `opennextjs/opennextjs-cloudflare` with sample dev notes, so the page
  had something to show. Local D1 only; replace through `/admin/members`

### Follow-ups

- [ ] Run `db/migrations/2026-09-project-team.sql` against the remote D1
      before deploying (`npm run db:patch:remote -- ...`)
- [ ] Optional `GITHUB_TOKEN` secret on the Worker if the 60/hour
      unauthenticated limit is ever hit (the Worker's IP is shared)
- [ ] The label reads "Commits", not "on main": the API counts the default
      branch, which is not always called main. Say if you want the branch
      name fetched and shown
- [ ] On `/v2` the navbar underlines Events while the projects section is
      on screen. Predates this phase; scroll spy offset
- [ ] The pupils still follow the gaze input, so on the perch they sit
      slightly left of centre while the head faces forward. Barely visible;
      decoupling needs a second channel into the model
- [ ] The members page itself (waiting on the user); it reuses
      `ProfileDialog` and `lib/db/members.ts`. The user said the profile
      popup's design will change with that page, so it stays as it is
      until then. Do not restyle it before the brief arrives

## Next

- [ ] Promote `/v2` to `/` — the font rides along with it
- [ ] Replace the seeded board and event rows with the real ones through
      `/admin/board` and `/admin/events`
- [ ] Mobile responsiveness pass (still deferred by request)
- [ ] Members page (the user will describe it); its profile popup is the
      member dialog Phase 23 builds
