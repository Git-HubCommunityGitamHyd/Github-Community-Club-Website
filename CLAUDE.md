# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page Next.js 16 (App Router) site for the GitHub Community club at GITAM Hyderabad, plus a join-the-club onboarding form and a small in-house CMS (board members, events), all backed by Cloudflare D1 (SQLite) behind a password-protected admin portal.

The app itself is deployed as a Cloudflare Worker via `@opennextjs/cloudflare` (OpenNext) — not Vercel. `wrangler.jsonc` is the Worker config (bindings for `DB`/`ASSETS`/`IMAGES`), `package.json`'s `deploy`/`preview`/`upload` scripts all go through `opennextjs-cloudflare`, and `next.config.js` calls `initOpenNextCloudflareForDev()` unconditionally so plain `next dev` also gets Cloudflare bindings (via wrangler's local Miniflare emulation) and reads `.dev.vars`.

There is no `src/` directory. Path alias `@/*` maps to the repo **root**. Do not add barrel `index.ts` re-exports — import the concrete file.

## Layout

```
app/                 # routes only
  page.tsx           # composes <HomePage />
  admin/
    login/
    (dashboard)/     # URL unchanged; auth in layout.tsx
  api/
features/            # domain UI (home, board, events, join, admin)
components/
  ui/                # shadcn primitives
  mascot/            # 3D octocat, glow, easter egg, marquee
  motion/            # scroll-stack, timeline, popups, particle text
  theme/             # provider + toggle
lib/
  db/                # one file per table
  auth/              # session cookie + require-admin helpers
  validation/        # one file per form
workers/             # cloudinary-sign Worker (separate deploy)
db/schema.sql
```

## Content: board members & events are DB-backed, not hardcoded

[`app/page.tsx`](app/page.tsx) is a Server Component: it loads `board_members` and `events` in parallel via `lib/db` (`Promise.all`) and passes them into the client [`HomePage`](features/home/home-page.tsx). It is `export const dynamic = "force-dynamic"` so the D1 query is not frozen at `next build`. [`app/loading.tsx`](app/loading.tsx) shows [`PageSkeleton`](features/home/page-skeleton.tsx) while that query runs. Public `GET /api/board-members` and `GET /api/events` stay for other clients. Homepage copy (`NAV_ITEMS`, stats, pillars, benefits, journey timeline) lives in [`features/home/content.ts`](features/home/content.ts). Each `id="hero"|about|…` block is a file under [`features/home/sections/`](features/home/sections/). Adding a homepage section means a new file there plus a line in `home-page.tsx` — do not grow `app/page.tsx` beyond composing `<HomePage />` and fetching.

Manage CMS through `/admin/board`, `/admin/events` and `/admin/journey` (same shared-password auth as `/admin`). List/add/edit/delete pages live under `app/admin/(dashboard)/` and call `lib/db/board-members.ts` / `lib/db/events.ts` / `lib/db/journey.ts`. Validation lives in `lib/validation/board-member.ts` / `lib/validation/event.ts` / `lib/validation/journey.ts` / `lib/validation/application.ts` (plain function, `Record<string, string>` errors).

**Anything a CMS row selects from a fixed set is stored as a key, never as markup or a colour.** `events.category` → `categoryGlyph()`, `journey_entries.icon` → `JOURNEY_ICONS`, `board_members.accent` → `BOARD_ACCENTS`. The admin form offers the known keys as a `<select>`, validation rejects unknown ones, and the render path falls back rather than throwing. A free-text field here means a typo silently renders the default glyph, and a free hex field means a colour that belongs to no palette ends up on the site permanently.

**`app/page.tsx`, `app/v2/page.tsx`, `app/api/board-members/route.ts`, `app/api/events/route.ts` and `app/api/journey/route.ts` are `export const dynamic = "force-dynamic"`.** Without that, Next.js statically prerenders them at _build_ time — which would freeze whatever the DB returned during `next build` instead of querying fresh per request. Hit this for real; don't drop the export.

### Adding another CMS type

1. Table in `db/schema.sql` + migrate
2. `lib/db/<name>.ts` + `lib/validation/<name>.ts`
3. Public `GET` in `app/api/<name>/route.ts` (`dynamic = "force-dynamic"`)
4. CRUD under `app/api/admin/<name>/` calling `requireAdminApi()`
5. Screens under `app/admin/(dashboard)/<name>/`
6. Public UI in `features/<name>/` and a new `features/home/sections/` file if it belongs on the homepage

### Image uploads: Cloudinary + a standalone Cloudflare Worker

Photos go to Cloudinary, not `public/images/`. The upload flow is deliberately indirect because the Cloudinary API secret must never reach the Next.js app's own Worker or the browser:

1. Browser (`features/admin/image-upload-field.tsx`) calls same-origin `POST /api/admin/upload-sign` — protected by `requireAdminApi()`.
2. That route calls the Worker at `workers/cloudinary-sign/` (deployed separately via `wrangler deploy`, not part of the Next.js build) server-to-server, authenticated with a shared secret (`WORKER_SHARED_SECRET`, matching values in Next.js env and `wrangler secret put`) — **not** the session cookie, since a cookie set by the Next.js app's domain is never sent to a Worker on a different domain.
3. The Worker computes a Cloudinary signed-upload signature (SHA-1 via `crypto.subtle`, since Workers isn't a Node runtime) and returns it.
4. The browser uploads the file directly to Cloudinary using that signature; the resulting `secure_url` is what gets stored in `image_url`/`images`.

`next.config.js` `remotePatterns` includes `res.cloudinary.com` for this reason — **any remote image host has to be added there or `next/image` 400s on it.**

Images already in `public/images/{board,events}/` predate this and are the pre-CMS seed data; new content goes through Cloudinary instead.

## Dark theme: two parallel palettes

The theme is hand-rolled (`components/theme/theme-provider.tsx` — React context + `localStorage` + `classList.toggle("dark")` via `useSyncExternalStore`), not `next-themes`. An inline anti-FOUC script in `app/layout.tsx` sets the class before paint.

Two systems encode the GitHub palette independently, and changing one does not change the other:

- shadcn HSL CSS variables under `.dark` in `app/globals.css`
- literal `gh.*` Tailwind utilities (`dark:bg-gh-surface`, `dark:text-gh-muted`) from `tailwind.config.js`

A color change usually needs both.

## Conventions

- Path alias `@/*` maps to the repo **root**, not `./src` — there is no `src/`.
- Components use **named** exports (`export function EnhancedTimeline`). Default exports only in `app/page.tsx`, `app/layout.tsx`, and route `page.tsx` files (plus a couple of vendored motion files that already default-export).
- `app/page.tsx` is a Server Component (D1 fetch). Interactive chrome lives in `"use client"` `features/home/home-page.tsx`. Admin dashboard pages under `app/admin/(dashboard)/` are server components — they read D1 after the layout checks the session.
- Prettier (`.prettierrc`) enforces no semicolons and double quotes. Run `npm run format`.

## Database (Cloudflare D1)

No local server/container to run. The `DB` binding is declared in `wrangler.jsonc` (`d1_databases`), and `next.config.js`'s `initOpenNextCloudflareForDev()` wiring means plain `npm run dev` already has `env.DB` available, backed by wrangler's local Miniflare D1 emulation under `.wrangler/state` (gitignored). First-time setup: `cp .env.example .env` and fill in `ADMIN_PASSWORD` and a `SESSION_SECRET` (`openssl rand -hex 32`) — D1 itself needs no connection-string env var, it's a binding, not a URL.

**`db/schema.sql` cannot add a column to an existing table.** It is all `CREATE TABLE IF NOT EXISTS`, so it does nothing to a table that already exists, and SQLite has no `ADD COLUMN IF NOT EXISTS`. Adding a column means editing the `CREATE` (for fresh databases) _and_ writing a one-off `ALTER` under `db/migrations/`, run with `npm run db:patch:local -- db/migrations/<file>.sql` (or `db:patch:remote`). Those run exactly once per database and error if repeated. See `db/migrations/2026-09-board-member-accent.sql`.

**Schema changes don't auto-apply.** `db/schema.sql` only runs when you explicitly execute it — `npm run db:migrate:local` (local Miniflare D1) or `npm run db:migrate:remote` (the real deployed D1 database) — both just `wrangler d1 execute --file=db/schema.sql` against `--local`/`--remote`. Editing `db/schema.sql` does nothing on its own until you rerun the relevant script. A 3-table schema doesn't need real migration tooling yet (`wrangler d1 migrations`) — reach for that if it starts churning.

`lib/db/client.ts` calls `getCloudflareContext({ async: true })` (from `@opennextjs/cloudflare`) per request to get `env.DB`. Domain files (`applications.ts`, `board-members.ts`, `events.ts`) import `getDb()` from there and use D1's `prepare(sql).bind(...).first()/.all()/.run()` API — no pooling/connection-caching needed. `events.images` is stored as JSON-encoded `TEXT` (D1/SQLite has no array type); the encode/decode is contained entirely inside `lib/db/events.ts`, every caller still sees a plain `string[]`.

## Admin auth

No auth library — one shared password (`ADMIN_PASSWORD` env var) protects everything under `/admin` (except login) and `/api/admin/*`. `lib/auth/session.ts` signs a cookie (`${expiry}.${hmac}`, HMAC keyed by `SESSION_SECRET`, verified with `crypto.timingSafeEqual`) rather than storing sessions anywhere. **Rotating `SESSION_SECRET` and restarting is the "log everyone out" procedure** — there's no session store to clear.

Page auth lives in `app/admin/(dashboard)/layout.tsx` via `requireAdminPage()` — `/admin/login` is outside that group so it stays public. API auth is `requireAdminApi()` at the top of every `/api/admin/**` handler except login. `features/admin/admin-nav.tsx` is the shared nav + logout button. `cookies()`, `params`, and `searchParams` are async in Next 16 — always `await` them (see `getSessionCookie()` in `lib/auth/session.ts`).

**`COOKIE_PATH` in `lib/auth/session.ts` is `"/"`, not `"/admin"`.** It was originally `/admin`, which silently broke every `/api/admin/**` route the first time one was added — `/api/admin/*` doesn't fall under the `/admin` path prefix, so the browser never sent the cookie there and every request 401'd despite `/admin` itself working fine. If you're debugging a mysterious 401 on an admin API route, check this first.

## Gotchas

- **`overflow-x-hidden` silently breaks `position: sticky` inside it.** Setting `overflow` to `hidden` on one axis forces the other to `auto`, which makes the element a scroll container; every sticky descendant then resolves against a scrollport that never moves. `features/v2/v2-page.tsx` uses `overflow-x-clip`, which clips identically without establishing one. If something sticky in the v2 tree stops sticking, check this first.
- `tailwind.config.js` `content` must include `./features/**` (and `./app/**`, `./components/**`). Tailwind only emits classes it finds in those globs — after the homepage moved out of `app/page.tsx`, missing `features/` stripped the hero/stat/grid utilities and collapsed the layout.
- `npm run lint` runs ESLint 9 via `eslint.config.mjs` (`eslint-config-next`). `next lint` was removed in Next.js 16.
- The public `applications` table has a `UNIQUE` constraint on `email` — `app/api/applications/route.ts` catches D1's thrown error (message includes `"UNIQUE constraint failed"`, no `.code` field like Postgres had) and returns 409, don't let it bubble as a 500.
