import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { IMAGE_FORMATS, isAdminUploadFolder } from "@/lib/cloudinary/folders"

export const runtime = "nodejs"

/**
 * Upload signing for the CMS. The browser names the folder (board, members,
 * ...); only known folders are signed, and the Worker signs the folder and
 * the allowed formats with the timestamp, so Cloudinary rejects an upload
 * that changes either.
 */
export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const uploadSignUrl = process.env.UPLOAD_SIGN_URL
  const sharedSecret = process.env.WORKER_SHARED_SECRET
  if (!uploadSignUrl || !sharedSecret) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not set up: UPLOAD_SIGN_URL and WORKER_SHARED_SECRET are missing",
      },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    folder?: unknown
  } | null
  if (!isAdminUploadFolder(body?.folder)) {
    return NextResponse.json(
      { error: "Unknown upload folder" },
      { status: 400 },
    )
  }

  let response: Response
  try {
    response = await fetch(uploadSignUrl, {
      method: "POST",
      headers: {
        "X-Worker-Secret": sharedSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder: body.folder,
        allowed_formats: IMAGE_FORMATS,
      }),
    })
  } catch {
    return NextResponse.json(
      { error: "The upload signing service is unreachable" },
      { status: 502 },
    )
  }
  if (!response.ok) {
    return NextResponse.json(
      { error: "The upload signing service refused the request" },
      { status: 502 },
    )
  }

  return NextResponse.json(await response.json())
}
