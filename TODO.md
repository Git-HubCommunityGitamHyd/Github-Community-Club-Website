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

## Next

- [ ] Promote `/v2` to `/` — the font rides along with it
- [ ] Replace the seeded board and event rows with the real ones through
      `/admin/board` and `/admin/events`
- [ ] Mobile responsiveness pass (still deferred by request)
