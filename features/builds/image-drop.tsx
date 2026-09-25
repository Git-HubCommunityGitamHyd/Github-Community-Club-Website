"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Star, X } from "lucide-react"
import { uploadToCloudinary, UploadError } from "@/lib/cloudinary/upload"
import { BUILD_IMAGES_MAX } from "@/features/builds/keys"
import { cn } from "@/lib/utils"

const TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_BYTES = 8 * 1024 * 1024

/**
 * Screenshots for a build, uploaded straight to Cloudinary through the
 * restricted public signature (/api/builds/upload-sign). The first image is
 * the cover; the star on any other one moves it to the front.
 */
export function ImageDrop({
  value,
  onChange,
  error,
}: {
  value: string[]
  onChange: (images: string[]) => void
  error?: string
}) {
  const [uploading, setUploading] = useState(0)
  const [problem, setProblem] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pending = useRef(0)
  // The list as of the last upload, so parallel uploads append to each other
  // rather than each to a stale copy.
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])

  const room = BUILD_IMAGES_MAX - value.length - uploading

  async function add(files: File[]) {
    setProblem(null)
    const usable = files.filter((file) => {
      if (!TYPES.includes(file.type)) {
        setProblem("PNG, JPG or WebP only.")
        return false
      }
      if (file.size > MAX_BYTES) {
        setProblem("Each image has to be under 8 MB.")
        return false
      }
      return true
    })
    const available = BUILD_IMAGES_MAX - latest.current.length - pending.current
    const batch = usable.slice(0, Math.max(0, available))
    if (usable.length > batch.length) {
      setProblem(`Up to ${BUILD_IMAGES_MAX} images.`)
    }
    // Reserve the whole batch before the first await, including queued files.
    pending.current += batch.length
    setUploading(pending.current)
    if (inputRef.current) inputRef.current.value = ""
    for (const file of batch) {
      try {
        const url = await uploadToCloudinary(file, "/api/builds/upload-sign")
        latest.current = [...latest.current, url]
        onChange(latest.current)
      } catch (err) {
        setProblem(
          err instanceof UploadError ? err.message : "That upload failed.",
        )
      } finally {
        pending.current -= 1
        setUploading(pending.current)
      }
    }
  }

  function remove(src: string) {
    latest.current = latest.current.filter((s) => s !== src)
    onChange(latest.current)
  }

  function makeCover(src: string) {
    latest.current = [src, ...latest.current.filter((s) => s !== src)]
    onChange(latest.current)
  }

  const message = problem ?? error

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((src, i) => (
          <figure
            key={src}
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-xl border bg-gh-elevated",
              i === 0 ? "border-gh-accent/70" : "border-gh-border",
            )}
          >
            <Image
              src={src}
              alt={i === 0 ? "Cover image" : `Image ${i + 1}`}
              fill
              sizes="200px"
              className="object-cover"
            />
            {i === 0 && (
              <figcaption className="absolute left-2 top-2 rounded-full bg-gh-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-gh-deep">
                Cover
              </figcaption>
            )}
            <div className="absolute right-2 top-2 flex gap-1.5">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(src)}
                  aria-label={`Make image ${i + 1} the cover`}
                  className="flex size-7 items-center justify-center rounded-full bg-gh-bg/85 text-gh-text backdrop-blur transition-colors hover:text-gh-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
                >
                  <Star aria-hidden="true" className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(src)}
                aria-label={`Remove image ${i + 1}`}
                className="flex size-7 items-center justify-center rounded-full bg-gh-bg/85 text-gh-text backdrop-blur transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          </figure>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex aspect-[4/3] animate-pulse items-center justify-center rounded-xl border border-gh-border bg-gh-elevated font-mono text-xs text-gh-muted"
          >
            Uploading
          </div>
        ))}

        {room > 0 && (
          <label
            data-autofocus
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              void add([...e.dataTransfer.files])
            }}
            className={cn(
              "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent",
              dragging
                ? "border-gh-accent bg-gh-accent/10 text-gh-text"
                : "border-gh-border text-gh-muted hover:border-gh-muted hover:text-gh-text",
            )}
          >
            <ImagePlus aria-hidden="true" className="size-6" />
            <span>
              {value.length === 0 ? "Add screenshots" : "Add another"}
              <span className="mt-0.5 block font-mono text-[11px] text-gh-muted">
                or drop them here
              </span>
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => void add([...(e.target.files ?? [])])}
            />
          </label>
        )}
      </div>
      <p
        role={message ? "alert" : undefined}
        className={cn(
          "mt-3 min-h-5 text-sm",
          message ? "text-red-400" : "text-gh-muted",
        )}
      >
        {message ??
          `${value.length} of ${BUILD_IMAGES_MAX}. PNG, JPG or WebP, up to 8 MB each.`}
      </p>
    </div>
  )
}
