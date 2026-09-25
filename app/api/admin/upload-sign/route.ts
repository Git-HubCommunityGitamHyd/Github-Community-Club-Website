import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth/require-admin"
import { IMAGE_FORMATS, isAdminUploadFolder } from "@/lib/cloudinary/folders"
import { requestSignature } from "@/lib/cloudinary/sign"

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

  const body = (await request.json().catch(() => null)) as {
    folder?: unknown
  } | null
  if (!isAdminUploadFolder(body?.folder)) {
    return NextResponse.json(
      { error: "Unknown upload folder" },
      { status: 400 },
    )
  }

  let response: Response | null
  try {
    response = await requestSignature({
      folder: body.folder,
      allowed_formats: IMAGE_FORMATS,
    })
  } catch {
    return NextResponse.json(
      { error: "The upload signing service is unreachable" },
      { status: 502 },
    )
  }
  if (!response) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not set up: WORKER_SHARED_SECRET or the signing Worker is missing",
      },
      { status: 503 },
    )
  }
  if (!response.ok) {
    return NextResponse.json(
      { error: "The upload signing service refused the request" },
      { status: 502 },
    )
  }

  const payload = await response.json().catch(() => null)
  if (
    payload?.params?.folder !== body.folder ||
    payload?.params?.allowed_formats !== IMAGE_FORMATS
  ) {
    return NextResponse.json(
      { error: "The upload signing service returned an invalid signature" },
      { status: 502 },
    )
  }
  return NextResponse.json(payload)
}
