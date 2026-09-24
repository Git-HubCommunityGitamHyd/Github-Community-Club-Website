"use client"

import Image from "next/image"
import { useState, useCallback } from "react"

interface AutoScrollGalleryProps {
  images: string[]
  title: string
}

function GalleryImage({
  src,
  alt,
  onLoad,
}: {
  src: string
  alt: string
  onLoad: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative h-48 w-64 flex-shrink-0">
      {!loaded && <div className="skeleton absolute inset-0 rounded-lg" />}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={512}
        height={384}
        style={{ objectFit: "cover" }}
        className={`h-full w-full rounded-lg transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        quality={95}
        sizes="(max-width: 768px) 256px, 512px"
        unoptimized={false}
        onLoad={() => {
          setLoaded(true)
          onLoad()
        }}
      />
    </div>
  )
}

export function AutoScrollGallery({ images, title }: AutoScrollGalleryProps) {
  const [loadedCount, setLoadedCount] = useState(0)
  const allLoaded = loadedCount >= images.length

  const handleImageLoad = useCallback(() => {
    setLoadedCount((prev) => prev + 1)
  }, [])

  if (!images || images.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-gh-elevated">
        <p className="text-lg text-gh-muted">No Images Available</p>
      </div>
    )
  }

  return (
    <div className="inline-flex w-full flex-nowrap overflow-hidden">
      {/* First list — drives load tracking */}
      <ul
        className={`flex items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-4 ${allLoaded ? "animate-infinite-scroll" : ""}`}
      >
        {images.map((image, index) => (
          <li key={index}>
            <GalleryImage
              src={image}
              alt={`${title} - Image ${index + 1}`}
              onLoad={handleImageLoad}
            />
          </li>
        ))}
      </ul>

      {/* Duplicate list for seamless loop — only mounted after images are ready */}
      {allLoaded && (
        <ul
          className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-4"
          aria-hidden="true"
        >
          {images.map((image, index) => (
            <li key={index}>
              <div className="relative h-48 w-64 flex-shrink-0">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${title} - Image ${index + 1}`}
                  width={512}
                  height={384}
                  style={{ objectFit: "cover" }}
                  className="h-full w-full rounded-lg"
                  quality={95}
                  sizes="(max-width: 768px) 256px, 512px"
                  unoptimized={false}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
