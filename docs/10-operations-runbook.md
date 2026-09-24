# Operations runbook

Step-by-step answers for the things that come up. Commands assume you are in
the repository root and logged in with `npx wrangler login` to the Cloudflare
account that owns the site.

## Handing the site over

When the people who run the site change (usually each academic year):

- [ ] Add the new maintainers to the **GitHub** organisation with write
      access to this repository.
- [ ] Add them to the **Cloudflare** account (dashboard, Manage account,
      Members) with a role that can deploy Workers and use D1.
- [ ] Add them to **Cloudinary** (Settings, Users).
- [ ] Add their emails to the **Cloudflare Access** policy for the CMS, and
      remove anyone leaving.
- [ ] **Rotate** `ADMIN_PASSWORD`, `SESSION_SECRET` and `ADMIN_PATH` (below)
      so people who left cannot get in, and tell the new maintainers the new
      CMS address and password privately.
- [ ] Walk through these docs together, then `TODO.md` "Open items".

## Add or remove a CMS maintainer

1. Cloudflare dashboard, Zero Trust, Access, Applications, the CMS
   application, its policy: add or remove the email.
2. If someone is removed, rotate the password and session secret too.

## Rotate the CMS password

```bash
npx wrangler secret put ADMIN_PASSWORD
```

Takes effect on the next request. Existing sessions stay valid until they
expire (at most 8 hours); rotate the session secret as well to end them now.

## Log everyone out

```bash
npx wrangler secret put SESSION_SECRET     # paste: openssl rand -hex 32
```

Every existing session cookie stops verifying immediately.

## Move the CMS to a new secret address

Do this if the address leaks (posted in a group, in a screenshot, in a
commit):

```bash
openssl rand -hex 12                       # the new value
npx wrangler secret put ADMIN_PATH
```

Then update the Cloudflare Access application's path, and tell the
maintainers the new address. The old address immediately stops working, and
old session cookies are not sent to the new path, so everyone logs in again.

## Someone is locked out of the CMS

A lockout lasts 15 minutes from the fifth wrong password on that network.
The Security page lists locked IPs. Options: wait, or switch networks
(mobile data). To clear it at once:

```bash
npx wrangler d1 execute github-community-db --remote --command \
  "DELETE FROM auth_events WHERE kind = 'login_failed' AND ip = 'THE.IP.HERE'"
```

## A student lost their tracking link

It cannot be recovered; only its hash is stored. Find their submission in
the CMS (Proposals or Builds, by name or title) and tell them its status.

## Remove a submission or a person's data

Someone asks for their application, proposal or build to be deleted: delete
it in the CMS (Proposals and Builds have a delete button). Applications have
no delete button yet; remove one with:

```bash
npx wrangler d1 execute github-community-db --remote --command \
  "DELETE FROM applications WHERE email = 'their@email'"
```

Then delete their images from Cloudinary's Media Library if any.

## Take a backup

```bash
npx wrangler d1 export github-community-db --remote --output backup-$(date +%F).sql
```

The file holds personal data. Keep it somewhere private, never in the
repository, and delete old ones.

## Restore the database to an earlier moment

```bash
npx wrangler d1 time-travel info github-community-db
npx wrangler d1 time-travel restore github-community-db --timestamp=2026-09-20T10:00:00Z
```

This rewinds **every table**, including submissions that arrived since. Take
an export first.

## The site shows an error

1. Watch the live logs while reproducing it:
   `npx wrangler tail github-community-website`.
2. Or open the Cloudflare dashboard, the Worker, Logs.
3. If the last deploy caused it, roll back (dashboard, Worker,
   Deployments, previous version, Rollback), then fix calmly.

## Common problems

| Symptom                                         | Likely cause and fix                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Every image on a page is broken (400)           | The image host is not in `next.config.js` `images.remotePatterns`          |
| Upload says uploads are not configured          | `UPLOAD_SIGN_URL` or `WORKER_SHARED_SECRET` missing on the site            |
| Upload fails with unauthorised                  | `WORKER_SHARED_SECRET` differs between the site and the signing Worker     |
| `/<ADMIN_PATH>` is a 404                        | `ADMIN_PATH` unset or not 16 to 64 of `a-z 0-9 -` on the Worker            |
| CMS link from a chat app shows the login page   | Expected (`SameSite=Strict`); reload                                       |
| A page shows old content forever                | The route lost `export const dynamic = "force-dynamic"`                    |
| An admin API call 404s                          | Code used a bare `/api/admin/...` URL instead of the `adminUrl` helper     |
| A CMS button leads to the fake login            | Code used a bare `/admin/...` URL instead of the `adminUrl` helper         |
| `no such column` after a deploy                 | A migration was not run on production; run it                              |
| `duplicate column name` running a migration     | It already ran on that database; nothing to do                             |
| Something sticky stopped sticking               | An ancestor has `overflow-x-hidden`; use `overflow-x-clip`                 |
| Tailwind classes have no effect in a new folder | The folder is not in `tailwind.config.js` `content`                        |
| Hydration error only for some visitors          | Rendering depends on a browser-only value on first render (see Frontend)   |
| Commit counts never appear                      | Repository URL not on github.com, or GitHub rate limit; set `GITHUB_TOKEN` |

## Costs and limits

Everything runs on free tiers at the club's scale: Cloudflare Workers (100k
requests a day), D1 (5 GB, generous daily reads and writes), and Cloudinary's
free plan. If the site grows past that, the Cloudflare dashboard shows usage
per product. Check Cloudinary storage occasionally; unused images are the
most likely thing to grow.
