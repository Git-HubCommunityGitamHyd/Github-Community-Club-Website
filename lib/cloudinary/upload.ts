/**
 * Browser side of an upload: ask one of the app's sign routes for a
 * signature, then send the file straight to Cloudinary with it. Any extra
 * parameters the Worker signed (a folder, allowed formats) come back in
 * `params` and must be sent exactly as signed.
 */
type SignPayload = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  params?: Record<string, string>
}

export class UploadError extends Error {}

export async function uploadToCloudinary(
  file: File,
  signUrl = "/api/admin/upload-sign",
): Promise<string> {
  const signRes = await fetch(signUrl, { method: "POST" })
  if (!signRes.ok) {
    const body = await signRes.json().catch(() => null)
    throw new UploadError(body?.error ?? "Could not start the upload")
  }
  const sign: SignPayload = await signRes.json()

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", sign.apiKey)
  formData.append("timestamp", String(sign.timestamp))
  formData.append("signature", sign.signature)
  for (const [key, value] of Object.entries(sign.params ?? {})) {
    formData.append(key, value)
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData },
  )
  if (!uploadRes.ok) throw new UploadError("The upload didn't go through")
  const uploaded = await uploadRes.json()
  return uploaded.secure_url as string
}
