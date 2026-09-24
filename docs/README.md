# Documentation

This folder documents the GitHub Community GITAM website: what it is made
of, how the pieces talk to each other, where it runs, and how to look after
it. It is written for whoever maintains the site next, including someone who
joins the club years after the people who built it have graduated.

The same files are readable in three places:

- on GitHub, where the Mermaid diagrams render natively;
- in any editor, as plain Markdown;
- inside the CMS, on the **Docs** page, behind the admin login.

## Where to start

| If you want to…                                    | Read                                              |
| -------------------------------------------------- | ------------------------------------------------- |
| Understand what the site is and who it is for      | [Overview](./01-overview.md)                      |
| See how the system fits together                   | [Architecture](./02-architecture.md)              |
| Run it on your laptop                              | [Local development](./03-local-development.md)    |
| Ship a change to production                        | [Deployment](./04-deployment.md)                  |
| Understand or change the data                      | [Database](./05-database.md)                      |
| Understand the CMS, logins and the /admin decoy    | [CMS and security](./06-cms-and-security.md)      |
| Follow a proposal, build or application end to end | [Content workflows](./07-content-workflows.md)    |
| Upload or change images                            | [Media and uploads](./08-media-and-uploads.md)    |
| Change how the public site looks or moves          | [Frontend](./09-frontend.md)                      |
| Fix something, hand over, rotate a secret          | [Operations runbook](./10-operations-runbook.md)  |
| Ask a new member for their avatar                  | [Member avatar prompt](./member-avatar-prompt.md) |

## The short version

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind CSS 3).
- **Hosted on Cloudflare** as a single Worker, built with OpenNext
  (`@opennextjs/cloudflare`). Not Vercel.
- **Data in Cloudflare D1**, a managed SQLite database bound to the Worker.
- **Images in Cloudinary**, uploaded straight from the browser with a
  signature from a small second Worker that holds the Cloudinary secret.
- **An in-house CMS** for every piece of content, behind one shared password,
  served from a secret URL. `/admin` itself is a decoy.

## Other files worth knowing

| File                    | What it is                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| `README.md` (repo root) | The project's front page on GitHub                               |
| `CLAUDE.md`             | Rules and sharp edges for anyone (or any AI agent) editing code  |
| `TODO.md`               | Every phase of work so far, what was checked, what is still open |
| `notes.md`              | The reasoning behind decisions, phase by phase                   |
| `db/schema.sql`         | The full database schema                                         |
| `.env.example`          | Every setting the app reads, with a comment each                 |

## Keeping these docs true

Documentation that is wrong is worse than none. When you change how
something works, change the doc that describes it in the same pull request.
If you add a page to this folder, add it to the table above and to
`lib/docs/registry.ts` so it shows up in the CMS.
