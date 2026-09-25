import { NextResponse } from "next/server"
import {
  BUILD_UPLOAD_FOLDER,
  BUILD_UPLOAD_FORMATS,
} from "@/features/builds/keys"
import { requestSignature } from "@/lib/cloudinary/sign"

export const runtime = "nodejs"

/**
 * Upload signing for the public build form. Unlike /api/admin/upload-sign it
 * needs no session, so the signature is restricted: the Worker signs a fixed
 * folder and a fixed list of image formats, and Cloudinary rejects an upload
 * that changes either. The build API then only accepts image URLs in that
 * folder (lib/validation/build.ts).
 */
export async function POST() {
  let response: Response | null
  try {
    response = await requestSignature({
      folder: BUILD_UPLOAD_FOLDER,
      allowed_formats: BUILD_UPLOAD_FORMATS,
    })
  } catch {
    return NextResponse.json(
      { error: "Couldn't start the upload. Try again." },
      { status: 502 },
    )
  }
  if (!response) {
    return NextResponse.json(
      { error: "Image uploads are not set up yet" },
      { status: 503 },
    )
  }
  if (!response.ok) {
    return NextResponse.json(
      { error: "Couldn't start the upload. Try again." },
      { status: 502 },
    )
  }

  const payload = await response.json().catch(() => null)
  // A Worker deployed before public uploads existed ignores the body and
  // signs an unrestricted upload. Refuse that rather than hand it out.
  if (
    payload?.params?.folder !== BUILD_UPLOAD_FOLDER ||
    payload?.params?.allowed_formats !== BUILD_UPLOAD_FORMATS
  ) {
    return NextResponse.json(
      { error: "Image uploads are not set up yet" },
      { status: 503 },
    )
  }
  return NextResponse.json(payload)
}
