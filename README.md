# GitHub Community GITAM — Website

The public website for the **GitHub Community club at GITAM Hyderabad**: a
single-page marketing/info site, a join-the-club onboarding form, and a
small in-house CMS (board members, events) behind a password-protected
admin portal at `/admin`.

This README is written for juniors picking up the project for the first
time — it explains **what** exists, **why** it's built the way it is, and
**how** to get it running locally. For line-level gotchas and the reasoning
behind specific non-obvious decisions, see [`CLAUDE.md`](./CLAUDE.md) —
that file is the deeper reference; this one is the tour.

## Design inspiration

The look and feel is deliberately modeled on **GitHub Universe's own event
website** — GitHub's dark, terminal-flavored conference site. That's where
the visual language comes from:

- The near-black background (`#0d1117`, GitHub's actual dark theme color)
  with GitHub's signature green (`#3fb950`) as the single accent color.
- Monospace type for labels, section numbers (`01 — ABOUT`), and the
  scrolling marquee ticker — the "terminal output" feel.
- A bold, oversized sans-serif for headlines, contrasted against that
  monospace detailing.
- Sharp-edged cards and hairline borders instead of soft shadows/rounded
  glassmorphism — a flatter, more "developer tool" aesthetic than a typical
  marketing site.

Everything else — the 3D Octocat mascot, the scroll-stacking benefits
section, the particle-text call-to-action — was layered on top of that
Universe-inspired base to make the club's own site feel distinctive rather
than a reskin.

## What's on the page

`app/page.tsx` is one long scrolling page, in order:

| Section                       | What it is                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Nav**                       | Fixed top bar. The 3D Octocat mascot lives here once docked (see below) and doubles as the light/dark theme toggle.                      |
| **Hero**                      | Headline, "Our Story" / "Join Community" CTAs, and the mascot at full size before it docks.                                              |
| **Stats**                     | Founded year, member count, events hosted, campuses — plain numbers.                                                                     |
| **About**                     | Short club description.                                                                                                                  |
| **Journey**                   | A timeline of the club's milestones (`EnhancedTimeline`) — this one's still hardcoded in `page.tsx`, not DB-backed.                      |
| **Executive Board**           | Flip cards (`BoardMemberPopupCard`) for current board members — DB-backed.                                                               |
| **Events**                    | Flip cards (`EventPopupCard`) for past events, each with a photo gallery — DB-backed.                                                    |
| **Benefits** ("Why join us?") | A scroll-stacking card deck (`ScrollStack`) — cards pin and stack on top of each other as you scroll past them, instead of a plain grid. |
| **Join**                      | The onboarding form, plus a particle-text animated "Join Our Community" call-to-action.                                                  |

## The mascot

The GitHub Octocat isn't a static image — it's a real, interactive 3D
model (`components/gh-mascot-3d.tsx`, Three.js via `@react-three/fiber`),
wired up with a few layered behaviors in `components/gh-mascot-toggle.tsx`:

- **Scroll-dock animation**: it starts big in the hero, and shrinks +
  translates into the navbar slot as you scroll, locking there. Scroll back
  up and it undocks.
- **Eye tracking**: the pupils (real mesh nodes in the model, not sprites)
  follow the cursor, clamped so they never leave the whites of the eyes.
- **Click = theme toggle**: clicking the mascot switches light/dark mode
  and gives it a little spin.
- **Green glow** (`components/mascot-glow.tsx`): a soft glow that tracks
  the mascot's real on-screen position/size every frame, so it doesn't
  visually disappear into the dark background or the navbar.
- **Easter egg** (`components/mascot-easter-egg.tsx`): click the mascot
  **7 times** and it flies to the center of the screen (from wherever it
  currently is — docked or full-size) with a typed-out speech bubble.
  Dismiss with the "Got it" button or a 3-second press-and-hold.

> `components/gh-mascot-toggle.tsx` and `components/gh-mascot-3d.tsx` are
> considered **locked** — the scroll-dock math and eye-tracking were tuned
> through a lot of trial and error. Everything above (the glow, the easter
> egg) was built as separate components that only _read_ the mascot's
> position/DOM — none of them edit those two files. If you need to change
> the mascot itself, expect it to take a few iterations to get the
> animation feeling right again.

## Content: board members & events are DB-backed

`app/page.tsx` fetches board members and events client-side from the
public `GET /api/board-members` and `GET /api/events` routes, with skeleton
placeholders while loading. Manage both through `/admin/board` and
`/admin/events` (same password-gated auth as `/admin`) — full add/edit/
delete, backed by `app/api/admin/board-members/**` and
`app/api/admin/events/**`, which call CRUD functions in `lib/db.ts`.

Photos go through **Cloudinary**, not `public/images/` — see
[Image uploads](#image-uploads-optional) below.

## Architecture

This is a Next.js 14 App Router site, but two things about the deployment
are easy to get wrong if you're assuming a typical Vercel setup:

1. **It deploys to Cloudflare Workers, not Vercel.** The build goes through
   `@opennextjs/cloudflare` (OpenNext), which compiles the whole Next.js
   app into a Cloudflare Worker. `wrangler.jsonc` is that Worker's real
   config — it's not a leftover scaffold.
2. **The database is Cloudflare D1** (SQLite), not Postgres. It's bound
   directly to the Worker (`wrangler.jsonc`'s `d1_databases`) and read via
   `getCloudflareContext()` in `lib/db.ts` — no separate DB server, no
   connection string, and (thanks to OpenNext's dev integration) no
   container to run locally either.

The one piece that _is_ a separate, independently-deployed Cloudflare
Worker is `workers/cloudinary-sign/` — a tiny Worker whose only job is to
hand out signed Cloudinary upload credentials, so the Cloudinary API secret
never has to live in the main app or reach the browser.

Auth is intentionally minimal: one shared `ADMIN_PASSWORD` env var protects
everything under `/admin`, via an HMAC-signed cookie (`lib/session.ts`) —
no user accounts, no auth library.

## Project structure

```
app/
  page.tsx              # the whole public site (client-rendered)
  layout.tsx             # root layout, theme init script, global overlays
  admin/                 # password-gated CMS pages (board, events, applications)
  api/                    # route handlers — public (board-members, events,
                          #   applications) and admin (CRUD + login/logout/upload-sign)
components/
  gh-mascot-3d.tsx        # the 3D Octocat model (locked)
  gh-mascot-toggle.tsx    # scroll-dock + eye-tracking + click-to-toggle (locked)
  mascot-glow.tsx         # glow that tracks the mascot (safe to edit)
  mascot-easter-egg.tsx   # 7-click easter egg (safe to edit)
  scroll-stack.tsx        # the pinning/stacking card deck (Benefits section)
  particle-text.tsx       # canvas particle-formation animated text (Join CTA)
  event-popup-card.tsx / board-member-popup-card.tsx   # flip cards
  enhanced-timeline.tsx   # the Journey section
  gh-marquee.tsx          # the scrolling ticker under the hero
  join-form.tsx           # the onboarding application form
  theme-provider.tsx      # hand-rolled light/dark theme context
  admin/                  # admin-only forms, image upload widget, nav
  ui/                     # small shadcn-style primitives (button, card, badge)
lib/
  db.ts                   # D1 CRUD functions (applications, board_members, events)
  session.ts               # admin cookie signing/verification
  validate-*.ts            # plain-function form validators
db/
  schema.sql               # D1 schema (SQLite dialect)
workers/
  cloudinary-sign/          # standalone Worker, signs Cloudinary uploads
```

## Getting started

**Prerequisites:**

- **Node.js 18+**
- **`openssl`** — to generate `SESSION_SECRET` (preinstalled on macOS/most Linux)
- **`wrangler`** (installed as a devDependency, or `npm install -g wrangler`)
  logged in via `wrangler login` — needed to create/reach the D1 database
- **A Cloudflare account** — D1 is provisioned there. Free tier is fine.
- **A Cloudinary account** (free tier) — only needed to test photo uploads;
  everything else works without it.

**Setup:**

```bash
git clone <repository-url>
cd github-community-hyd-website
npm install --legacy-peer-deps   # next@14 vs @opennextjs/cloudflare's peer range

cp .env.example .env
```

Fill in `.env`:

- `ADMIN_PASSWORD` — the shared password for `/admin`.
- `SESSION_SECRET` — run `openssl rand -hex 32` and paste the output.
- `UPLOAD_SIGN_URL` / `WORKER_SHARED_SECRET` — only needed for image
  uploads; see below. Safe to leave as placeholders otherwise.

D1 needs no connection string — it's a binding, not a URL. If you don't
already have a D1 database provisioned for this project:

```bash
npx wrangler d1 create <a-name-you-pick>
# paste the printed database_id into wrangler.jsonc's d1_databases entry
npm run cf-typegen   # regenerates cloudflare-env.d.ts for the new binding
```

Apply the schema locally, then start the app:

```bash
npm run db:migrate:local   # applies db/schema.sql to the local D1 emulation
npm run dev
```

Site is at `http://localhost:3000`, admin portal at `/admin` (log in with
`ADMIN_PASSWORD`). No container, no separate database process — `next dev`
gets D1 access automatically.

**Schema changes don't auto-apply** — editing `db/schema.sql` does nothing
until you rerun `npm run db:migrate:local` (or `db:migrate:remote` for the
live database).

## Image uploads (optional)

Board member and event photos upload to Cloudinary via the standalone
`workers/cloudinary-sign/` Worker, which only signs upload requests — it
never touches the main app's build or deploy.

```bash
cd workers/cloudinary-sign
wrangler login   # if not already

wrangler secret put WORKER_SHARED_SECRET --config ./wrangler.toml
wrangler secret put CLOUDINARY_API_KEY --config ./wrangler.toml
wrangler secret put CLOUDINARY_API_SECRET --config ./wrangler.toml
wrangler secret put CLOUDINARY_CLOUD_NAME --config ./wrangler.toml

wrangler deploy --config ./wrangler.toml
```

Always pass `--config ./wrangler.toml` explicitly — the repo's root
`wrangler.jsonc` is the _main app's_ Worker config, and without `--config`
`wrangler` will auto-detect that one instead and target the wrong Worker.

`wrangler deploy` prints the Worker's URL. Put it in `.env`:

```
UPLOAD_SIGN_URL=https://<your-worker>.workers.dev/sign
WORKER_SHARED_SECRET=<same value you set with wrangler secret put>
```

Restart `npm run dev` after editing `.env`.

## Scripts

```bash
npm run dev                # dev server
npm run build               # production build (typecheck + Next build)
npm run lint                 # ESLint (prompts for config on first run)
npm run format                # Prettier — no semicolons, double quotes
npm run db:migrate:local       # apply db/schema.sql to local D1
npm run db:migrate:remote       # apply db/schema.sql to the live D1 database
npm run preview                  # build + run the actual Worker locally
npm run deploy                    # build + deploy the Worker to Cloudflare
npm run cf-typegen                 # regenerate cloudflare-env.d.ts after
                                    #   changing wrangler.jsonc's bindings
```

## Deployment

`npm run deploy` builds the app via OpenNext and deploys it as a Cloudflare
Worker (`wrangler.jsonc`'s `name`). The D1 database, `ASSETS`, and `IMAGES`
bindings are all declared there. `workers/cloudinary-sign` deploys
separately, from its own directory, and isn't part of this deploy step.

## Conventions worth knowing before you touch code

- Prettier enforces **no semicolons, double quotes** — run `npm run format`.
- Path alias `@/*` maps to the repo root — there's no `src/`.
- Components use **named** exports; default exports are only `app/page.tsx`,
  `app/layout.tsx`, and route `page.tsx` files.
- Two color systems both encode the dark theme independently (shadcn HSL
  variables _and_ literal `gh.*` Tailwind utilities) — a color change
  usually needs both. See `CLAUDE.md` for details.

For everything else — the reasoning behind specific fixes, known sharp
edges, and the "we hit this bug once, here's why" notes — read
[`CLAUDE.md`](./CLAUDE.md).
