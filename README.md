# GitHub Community GITAM — Website

Single-page Next.js site for the GitHub Community club at GITAM Hyderabad,
with a join-the-club onboarding form and an in-house CMS (board members,
events) behind a password-protected admin portal at `/admin`.

For architecture notes, gotchas, and the reasoning behind non-obvious
decisions, see [`CLAUDE.md`](./CLAUDE.md) — this file only covers getting
the project running.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **Docker Desktop** — runs the local Postgres database via
  `docker-compose.yml`. On macOS, if `docker compose version` fails, the
  cask can get stranded in Homebrew's Caskroom without being linked into
  `/Applications`; `brew reinstall --cask docker` fixes that, then open
  Docker.app once by hand (first-run permissions can't be scripted).
- **`openssl`** — to generate `SESSION_SECRET`/`WORKER_SHARED_SECRET`.
  Preinstalled on macOS and most Linux distros.
- **A Cloudinary account** (free tier is fine) — only needed if you want
  to test image uploads for board members/events. Get your Cloud Name,
  API Key, and API Secret from the Cloudinary dashboard.
- **A Cloudflare account + the `wrangler` CLI** — only needed to deploy
  the `workers/cloudinary-sign` Worker, which signs Cloudinary uploads so
  the API secret never reaches the browser or the Next.js app. Install
  with `npm install -g wrangler` and log in with `wrangler login`.

The Cloudinary/Cloudflare pieces are only required for the photo-upload
flow in the admin portal — everything else (the public site, applications
form, admin CRUD for board members/events without photos) works without
them.

## Setup

```bash
git clone <repository-url>
cd github-community-hyd-website
npm install

cp .env.example .env
# then edit .env — see below
```

Fill in `.env`:

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — any values, used
  to create the local Postgres container.
- `DATABASE_URL` — must match the three values above.
- `ADMIN_PASSWORD` — the shared password for `/admin`.
- `SESSION_SECRET` — run `openssl rand -hex 32` and paste the output.
- `UPLOAD_SIGN_URL` / `WORKER_SHARED_SECRET` — only needed for image
  uploads; see [Image uploads](#image-uploads-optional) below. Safe to
  leave as placeholders otherwise — everything else works fine, uploads
  will just fail with a clear "not configured" error.

Start the database and app:

```bash
npm run db:up      # starts Postgres in Docker, applies db/init.sql on first run
npm run dev
```

Site is at `http://localhost:3000`, admin portal at `/admin` (log in with
`ADMIN_PASSWORD`).

**Schema changes don't auto-apply** — `db/init.sql` only runs once against
an empty volume. If you pull changes that add tables/columns, apply them
by hand: `docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB>`.

## Image uploads (optional)

Board member and event photos upload to Cloudinary via a small, separately
deployed Cloudflare Worker (`workers/cloudinary-sign/`) that only signs
upload requests — it never touches Next.js's build or deploy.

```bash
cd workers/cloudinary-sign
wrangler login   # if not already

wrangler secret put WORKER_SHARED_SECRET --config ./wrangler.toml
wrangler secret put CLOUDINARY_API_KEY --config ./wrangler.toml
wrangler secret put CLOUDINARY_API_SECRET --config ./wrangler.toml
wrangler secret put CLOUDINARY_CLOUD_NAME --config ./wrangler.toml

wrangler deploy --config ./wrangler.toml
```

Always pass `--config ./wrangler.toml` explicitly. The repo also has an
unrelated, unused `wrangler.jsonc` at the root (an OpenNext/Cloudflare
full-site-deploy scaffold that isn't part of this project's deploy path);
without `--config`, `wrangler` auto-detects that one instead and silently
targets the wrong Worker.

`wrangler deploy` prints the Worker's URL. Put it in `.env`:

```
UPLOAD_SIGN_URL=https://<your-worker>.workers.dev/sign
WORKER_SHARED_SECRET=<same value you set with wrangler secret put>
```

Restart `npm run dev` after editing `.env`.

## Scripts

```bash
npm run dev           # dev server
npm run build          # production build
npm run lint            # ESLint (prompts for config on first run)
npm run format          # Prettier — no semicolons, double quotes
npm run db:up            # start local Postgres
npm run db:down          # stop it
npm run db:logs          # tail Postgres logs
```

## Deployment

The Next.js app deploys as a normal Next.js site (e.g. Vercel) — it does
**not** use the root `wrangler.jsonc`/OpenNext scaffold, which is unused.
Only `workers/cloudinary-sign` deploys via `wrangler`, as its own,
independent Worker.
