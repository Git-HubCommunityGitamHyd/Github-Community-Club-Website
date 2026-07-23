# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page Next.js 14 (App Router) site for the GitHub Community club at GITAM Hyderabad, plus a join-the-club onboarding form backed by Postgres and a password-protected admin portal to view submissions.

## Content lives in `app/page.tsx`

`boardMembers` and `events` are hardcoded arrays near the top of `app/page.tsx`; the timeline items are passed inline as the `items` prop to `<EnhancedTimeline>`. Adding a board member or event means editing that file — there is no CMS or API.

Images are static files in `public/images/{board,events}/`. **External image URLs will fail at runtime**: `next.config.js` `remotePatterns` whitelists only `localhost`, so any remote `src` passed to `next/image` throws until its hostname is added there.

## Dark theme: two parallel palettes

The theme is hand-rolled (`components/theme-provider.tsx` — React context + `localStorage` + `classList.toggle("dark")`), not `next-themes`. An inline anti-FOUC script in `app/layout.tsx` sets the class before paint.

Two systems encode the GitHub palette independently, and changing one does not change the other:

- shadcn HSL CSS variables under `.dark` in `app/globals.css`
- literal `gh.*` Tailwind utilities (`dark:bg-gh-surface`, `dark:text-gh-muted`) from `tailwind.config.js`

A color change usually needs both.

## Conventions

- Path alias `@/*` maps to the repo **root**, not `./src` — there is no `src/`.
- Components use **named** exports (`export function EnhancedTimeline`). Default exports only in `app/page.tsx`, `app/layout.tsx`, and route `page.tsx` files.
- Nearly everything is `"use client"`, and `app/page.tsx` early-returns `<PageSkeleton />` until mounted — so despite `rsc: true` in `components.json`, this renders client-side. Don't assume server-component behavior. `app/admin/page.tsx` is the exception: the first genuine server component in the repo, since it needs to read cookies and query Postgres before render.
- Prettier (`.prettierrc`) enforces no semicolons and double quotes. Run `npm run format`.

## Local database (Docker + Postgres)

`npm run db:up` starts a `postgres:16-alpine` container via `docker-compose.yml`. First time setup: `cp .env.example .env` and fill in `ADMIN_PASSWORD` and a `SESSION_SECRET` (`openssl rand -hex 32`). If `docker compose version` fails, Docker Desktop's cask can get stranded in the Homebrew Caskroom without being linked into `/Applications` — `brew reinstall --cask docker` fixes that, then open Docker.app once by hand (license + macOS permissions + starting the daemon can't be scripted).

**Schema changes don't auto-apply.** `db/init.sql` only runs once, against an empty volume, via Postgres's `docker-entrypoint-initdb.d` mechanism. Editing it after the first `docker compose up` does nothing until you either run the new SQL by hand (`docker compose exec db psql -U <user> -d <db>`) or `docker compose down -v` (which deletes all applicant data — don't do this without a reason). If the schema starts churning, switch to a real migration tool then; a single-table form doesn't need one yet.

`lib/db.ts` exports `pool` (a `pg.Pool` singleton cached on `globalThis` — needed because `next dev`'s Fast Refresh would otherwise re-instantiate it and leak connections) plus `insertApplication()`/`listApplications()`.

## Admin auth

No auth library — one shared password (`ADMIN_PASSWORD` env var) protects `/admin`. `lib/session.ts` signs a cookie (`${expiry}.${hmac}`, HMAC keyed by `SESSION_SECRET`, verified with `crypto.timingSafeEqual`) rather than storing sessions anywhere. **Rotating `SESSION_SECRET` and restarting is the "log everyone out" procedure** — there's no session store to clear. The auth check lives directly at the top of `app/admin/page.tsx` (not in `middleware.ts`), since `/admin` is the only protected route today; if more admin pages get added, that's the point to extract a shared check.

## Gotchas

- **`README.md` is out of date.** It documents a black/white color scheme, a component tree, and a "Known Issues" list that no longer match the code. Trust the source, not the README.
- `npm run lint` has no ESLint config file, so `next lint` prompts for setup on first run.
- The public `applications` table has a `UNIQUE` constraint on `email` — `app/api/applications/route.ts` catches Postgres error `23505` and returns 409, don't let it bubble as a 500.
