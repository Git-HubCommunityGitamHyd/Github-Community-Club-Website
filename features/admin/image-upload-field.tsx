"use client"

import { useId, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadToCloudinary } from "@/lib/cloudinary/upload"
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  type AdminUploadFolder,
} from "@/lib/cloudinary/folders"
import { cn } from "@/lib/utils"
import { useAdminUrl } from "@/features/admin/admin-base"

/** Checked before uploading, so a wrong file fails in a second, not after it uploads. */
function problemWith(file: File): string | null {
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
    return "Use a JPG, PNG or WebP image."
  }
  if (file.size > IMAGE_MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `That image is ${mb} MB. The limit is ${IMAGE_MAX_BYTES / 1024 / 1024} MB.`
  }
  return null
}

/**
 * Image upload, straight to Cloudinary into `folder`.
 *
 * Drop a file on it or choose one. The file type and size are checked before
 * anything is sent, and when an upload fails the reason is shown (uploads not
 * configured, Cloudinary rejecting the file) rather than a generic failure.
 *
 * `preview={false}` hides the built-in thumbnail for callers that draw their
 * own, larger preview of how the image will look on the site.
 *
 * `multiple` takes several files at once (a gallery). They upload one after
 * another and `onChange` is called once per finished file, so the caller
 * should append with a functional state update.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  hint,
  preview = true,
  multiple = false,
}: {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  folder: AdminUploadFolder
  /** One line under the drop zone: what makes a good image here. */
  hint?: string
  preview?: boolean
  multiple?: boolean
}) {
  const id = useId()
  const adminHref = useAdminUrl()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  async function handleFiles(list: FileList | null | undefined) {
    const files = [...(list ?? [])].slice(0, multiple ? undefined : 1)
    if (files.length === 0) return
    // Every file is checked before any is sent, so one wrong file in a
    // batch does not leave half the batch uploaded.
    for (const file of files) {
      const problem = problemWith(file)
      if (problem) {
        setError(files.length > 1 ? `${file.name}: ${problem}` : problem)
        return
      }
    }
    setBusy(true)
    setError(null)
    try {
      for (const [i, file] of files.entries()) {
        if (files.length > 1)
          setProgress(`Uploading ${i + 1} of ${files.length}…`)
        onChange(
          await uploadToCloudinary(file, adminHref("/api/admin/upload-sign"), {
            folder,
          }),
        )
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Upload failed. Try again.",
      )
    } finally {
      setBusy(false)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gh-muted"
      >
        {label}
      </label>
      <div className="flex items-stretch gap-3">
        {preview && value && (
          <Image
            src={value}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-md border border-gh-border object-cover"
          />
        )}
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault()
            if (!busy) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (!busy) handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex min-h-20 flex-1 cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-3 text-sm transition-colors",
            dragging
              ? "border-gh-accent bg-gh-accent/10 text-gh-text"
              : "border-gh-border text-gh-muted hover:border-gh-muted hover:text-gh-text",
            busy && "cursor-wait opacity-70",
          )}
        >
          {busy ? (
            <Loader2
              aria-hidden="true"
              className="h-5 w-5 shrink-0 animate-spin"
            />
          ) : (
            <ImagePlus aria-hidden="true" className="h-5 w-5 shrink-0" />
          )}
          <span>
            {busy
              ? (progress ?? "Uploading…")
              : multiple
                ? "Drop images here, or click to choose several"
                : value
                  ? "Drop a new image here, or click to replace it"
                  : "Drop an image here, or click to choose one"}
            <span className="block text-xs text-gh-muted">
              JPG, PNG or WebP, up to {IMAGE_MAX_BYTES / 1024 / 1024} MB
            </span>
          </span>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple={multiple}
            disabled={busy}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-center"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-sm text-gh-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
