/**
 * The Cloudinary folders admin uploads go into, one per kind of content, so
 * the media library stays browsable and a folder can be cleaned up on its
 * own. /api/admin/upload-sign only signs these; anything else is refused
 * rather than landing in the library root.
 *
 * Public build submissions use their own folder (BUILD_UPLOAD_FOLDER in
 * features/builds/keys.ts), signed by a separate, sessionless route.
 */
export const ADMIN_UPLOAD_FOLDERS = [
  "board",
  "members",
  "projects",
  "events",
  "builds",
] as const

export type AdminUploadFolder = (typeof ADMIN_UPLOAD_FOLDERS)[number]

export function isAdminUploadFolder(
  value: unknown,
): value is AdminUploadFolder {
  return (
    typeof value === "string" &&
    (ADMIN_UPLOAD_FOLDERS as readonly string[]).includes(value)
  )
}

/** What the upload field accepts and Cloudinary is asked to allow. */
export const IMAGE_FORMATS = "jpg,jpeg,png,webp"
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp"
/** Checked in the browser before uploading; Cloudinary's own free-plan cap is 10 MB. */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024
