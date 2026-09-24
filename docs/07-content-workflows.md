# Content workflows

How each kind of content gets onto the site, from the person who creates it
to the page that shows it.

## Content the maintainers own

Board, events, journey, projects, members and teams are written entirely by
maintainers in the CMS. The pattern is the same for all of them:

```mermaid
sequenceDiagram
    autonumber
    participant M as Maintainer (CMS form)
    participant API as /ADMIN_PATH/api/KIND
    participant V as lib/validation/KIND.ts
    participant DB as lib/db/KIND.ts → D1
    participant Page as Public page

    M->>API: POST (new) or PATCH (edit), JSON
    API->>API: requireAdminApi()
    API->>V: validate
    V-->>M: 400 with field errors, shown next to each field
    V->>DB: insert or update
    API-->>M: 200, back to the list
    Page->>DB: next visitor's request reads the new row
```

There is no cache to clear and no rebuild. Every public page reads D1 on
each request, so a save is live on the next page load.

| Content  | Shows up on                                          | Notes                                                    |
| -------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Board    | Homepage "Board" section                             | Photo in Cloudinary `board/`; ring colour is a key       |
| Events   | Homepage "Events" section, event dialog              | Ordered photos, first is the cover, up to 12             |
| Journey  | Homepage timeline                                    | Icon is a key from `features/journey/icons.ts`           |
| Projects | Homepage "Projects", `/projects`, `/projects/[slug]` | Team credits come from Members; commit count from GitHub |
| Members  | `/members`, profile dialogs, project pages           | Avatar, not a photo; grouped by team                     |
| Teams    | `/members` groups                                    | Deleting a team keeps its members                        |

Project bodies use a tiny text format rather than Markdown: blank lines
separate paragraphs, `## ` starts a heading, lines starting `- ` make a list
(`features/projects/prose.tsx`). Everything renders as text, never HTML.

## Join applications

```mermaid
flowchart LR
    s[Student on the homepage<br/>Join section] -->|form| api[POST /api/applications]
    api -->|hidden field filled| fake[fake success, nothing saved]
    api -->|invalid| err[400, errors on the form]
    api -->|email already used| dup[409, already applied]
    api -->|ok| db[(applications)]
    db --> cms[CMS Applications screen]
    cms --> rec[Maintainers contact applicants<br/>for the recruitment round]
```

The form collects name, email, phone, branch, year, GitHub username
(optional) and why they want to join. The same section offers the WhatsApp
community group's QR code, which is open to everyone and needs no
application.

## Proposals (ideas for the club to build)

Any student can suggest a tool the club could build, at `/proposals/new`. The
form asks one question per screen and needs no account.

```mermaid
stateDiagram-v2
    [*] --> pending: submitted
    pending --> accepted: maintainer accepts
    pending --> declined: maintainer declines
    accepted --> building: work starts
    building --> built: shipped
    accepted --> declined
    declined --> accepted: reconsidered

    note right of pending: private
    note right of declined: private, never shown with a "no"
    note left of built: public on /proposals and the homepage
```

- A maintainer can set any status at any time; the diagram shows the usual
  path.
- `pending` and `declined` are private. `accepted`, `building` and `built`
  appear on `/proposals` and in the homepage "Ideas" section.
- The public page shows `public_name` (their first name by default,
  editable in the CMS), never the full name, phone or registration number.
- Maintainers can leave an `admin_note`; it is for maintainers and is not
  shown on the tracking page.

## Builds (students' own projects)

Students submit something they built at `/builds/submit`, with up to 6
screenshots.

```mermaid
stateDiagram-v2
    [*] --> pending: submitted with screenshots
    pending --> accepted: maintainer picks a month<br/>(and optionally a week)
    pending --> declined
    accepted --> declined
    declined --> accepted

    note right of accepted: public at /builds and /builds/[slug]
```

When accepting, the maintainer:

- puts it in a **month** (required), which groups it on `/builds`;
- may mark it as one of a **week's** builds (`week_of`, that week's Monday);
- checks the **slug** (its address, `/builds/<slug>`; `submit` and `track`
  are reserved);
- can edit the page text, credits (lead and teammates) and developer notes.

Saving fetches the repository's commit count straight away.

Screenshots are uploaded by the student's browser straight to Cloudinary,
into the `build-submissions` folder only. Declining a build does not delete
its images from Cloudinary (tracked in `TODO.md`).

## Track links

Students have no accounts, so each proposal and build gets a private status
link, shown once on the thank-you screen:

```mermaid
sequenceDiagram
    autonumber
    participant S as Student
    participant API as POST /api/proposals
    participant DB as D1
    participant T as /proposals/track/[token]

    API->>API: token = 24 random bytes, base64url (32 chars)
    API->>DB: store sha256(token) as track_hash
    API-->>S: thank-you screen with the link (only time it exists)
    S->>T: opens the link later
    T->>T: token has the right shape?
    T->>DB: find row where track_hash = sha256(token)
    T-->>S: title and a timeline of its status
```

- Only the hash is stored, so neither the CMS nor a backup can show a
  working link. If a student loses theirs, it cannot be recovered; a
  maintainer can tell them the status directly.
- 192 random bits cannot be guessed, so the page needs no password.
- The page shows the title and status only, nothing the student did not
  already know.

Code: `lib/tracking.ts`, `features/tracking/`, `app/*/track/[token]/`.

## Commit counts

Projects and builds with a GitHub repository show its commit count.

```mermaid
flowchart TD
    save[CMS saves a project or build] -->|now| fetch[GitHub API: 1 commit per page,<br/>read the last page number]
    view[Visitor opens the page] --> stale{count older than 24 h?}
    stale -->|no| show[show stored count]
    stale -->|yes| show2[show stored count] --> after["after() the response:<br/>fetch and store the new count"]
    fetch --> db[(commit_count, commits_synced_at)]
    after --> db
```

If GitHub is unreachable the old number stays and the time is still
updated, so a broken repository is retried daily, not on every view. A null
count hides the counter rather than showing zero.
