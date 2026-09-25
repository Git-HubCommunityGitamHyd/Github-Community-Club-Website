# Migrations

One-off SQL files that change an existing database, for changes
`db/schema.sql` cannot make (it only creates missing tables). A new column
goes in both places: the `CREATE TABLE` in `schema.sql`, for fresh
databases, and an `ALTER TABLE ... ADD COLUMN` file here, for existing ones.

- Name: `YYYY-MM-short-description.sql`, starting with a comment on what it
  does and why.
- Run locally: `npm run db:patch:local -- db/migrations/<file>.sql`
- Run on production before deploying code that needs it:
  `npm run db:patch:remote -- db/migrations/<file>.sql`
- Each file runs exactly once per database. Record production runs in
  `docs/05-database.md`, "Migration history".

Production was created fresh from `schema.sql` on 25 September 2026, so no
earlier file is needed.
