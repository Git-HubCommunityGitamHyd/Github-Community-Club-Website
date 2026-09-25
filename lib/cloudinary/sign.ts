import { getCloudflareContext } from "@opennextjs/cloudflare"

/**
 * Asks the signing Worker (workers/cloudinary-sign) for an upload signature.
 *
 * In production it goes through the SIGN_WORKER service binding, not the
 * Worker's workers.dev URL: a Worker fetching another Worker's workers.dev
 * URL in the same Cloudflare account is blocked (loopback protection), so a
 * plain fetch never arrives. `next dev` has no running signer to bind to, so
 * there it falls back to UPLOAD_SIGN_URL.
 *
 * Returns null when uploads are not configured. Throws when the signer
 * cannot be reached.
 */
export async function requestSignature(body: {
  folder: string
  allowed_formats: string
}): Promise<Response | null> {
  const sharedSecret = process.env.WORKER_SHARED_SECRET
  if (!sharedSecret) return null

  const init: RequestInit = {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: {
      "X-Worker-Secret": sharedSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }

  if (process.env.NODE_ENV === "production") {
    const { env } = await getCloudflareContext({ async: true })
    if (env.SIGN_WORKER) {
      return env.SIGN_WORKER.fetch("https://sign.internal/sign", init)
    }
  }

  const url = process.env.UPLOAD_SIGN_URL
  if (!url) return null
  return fetch(url, init)
}
