# Overview

## What this is

The public website of **GitHub Community GITAM**, the GitHub-focused
student club at GITAM University, Hyderabad, together with the content
management system (CMS) the club's maintainers use to keep it current.

The site has three jobs:

1. **Tell students what the club is and does**: who is on the board, what
   events have run, what the club has built, what joining involves.
2. **Collect things from students**: applications to join, ideas for tools
   the club could build (proposals), and projects students built themselves
   (builds).
3. **Let the maintainers run all of it** without touching code: every list
   on the site is a database table edited through the CMS.

## Two things with one name

Keep these apart in code and in copy. They are different:

- The **community group** is a public WhatsApp group any GITAM student can
  join, with no application. The site links to it with a QR code.
- The **club** is smaller. Membership goes through recruitment rounds with
  an interview. The join form on the homepage is the start of that process.
  Experience is not what the interview filters on.

## Who uses it

| Who          | What they do                                                                  |
| ------------ | ----------------------------------------------------------------------------- |
| Any visitor  | Reads the homepage, members, projects, proposals and builds pages             |
| A student    | Applies to join, proposes an idea, submits a build, checks its status by link |
| A maintainer | Logs into the CMS, edits content, reviews submissions, reads the security log |
| A developer  | Changes the code, runs migrations, deploys                                    |

Students never have accounts. A student who submits a proposal or a build
gets a private link that shows its status; that link is the only thing that
identifies them (see [Content workflows](./07-content-workflows.md)).

## The pages

| URL                             | What it shows                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `/`                             | The homepage: hero, about, journey, board, events, projects, ideas, builds, benefits, join |
| `/members`                      | Every member, grouped by team, with avatars and profiles                                   |
| `/projects`, `/projects/[slug]` | What the club builds, one page per project                                                 |
| `/proposals`                    | Ideas students sent in that the club accepted                                              |
| `/proposals/new`                | A one-question-at-a-time form for proposing an idea                                        |
| `/proposals/track/[token]`      | A submitter's private status page                                                          |
| `/builds`, `/builds/[slug]`     | Students' own builds the club featured, by month                                           |
| `/builds/submit`                | The form for submitting a build                                                            |
| `/builds/track/[token]`         | A submitter's private status page                                                          |
| `/<ADMIN_PATH>/…`               | The CMS (secret URL, password protected)                                                   |
| `/admin/…`                      | A decoy login that logs whoever tries it                                                   |

## Glossary

| Term               | Meaning                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| **CMS**            | The admin screens under `app/admin/(dashboard)/`, where content is edited                                      |
| **D1**             | Cloudflare's hosted SQLite database. The site's only database                                                  |
| **Worker**         | A Cloudflare serverless function. The whole site runs as one                                                   |
| **OpenNext**       | The adapter (`@opennextjs/cloudflare`) that turns a Next.js build into a Worker                                |
| **Binding**        | How a Worker reaches a Cloudflare resource, e.g. `env.DB` for the database                                     |
| **Cloudinary**     | The image host. Every photo on the site lives there                                                            |
| **Signing Worker** | `workers/cloudinary-sign`, a separate Worker that signs uploads so the Cloudinary secret never reaches the app |
| **ADMIN_PATH**     | The secret first URL segment the CMS is served under                                                           |
| **Honeypot**       | The decoy at `/admin`, and also the hidden field that catches bots on public forms                             |
| **Proposal**       | An idea for something the club could build, sent in by any student                                             |
| **Build**          | Something a student built themselves and submitted to be featured                                              |
| **Track link**     | The private status link a proposal or build submitter receives                                                 |
| **Key**            | A short fixed string stored for a choice (a status, an icon, a colour) instead of markup                       |
