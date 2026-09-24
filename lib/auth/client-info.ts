/**
 * Who sent a request, as far as the headers say. On Cloudflare the client IP
 * is `cf-connecting-ip`, set by the edge and not forgeable by the client;
 * `x-forwarded-for` is only a fallback for local dev.
 */
export function clientInfo(headers: Headers) {
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  return { ip, userAgent: headers.get("user-agent") ?? "" }
}
