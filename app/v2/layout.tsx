import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"

// Scoped to this subtree on purpose. tailwind.config.js puts these variables at
// the front of fontFamily.sans/mono with a var() fallback, so `/` — which never
// defines them — keeps rendering in exactly the stack it uses today.
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      {children}
    </div>
  )
}
