# GitHub Community GITAM — Website

The public website for the **GitHub Community club at GITAM Hyderabad**, and
the small in-house CMS behind it.

- A long homepage (`/`): hero, about, journey, board, events, projects,
  ideas, builds, benefits and the join form.
- Inner pages: `/members`, `/projects` and `/projects/[slug]`, `/proposals`
  (with a Typeform-style form at `/proposals/new`), `/builds` (with
  `/builds/submit` and `/builds/[slug]`), and private status pages at
  `/proposals/track/[token]` and `/builds/track/[token]`.
- A password-protected CMS at `/admin` for every piece of content above.

For the reasoning behind specific decisions and the sharp edges, read
[`CLAUDE.md`](./CLAUDE.md). This file is the tour.

## Stack

| Piece    | What                                                                 |
| -------- | -------------------------------------------------------------------- |
| App      | Next.js 16 (App Router), React 19, TypeScript                        |
| Styling  | Tailwind CSS 3.4, a GitHub dark palette, Geist and Geist Mono        |
| Motion   | framer-motion, Lenis smooth scroll, a Three.js Octocat mascot        |
| Hosting  | A Cloudflare Worker, built with `@opennextjs/cloudflare`             |
| Database | Cloudflare D1 (SQLite), bound to the Worker as `DB`                  |
| Images   | Cloudinary, signed by a separate Worker in `workers/cloudinary-sign` |

It does **not** deploy to Vercel. `wrangler.jsonc` is the Worker's real
config, and `npm run deploy` goes through OpenNext.

## Project structure

```
app/                    routes only
  page.tsx              homepage: loads every section's data from D1
  layout.tsx            fonts, metadata
  members/ projects/ proposals/ builds/   inner pages
  admin/login/          public login page
  admin/(dashboard)/    CMS screens, each checks the session itself
  api/                  public GET routes, form POSTs, admin CRUD
features/               UI, one folder per domain
  home/                 home-page.tsx and sections/*.tsx, one per section
  site/                 shared chrome: navbar, footer, nav items, page chrome,
                        smooth scroll, dialog shell, page transitions
  mascot/               the 3D Octocat, its docking and perching
  about/ benefits/ board/ events/ journey/ join/ members/ people/
  projects/ proposals/ builds/ forms/ tech/ tracking/
  admin/                CMS forms and nav
components/ui/          generic primitives (button, card, navbar shell, ...)
lib/
  db/                   one file per table
  validation/           one file per form
  auth/                 session cookie and requireAdmin helpers
  cloudinary/ github/   upload helper, commit counts
db/schema.sql           the D1 schema, plus db/migrations/ for ALTERs
workers/cloudinary-sign standalone Worker that signs Cloudinary uploads
public/                 site assets only (Octocat model, logo, QR, doodle tile);
                        all media lives in Cloudinary
```

## Getting started

Prerequisites: Node 20+, a Cloudflare account (the free tier is fine) with
`npx wrangler login` done, and optionally a Cloudinary account for uploads.

```bash
npm install
cp .env.example .env
```

In `.env`, set `ADMIN_PASSWORD` and `SESSION_SECRET` (`openssl rand -hex 32`).
`UPLOAD_SIGN_URL` and `WORKER_SHARED_SECRET` are only needed for image
uploads.

```bash
npm run db:migrate:local   # apply db/schema.sql to the local D1
npm run dev
```

The site is at `http://localhost:3000` and the CMS at `/admin`. `next dev`
gets the D1 binding automatically through wrangler's local emulation, so
there is no database process to run.

**Schema changes do not apply themselves.** A new column needs an edit to
`db/schema.sql` _and_ a one-off `ALTER` in `db/migrations/`, run with
`npm run db:patch:local -- db/migrations/<file>.sql` (and `db:patch:remote`
for production).

## Image uploads

The Cloudinary API secret lives only in the `workers/cloudinary-sign`
Worker. The app asks it for a signature server to server, and the browser
uploads straight to Cloudinary.

```bash
cd workers/cloudinary-sign
npx wrangler secret put WORKER_SHARED_SECRET --config ./wrangler.toml
npx wrangler secret put CLOUDINARY_API_KEY --config ./wrangler.toml
npx wrangler secret put CLOUDINARY_API_SECRET --config ./wrangler.toml
npx wrangler secret put CLOUDINARY_CLOUD_NAME --config ./wrangler.toml
npx wrangler deploy --config ./wrangler.toml
```

Always pass `--config ./wrangler.toml`: without it wrangler picks up the
root `wrangler.jsonc` and targets the main app. Put the printed URL (plus
`/sign`) in `UPLOAD_SIGN_URL`.

## Scripts

| Command                       | Does                                                   |
| ----------------------------- | ------------------------------------------------------ |
| `npm run dev`                 | dev server with local D1                               |
| `npm run build`               | Next production build                                  |
| `npm run lint`                | ESLint                                                 |
| `npm run format`              | Prettier (no semicolons, double quotes)                |
| `npm run db:migrate:local`    | apply `db/schema.sql` locally                          |
| `npm run db:migrate:remote`   | apply `db/schema.sql` to production D1                 |
| `npm run db:patch:local -- f` | run one migration file locally (`:remote` too)         |
| `npm run preview`             | build and run the real Worker locally                  |
| `npm run deploy`              | build and deploy the Worker                            |
| `npm run cf-typegen`          | regenerate `cloudflare-env.d.ts` after bindings change |

## Deploying

1. Run any new files in `db/migrations/` against production with
   `npm run db:patch:remote -- <file>`, in date order.
2. `npm run deploy`.
3. If `workers/cloudinary-sign` changed, deploy it separately (see above).

## Credits

"GitHub Octocat" 3D model by pissang, licensed under
[CC BY 4.0](http://creativecommons.org/licenses/by/4.0/).
