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

## Next

- [ ] Promote `/v2` to `/` — the font rides along with it
- [ ] Replace the seeded board and event rows with the real ones through
      `/admin/board` and `/admin/events`
- [ ] Mobile responsiveness pass (still deferred by request)
