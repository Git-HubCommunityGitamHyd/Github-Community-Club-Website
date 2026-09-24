import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

// tailwind.config.js puts these variables at the front of fontFamily.sans and
// fontFamily.mono, so every page (admin included) renders in Geist.
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

export const metadata: Metadata = {
  title: "GitHub Community GITAM",
  description:
    "Empowering developers, fostering collaboration, and building the future of open source at GITAM University",
  icons: {
    icon: [
      { url: "/github-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/github-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/github-logo.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/github-logo.png",
    shortcut: "/github-logo.png",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior: globals.css makes <html> scroll smoothly, which
    // is right for in-page anchors but also animated every route change: Next
    // resets the scroll to the top on navigation, and a smooth reset from far
    // down the homepage played as the new page scrolling up from the bottom.
    // With this attribute Next switches it to `auto` for its own navigation
    // scroll and back afterwards.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
