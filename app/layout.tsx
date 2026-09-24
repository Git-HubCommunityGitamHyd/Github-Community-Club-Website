import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { MascotEasterEgg } from "@/components/mascot/mascot-easter-egg"

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
    // No `suppressHydrationWarning` and no anti-FOUC script: both existed to
    // cover a theme class written to <html> before hydration. There is one
    // theme now, so the server and client markup already agree.
    // data-scroll-behavior: globals.css makes <html> scroll smoothly, which
    // is right for in-page anchors but also animated every route change: Next
    // resets the scroll to the top on navigation, and a smooth reset from far
    // down the homepage played as the new page scrolling up from the bottom.
    // With this attribute Next switches it to `auto` for its own navigation
    // scroll and back afterwards.
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {/* The easter egg stays global: it is one click listener and does
            nothing until the mascot is clicked. The glow that used to sit
            here ran a measuring loop on every frame of every page, /admin
            included; each homepage now owns its own. */}
        <MascotEasterEgg />
        {children}
      </body>
    </html>
  )
}
