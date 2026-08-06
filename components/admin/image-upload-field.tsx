"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type SignPayload = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
}

async function uploadToCloudinary(file: File): Promise<string> {
  const signRes = await fetch("/api/admin/upload-sign", { method: "POST" })
  if (!signRes.ok) throw new Error("Could not sign upload")
  const sign: SignPayload = await signRes.json()

  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", sign.apiKey)
  formData.append("timestamp", String(sign.timestamp))
  formData.append("signature", sign.signature)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData },
  )
  if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed")
  const uploaded = await uploadRes.json()
  return uploaded.secure_url as string
}

interface ImageUploadFieldProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
}

export function ImageUploadField({
  label,
  value,
  onChange,
}: ImageUploadFieldProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
    } catch {
      setError("Upload failed. Try again.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gh-muted">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value && (
          <Image
            src={value}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded object-cover"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
          className="text-sm text-gray-600 dark:text-gh-muted"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        )}
      </div>
      {busy && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gh-muted">
          Uploading…
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
