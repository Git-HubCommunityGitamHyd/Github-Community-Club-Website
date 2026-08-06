# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page Next.js 14 (App Router) site for the GitHub Community club at GITAM Hyderabad, plus a join-the-club onboarding form and a small in-house CMS (board members, events), all backed by Cloudflare D1 (SQLite) behind a password-protected admin portal.

The app itself is deployed as a Cloudflare Worker via `@opennextjs/cloudflare` (OpenNext) — not Vercel. `wrangler.jsonc` is the Worker config (bindings for `DB`/`ASSETS`/`IMAGES`), `package.json`'s `deploy`/`preview`/`upload` scripts all go through `opennextjs-cloudflare`, and `next.config.js` calls `initOpenNextCloudflareForDev()` unconditionally so plain `next dev` also gets Cloudflare bindings (via wrangler's local Miniflare emulation) and reads `.dev.vars`.

## Content: board members & events are DB-backed, not hardcoded

`app/page.tsx` fetches `board_members` and `events` client-side from the public `GET /api/board-members` and `GET /api/events` routes once `mounted` is true, and renders skeleton placeholders while `contentLoading`. The timeline items are still passed inline as the `items` prop to `<EnhancedTimeline>` — the timeline itself wasn't moved into the DB, only board/events were.

Manage both through `/admin/board` and `/admin/events` (same shared-password auth as `/admin`). Each has list/add/edit/delete pages backed by `app/api/admin/board-members/**` and `app/api/admin/events/**`, which call the CRUD functions in `lib/db.ts` (`listBoardMembers`/`insertBoardMember`/`updateBoardMember`/`deleteBoardMember`, and the `Event` equivalents). Validation for both lives in `lib/validate-board-member.ts`/`lib/validate-event.ts`, mirroring `lib/validate-application.ts`'s shape (plain function, `Record<string, string>` errors).

**Both `app/api/board-members/route.ts` and `app/api/events/route.ts` are `export const dynamic = "force-dynamic"`.** Without that, Next.js statically prerenders GET route handlers with no dynamic APIs at _build_ time — which would freeze whatever the DB returned during `next build` instead of querying fresh per request. Hit this for real; don't drop the export.

### Image uploads: Cloudinary + a standalone Cloudflare Worker

Photos go to Cloudinary, not `public/images/`. The upload flow is deliberately indirect because the Cloudinary API secret must never reach the Next.js app's own Worker or the browser:

1. Browser (`components/admin/image-upload-field.tsx`) calls same-origin `POST /api/admin/upload-sign` — protected by the normal session-cookie check.
2. That route calls the Worker at `workers/cloudinary-sign/` (deployed separately via `wrangler deploy`, not part of the Next.js build) server-to-server, authenticated with a shared secret (`WORKER_SHARED_SECRET`, matching values in Next.js env and `wrangler secret put`) — **not** the session cookie, since a cookie set by the Next.js app's domain is never sent to a Worker on a different domain.
3. The Worker computes a Cloudinary signed-upload signature (SHA-1 via `crypto.subtle`, since Workers isn't a Node runtime) and returns it.
4. The browser uploads the file directly to Cloudinary using that signature; the resulting `secure_url` is what gets stored in `image_url`/`images`.

`next.config.js` `remotePatterns` includes `res.cloudinary.com` for this reason — **any remote image host has to be added there or `next/image` 400s on it.**

Images already in `public/images/{board,events}/` predate this and are the pre-CMS seed data; new content goes through Cloudinary instead.

## Dark theme: two parallel palettes

The theme is hand-rolled (`components/theme-provider.tsx` — React context + `localStorage` + `classList.toggle("dark")`), not `next-themes`. An inline anti-FOUC script in `app/layout.tsx` sets the class before paint.

Two systems encode the GitHub palette independently, and changing one does not change the other:

- shadcn HSL CSS variables under `.dark` in `app/globals.css`
- literal `gh.*` Tailwind utilities (`dark:bg-gh-surface`, `dark:text-gh-muted`) from `tailwind.config.js`

A color change usually needs both.

## Conventions

- Path alias `@/*` maps to the repo **root**, not `./src` — there is no `src/`.
- Components use **named** exports (`export function EnhancedTimeline`). Default exports only in `app/page.tsx`, `app/layout.tsx`, and route `page.tsx` files.
- Nearly everything is `"use client"`, and `app/page.tsx` early-returns `<PageSkeleton />` until mounted — so despite `rsc: true` in `components.json`, this renders client-side. Don't assume server-component behavior. `app/admin/page.tsx` is the exception: the first genuine server component in the repo, since it needs to read cookies and query D1 before render.
- Prettier (`.prettierrc`) enforces no semicolons and double quotes. Run `npm run format`.

## Database (Cloudflare D1)

No local server/container to run. The `DB` binding is declared in `wrangler.jsonc` (`d1_databases`), and `next.config.js`'s `initOpenNextCloudflareForDev()` wiring means plain `npm run dev` already has `env.DB` available, backed by wrangler's local Miniflare D1 emulation under `.wrangler/state` (gitignored). First-time setup: `cp .env.example .env` and fill in `ADMIN_PASSWORD` and a `SESSION_SECRET` (`openssl rand -hex 32`) — D1 itself needs no connection-string env var, it's a binding, not a URL.

**Schema changes don't auto-apply.** `db/schema.sql` only runs when you explicitly execute it — `npm run db:migrate:local` (local Miniflare D1) or `npm run db:migrate:remote` (the real deployed D1 database) — both just `wrangler d1 execute --file=db/schema.sql` against `--local`/`--remote`. Editing `db/schema.sql` does nothing on its own until you rerun the relevant script. A 3-table schema doesn't need real migration tooling yet (`wrangler d1 migrations`) — reach for that if it starts churning.

`lib/db.ts` calls `getCloudflareContext({ async: true })` (from `@opennextjs/cloudflare`) per request to get `env.DB`, then uses D1's `prepare(sql).bind(...).first()/.all()/.run()` API — no pooling/connection-caching needed, D1 is a stateless binding, not a persistent connection. `events.images` is stored as JSON-encoded `TEXT` (D1/SQLite has no array type, unlike the old Postgres `TEXT[]`); the encode/decode is contained entirely inside `lib/db.ts`, every caller still sees a plain `string[]`.

## Admin auth

No auth library — one shared password (`ADMIN_PASSWORD` env var) protects everything under `/admin` and `/api/admin/*`. `lib/session.ts` signs a cookie (`${expiry}.${hmac}`, HMAC keyed by `SESSION_SECRET`, verified with `crypto.timingSafeEqual`) rather than storing sessions anywhere. **Rotating `SESSION_SECRET` and restarting is the "log everyone out" procedure** — there's no session store to clear. The auth check is duplicated at the top of every `/admin/**` page and every `/api/admin/**` route handler (not centralized in `middleware.ts`); `components/admin/admin-nav.tsx` is the one shared piece (nav + logout button across the three admin sections).

**`COOKIE_PATH` in `lib/session.ts` is `"/"`, not `"/admin"`.** It was originally `/admin`, which silently broke every `/api/admin/**` route the first time one was added — `/api/admin/*` doesn't fall under the `/admin` path prefix, so the browser never sent the cookie there and every request 401'd despite `/admin` itself working fine. If you're debugging a mysterious 401 on an admin API route, check this first.

## Gotchas

- `npm run lint` has no ESLint config file, so `next lint` prompts for setup on first run.
- The public `applications` table has a `UNIQUE` constraint on `email` — `app/api/applications/route.ts` catches D1's thrown error (message includes `"UNIQUE constraint failed"`, no `.code` field like Postgres had) and returns 409, don't let it bubble as a 500.
