# CLAUDE.md

Guidance for AI coding agents (and humans) changing this repository. It is
the short list of rules and traps. The full explanation of everything lives
in [`docs/`](docs/README.md); read the relevant page before a non-trivial
change, and update it in the same change.

## What this is

The website and in-house CMS of the GitHub Community club at GITAM
University, Hyderabad. Next.js 16 (App Router, React 19, TypeScript,
Tailwind 3), deployed as **one Cloudflare Worker** via OpenNext
(`@opennextjs/cloudflare`), data in **Cloudflare D1**, images in
**Cloudinary**. Not Vercel.

**This is not the Next.js you remember.** Next 16 renamed middleware to
`proxy.ts`, made `cookies()`, `params` and `searchParams` async, removed
`next lint`, and builds with Turbopack. Check
`node_modules/next/dist/docs/` before using an API from memory.

## Commands

```bash
npm run dev                 # local site + local D1 (no DB process to start)
npm test                    # regression tests (tests/*.test.ts)
npx tsc --noEmit
npm run lint
npm run format              # Prettier: no semicolons, double quotes
npm run build
npm run db:migrate:local    # apply db/schema.sql locally
npm run db:patch:local -- db/migrations/<file>.sql
npm run deploy              # production; see "Deploying" below
```

Before calling work done: tests, tsc, lint, build, and look at the change in
the browser.

## Layout

```
app/                 routes only; pages fetch and compose, nothing else
  admin/             the CMS (served at a secret path, see below)
  api/               public GETs and form POSTs; api/admin/ is CMS CRUD
  honeypot/          the decoy served at /admin
features/            UI by domain: home/sections/, site/, mascot/, admin/, builds/...
components/ui/       generic primitives, no domain knowledge
lib/db/              one file per table; the only SQL in the codebase
lib/validation/      one file per form; plain functions, Record<string,string> errors
lib/auth/            session cookie, admin URL mapping
lib/cloudinary/      upload folders, browser upload, sign.ts (server)
lib/docs/            registry of docs/ for the CMS Docs page
db/schema.sql        the whole schema; db/migrations/ for one-off ALTERs
docs/                long-form documentation, also rendered in the CMS
workers/cloudinary-sign/   the upload-signing Worker (deployed separately)
proxy.ts             secret CMS path and /admin honeypot routing
tests/               node:test regression tests
```

No `src/`. `@/` is the repo root. No barrel `index.ts` files; import the
concrete module.

## Rules

**Data and the CMS**

- Every route that reads D1 exports `dynamic = "force-dynamic"`, or Next
  freezes the build-time result forever.
- Public queries name their columns, never `SELECT *`. `phone`, `reg_no`,
  submitter `name` and `auth_events` are private.
- A fixed choice (status, category, icon, accent, role) is stored as a
  **key**. The label, icon or colour comes from a lookup in `features/`,
  looked up with `Object.hasOwn` and falling back for unknown keys. Never
  store markup, class names or colours in the database. The CMS offers keys
  in a `<select>` and validation rejects others.
- A new column needs the `CREATE TABLE` in `schema.sql` **and** an `ALTER`
  file in `db/migrations/` (schema.sql cannot alter an existing table).
  Run it on production before deploying code that uses it.
- D1 reports unique violations only in the message
  (`"UNIQUE constraint failed"`); catch that and answer 409.
- Adding a content type: table, `lib/db`, `lib/validation`, CRUD under
  `app/api/admin/`, screens under `app/admin/(dashboard)/`, public UI in
  `features/`. See `docs/03-local-development.md`.

**CMS security**

- The CMS is at `/<ADMIN_PATH>` (a secret), not `/admin`. `proxy.ts`
  rewrites `/<ADMIN_PATH>/x` to `app/admin/x` and `/<ADMIN_PATH>/api/x` to
  `app/api/admin/x`; `/admin` is the honeypot; other `/api/admin/*` 404.
- **Never write a literal admin URL.** Use `adminUrl("/admin/...")` on the
  server and `useAdminUrl()` in client components. A bare `/admin/...`
  sends a maintainer to the honeypot.
- Every page under `app/admin/(dashboard)/` calls `await requireAdminPage()`
  itself, first line, even though the layout does too: layout and page
  render in parallel, and a page without its own check once streamed the
  applications list to a logged-out visitor.
- Every handler under `app/api/admin/` starts with `requireAdminApi()`.
- Session cookie `cms_session`: 8 h, `SameSite=Strict`, path
  `/<ADMIN_PATH>`. Login locks an IP out after 5 failures in 15 minutes.
- Never put the secret path in anything public, and never store a password,
  including in the honeypot.

**Images**

- All media is in Cloudinary, uploaded from the browser with a signature
  from `workers/cloudinary-sign`, which alone holds the Cloudinary secret.
  `public/` is for site assets only.
- In production the site reaches the signer through the **`SIGN_WORKER`
  service binding** (`lib/cloudinary/sign.ts`). Fetching its `workers.dev`
  URL from a Worker in the same account is blocked by Cloudflare and
  returns 502. `UPLOAD_SIGN_URL` is for `npm run dev` only.
- The site refuses a signature whose `params` do not echo the requested
  folder and formats. If uploads fail with "invalid signature", redeploy the
  signing Worker.
- A new remote image host must be added to `next.config.js`
  `images.remotePatterns`, or `next/image` answers 400.

**Frontend**

- Server components cannot call exports of a `"use client"` module; shared
  helpers go in plain modules.
- Import `framer-motion`, never `motion/react`. Use
  `lib/use-reduced-motion.ts`, not framer's hook (hydration mismatch).
- Use `overflow-x-clip`, not `overflow-x-hidden`, above anything sticky.
- Links to homepage sections from other pages are `/#id`.
- The palette exists twice: `gh.*` in `tailwind.config.js` and HSL variables
  in `app/globals.css`. Change both.
- Keep the 3D Octocat mascot through any redesign.
- Named exports; default exports only for `page.tsx` and `layout.tsx`.

**Copy**

- No em dashes in visible text.
- Do not overstate what the club does. The WhatsApp community group is open
  to every student; the club itself recruits in rounds with an interview,
  and "experience is not the filter". No invented events, alumni judges,
  office hours or contribution drives.
- Some copy lives in the database (events, journey); a copy review has to
  include the CMS.

## Deploying

- `npm run deploy` builds through `scripts/without-local-env.mjs`, which
  moves `.env` files aside, because OpenNext bakes every `.env` file into the
  Worker bundle as `process.env` fallbacks. Never deploy with
  `opennextjs-cloudflare build` directly.
- Production settings are Worker secrets (`npx wrangler secret put`), set in
  the club's Cloudflare account. Check `npx wrangler whoami` before any
  remote command.
- Mermaid in docs loads only in the browser (`features/admin/docs/mermaid-lazy.tsx`,
  `ssr: false`); anything heavy imported server-side counts against the
  Worker size limit. The bundle is already about 3.4 MB compressed.
- `npm run cf-typegen` also reads `.env` and declares every variable as a
  required string; keep only the binding changes from its output.

## Docs

`docs/` is the long-term reference for future boards. The CMS Docs page
imports each file as text (a Turbopack rule sends `*.md` through
`raw-loader`), so a new file needs a line in `lib/docs/registry.ts`. Inside
Mermaid blocks avoid `<placeholder>` text; Mermaid treats it as HTML.

`TODO.md` and `notes.md` are the maintainers' local working notes and are
git-ignored. Anything a future maintainer must know goes in `docs/`.
