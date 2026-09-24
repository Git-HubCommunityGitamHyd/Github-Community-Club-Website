"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DialogShell } from "@/features/v2/dialog-shell"

/**
 * Every screenshot after the cover, as a grid; any of them opens a viewer
 * with the whole set, arrow keys and buttons to step through. The cover is
 * the Brief's picture already, so it starts the viewer's set but not the grid.
 */
export function BuildGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const step = useCallback(
    (by: number) =>
      setOpen((i) =>
        i === null ? i : (i + by + images.length) % images.length,
      ),
    [images.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, step])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {images.map((src, i) =>
          i === 0 ? null : (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open image ${i + 1} of ${images.length}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-gh-border bg-gh-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg active:scale-[0.99]"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 380px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </button>
          ),
        )}
      </div>

      <DialogShell
        open={open !== null}
        onClose={() => setOpen(null)}
        labelledBy="gallery-title"
        bleed
        panelClassName="max-w-5xl"
      >
        {open !== null && (
          <div>
            <h2 id="gallery-title" className="sr-only">
              {title}, image {open + 1} of {images.length}
            </h2>
            <div className="relative aspect-[16/10] w-full bg-gh-deep">
              <Image
                src={images[open]}
                alt={`${title}, image ${open + 1} of ${images.length}`}
                fill
                sizes="(max-width: 1100px) 100vw, 1024px"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-gh-border px-4 py-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="flex size-9 items-center justify-center rounded-full text-gh-muted transition hover:bg-gh-elevated hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <span className="font-mono text-xs tabular-nums text-gh-muted">
                {open + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="flex size-9 items-center justify-center rounded-full text-gh-muted transition hover:bg-gh-elevated hover:text-gh-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        )}
      </DialogShell>
    </>
  )
}
