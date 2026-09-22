import { getCloudflareContext } from "@opennextjs/cloudflare"

// D1 is a stateless per-call binding, not a persistent connection — unlike
// the old pg.Pool, there's nothing here that needs caching across Fast
// Refresh reloads.
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true })
  return env.DB
}
