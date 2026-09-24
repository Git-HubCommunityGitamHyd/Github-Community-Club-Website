/**
 * An image URL the site can render: an https Cloudinary delivery URL.
 * next/image only optimises hosts listed in next.config.js, so a URL from
 * anywhere else would 400 on the page; checking here turns that into a form
 * error instead.
 *
 * `folder`, when given, must appear in the path (public build submissions
 * must come from their restricted folder).
 */
export function isCloudinaryImage(raw: string, folder?: string): boolean {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== "https:") return false
    if (parsed.hostname !== "res.cloudinary.com") return false
    if (!parsed.pathname.includes("/image/upload/")) return false
    return !folder || parsed.pathname.includes(`/${folder}/`)
  } catch {
    return false
  }
}
