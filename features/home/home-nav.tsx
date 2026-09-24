"use client"

import type { RefObject } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Menu, X } from "lucide-react"
import { NAV_ITEMS } from "@/features/home/content"

export function HomeNav({
  activeSection,
  isMenuOpen,
  onToggleMenu,
  onScrollTo,
  navSlotRef,
}: {
  activeSection: string
  isMenuOpen: boolean
  onToggleMenu: () => void
  onScrollTo: (sectionId: string) => void
  navSlotRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <motion.nav
      className="fixed top-0 z-40 w-full border-b border-gh-border bg-gh-bg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Github className="h-7 w-7" />
            <span className="text-base font-extrabold tracking-tight sm:text-[17px]">
              GitHub Community{" "}
              <span className="font-semibold text-gh-muted">GITAM</span>
            </span>
          </div>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => onScrollTo(item.toLowerCase())}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  activeSection === item.toLowerCase()
                    ? "text-gh-text"
                    : "text-gh-muted hover:text-gh-text"
                }`}
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => onScrollTo("join")}
              className="rounded-md bg-gh-accent px-4 py-2 font-mono text-[13px] font-semibold text-gh-bg hover:opacity-90"
            >
              Join →
            </button>
            {/* Reserves the docked spot — the real mascot floats above it
                as a fixed-position element (see GhMascotDock below). */}
            <div ref={navSlotRef} className="h-16 w-20" />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gh-border text-gh-muted"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="overflow-hidden border-t border-gh-border md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col px-4 py-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => onScrollTo(item.toLowerCase())}
                  className={`py-3 text-left text-base font-medium ${
                    activeSection === item.toLowerCase()
                      ? "text-gh-text"
                      : "text-gh-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => onScrollTo("join")}
                className="mt-3 rounded-md bg-gh-accent px-4 py-3 text-center font-mono text-sm font-semibold text-gh-bg"
              >
                Join Community →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
