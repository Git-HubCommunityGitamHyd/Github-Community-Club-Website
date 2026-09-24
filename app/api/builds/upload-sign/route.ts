import { NextResponse } from "next/server"
import {
  BUILD_UPLOAD_FOLDER,
  BUILD_UPLOAD_FORMATS,
} from "@/features/v2/builds/keys"

export const runtime = "nodejs"

/**
 * Upload signing for the public build form. Unlike /api/admin/upload-sign it
 * needs no session, so the signature is restricted: the Worker signs a fixed
 * folder and a fixed list of image formats, and Cloudinary rejects an upload
 * that changes either. The build API then only accepts image URLs in that
 * folder (lib/validation/build.ts).
 */
export async function POST() {
  const uploadSignUrl = process.env.UPLOAD_SIGN_URL
  const sharedSecret = process.env.WORKER_SHARED_SECRET
  if (!uploadSignUrl || !sharedSecret) {
    return NextResponse.json(
      { error: "Image uploads are not set up yet" },
      { status: 503 },
    )
  }

  const response = await fetch(uploadSignUrl, {
    method: "POST",
    headers: {
      "X-Worker-Secret": sharedSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folder: BUILD_UPLOAD_FOLDER,
      allowed_formats: BUILD_UPLOAD_FORMATS,
    }),
  })
  if (!response.ok) {
    return NextResponse.json(
      { error: "Couldn't start the upload. Try again." },
      { status: 502 },
    )
  }

  const payload = await response.json()
  // A Worker deployed before public uploads existed ignores the body and
  // signs an unrestricted upload. Refuse that rather than hand it out.
  if (payload?.params?.folder !== BUILD_UPLOAD_FOLDER) {
    return NextResponse.json(
      { error: "Image uploads are not set up yet" },
      { status: 503 },
    )
  }
  return NextResponse.json(payload)
}
