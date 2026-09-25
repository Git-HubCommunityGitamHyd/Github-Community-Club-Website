// Runs a command with the local .env files moved out of the way, then puts
// them back (also on failure or Ctrl-C).
//
// Why: `opennextjs-cloudflare build` copies every .env file it finds into
// the Worker bundle as fallback values for process.env. A deploy from a
// laptop would ship that laptop's ADMIN_PASSWORD, SESSION_SECRET and
// ADMIN_PATH inside the production Worker, and they would silently apply if
// a production secret were ever missing. Production values belong in
// `wrangler secret put` only.
//
// Usage: node scripts/without-local-env.mjs <command> [args...]
import { spawnSync } from "node:child_process"
import { existsSync, readdirSync, renameSync } from "node:fs"

const SUFFIX = ".moved-aside-for-build"

const moved = readdirSync(".")
  .filter((f) => /^\.env(\..+)?$/.test(f) && f !== ".env.example")
  .filter((f) => !f.endsWith(SUFFIX))

function restore() {
  for (const f of moved) {
    if (existsSync(f + SUFFIX)) renameSync(f + SUFFIX, f)
  }
}

for (const f of moved) renameSync(f, f + SUFFIX)
process.on("SIGINT", () => {
  restore()
  process.exit(130)
})

let status = 1
try {
  const [cmd, ...args] = process.argv.slice(2)
  if (moved.length) console.log(`Building without ${moved.join(", ")}`)
  status = spawnSync(cmd, args, { stdio: "inherit", shell: true }).status ?? 1
} finally {
  restore()
}
process.exit(status)
