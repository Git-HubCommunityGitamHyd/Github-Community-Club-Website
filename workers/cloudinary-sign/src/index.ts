export interface Env {
  WORKER_SHARED_SECRET: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CLOUDINARY_CLOUD_NAME: string
}

async function sha1Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message)
  const digest = await crypto.subtle.digest("SHA-1", data)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

// Only ever called server-to-server from /api/admin/upload-sign and
// /api/builds/upload-sign, never
// directly from the browser — the admin session cookie is scoped to the
// Next.js app's own domain and wouldn't reach a Worker on a different one.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== "/sign" || request.method !== "POST") {
      return new Response("Not found", { status: 404 })
    }

    const provided = request.headers.get("X-Worker-Secret") ?? ""
    if (!timingSafeEqual(provided, env.WORKER_SHARED_SECRET)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Optional restrictions, sent by the Next.js app (never the browser) for
    // uploads that come from the public build form: a folder the upload must
    // land in and the formats Cloudinary may accept. Signed alongside the
    // timestamp, so the browser has to send exactly these values or the
    // upload is rejected. Admin uploads send no body and sign only the
    // timestamp, as before.
    const body = (await request.json().catch(() => null)) as {
      folder?: unknown
      allowed_formats?: unknown
    } | null
    const params: Record<string, string> = {}
    if (
      typeof body?.folder === "string" &&
      /^[a-z0-9-]{1,40}$/.test(body.folder)
    ) {
      params.folder = body.folder
    }
    if (
      typeof body?.allowed_formats === "string" &&
      /^[a-z]+(,[a-z]+)*$/.test(body.allowed_formats)
    ) {
      params.allowed_formats = body.allowed_formats
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const signed: Record<string, string> = {
      ...params,
      timestamp: String(timestamp),
    }
    // Cloudinary signs the parameters sorted by name, joined as a query string.
    const toSign = Object.keys(signed)
      .sort()
      .map((key) => `${key}=${signed[key]}`)
      .join("&")
    const signature = await sha1Hex(`${toSign}${env.CLOUDINARY_API_SECRET}`)

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        params,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  },
}
