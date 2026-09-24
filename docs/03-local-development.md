# Local development

## Prerequisites

- **Node.js 20 or newer** and npm.
- **A Cloudflare account** (the free plan is enough) and `npx wrangler login`
  done once. Local development does not touch your Cloudflare resources, but
  wrangler wants to know who you are.
- **Optional:** a Cloudinary account, only if you want image uploads to work
  locally.

## First run

```bash
git clone https://github.com/Git-HubCommunityGitamHyd/Github-Community-Club-Website.git
cd Github-Community-Club-Website
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable               | Needed for       | How to get a value                                                |
| ---------------------- | ---------------- | ----------------------------------------------------------------- |
| `ADMIN_PASSWORD`       | CMS login        | Any long password you choose                                      |
| `SESSION_SECRET`       | CMS login        | `openssl rand -hex 32`                                            |
| `ADMIN_PATH`           | Reaching the CMS | `openssl rand -hex 12`, then the CMS is at `/<that value>`        |
| `UPLOAD_SIGN_URL`      | Image uploads    | The signing Worker's URL plus `/sign` (see below)                 |
| `WORKER_SHARED_SECRET` | Image uploads    | `openssl rand -hex 32`, same value in the signing Worker          |
| `GITHUB_TOKEN`         | Optional         | A GitHub token with no scopes; raises the commit-count rate limit |

Create the local database and start the server:

```bash
npm run db:migrate:local
npm run dev
```

- The site: `http://localhost:3000`
- The CMS: `http://localhost:3000/<ADMIN_PATH>`

## How the local database works

There is no database process to start. `next.config.js` calls
`initOpenNextCloudflareForDev()`, which gives `next dev` the same bindings the
deployed Worker has, emulated by wrangler (Miniflare). The local D1 lives in
`.wrangler/state/`, which is ignored by git. Deleting that folder resets the
database; run `npm run db:migrate:local` again afterwards.

To look inside it:

```bash
npx wrangler d1 execute github-community-db --local --command "SELECT id, name FROM members"
```

A freshly created database is empty. Add content through the CMS.

## Image uploads locally

Uploads need the signing Worker. You can run it locally in a second terminal:

```bash
cd workers/cloudinary-sign
npx wrangler dev --config ./wrangler.toml
```

Give it its secrets in `workers/cloudinary-sign/.dev.vars`
(`WORKER_SHARED_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`CLOUDINARY_CLOUD_NAME`) and set `UPLOAD_SIGN_URL=http://localhost:8787/sign`
in the app's `.env`. Without this the CMS still works; the upload field says
uploads are not configured.

## Scripts

| Command                           | Does                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `npm run dev`                     | Dev server with local D1                                 |
| `npm run build`                   | Next.js production build (a good check before a PR)      |
| `npm run lint`                    | ESLint                                                   |
| `npm run format`                  | Prettier over the whole repo                             |
| `npm run format:check`            | Prettier, check only                                     |
| `npm run db:migrate:local`        | Apply `db/schema.sql` to the local D1                    |
| `npm run db:migrate:remote`       | Apply `db/schema.sql` to production D1                   |
| `npm run db:patch:local -- FILE`  | Run one migration file locally                           |
| `npm run db:patch:remote -- FILE` | Run one migration file against production                |
| `npm run preview`                 | Build the real Worker and run it locally                 |
| `npm run deploy`                  | Build and deploy the Worker                              |
| `npm run cf-typegen`              | Regenerate `cloudflare-env.d.ts` after changing bindings |
| `npm run build:doodles`           | Regenerate the background doodle tile                    |

## Before opening a pull request

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm run build
```

All four should pass. Then click through what you changed in the browser;
type checks do not prove a page looks right.

## Conventions

These are enforced by review, not tooling, so they are worth reading once.

- **Named exports** for components. Default exports only in
  `app/**/page.tsx` and `layout.tsx`.
- **No barrel files.** Import the concrete file, never an `index.ts` that
  re-exports.
- **Prettier style:** no semicolons, double quotes. `npm run format` fixes it.
- **Choices are stored as keys.** If a CMS field picks from a fixed set (an
  event category, a status, a board accent colour), the database stores a
  short key like `"workshop"`. A lookup in `features/` turns the key into a
  label, icon or colour, and falls back to a default for an unknown key. The
  admin form offers the keys in a `<select>` and validation rejects others.
  Never store markup, class names or colours in the database.
- **Public queries name their columns.** Tables hold private fields (phone
  numbers, registration numbers). A public query that lists its columns
  cannot leak a field added later.
- **Admin URLs go through a helper.** Never write `/admin/...` or
  `/api/admin/...` into a link or fetch. Use `adminUrl()` on the server or
  `useAdminUrl()` in client components. See
  [CMS and security](./06-cms-and-security.md).
- **Animation:** import from `framer-motion`, never `motion/react`, and use
  `lib/use-reduced-motion.ts` rather than framer's own hook.
- **No em dashes in visible copy**, and copy must not overstate what the club
  does. See the notes in [Overview](./01-overview.md).

## Adding a new kind of CMS content

1. Add the table to `db/schema.sql` and a migration file under
   `db/migrations/` (see [Database](./05-database.md)). Run it locally.
2. Write `lib/db/<name>.ts` (queries) and `lib/validation/<name>.ts`.
3. Add a public `GET` in `app/api/<name>/route.ts` if anything outside the
   pages needs it, with `export const dynamic = "force-dynamic"`.
4. Add CRUD handlers under `app/api/admin/<name>/`, each starting with
   `requireAdminApi()`.
5. Add screens under `app/admin/(dashboard)/<name>/`. Each page calls
   `await requireAdminPage()` itself, first thing. Add it to
   `features/admin/admin-nav.tsx`.
6. Build the public UI in `features/<name>/`, and a
   `features/home/sections/` file if it belongs on the homepage.
