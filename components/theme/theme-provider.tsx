"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
})

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function readTheme(): Theme {
  const saved = localStorage.getItem("theme")
  if (saved === "dark" || saved === "light") return saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getServerSnapshot(): Theme {
  return "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot)

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark"
    localStorage.setItem("theme", next)
    document.documentElement.classList.toggle("dark", next === "dark")
    emit()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
