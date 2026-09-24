const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Geist is loaded by app/v2/layout.tsx and the variables are defined on
        // that subtree only, so `/` keeps rendering in the stack it uses today.
        //
        // The fallback INSIDE var() is load-bearing, not belt-and-braces: an
        // undefined custom property makes the whole font-family declaration
        // invalid at computed-value time. CSS does not skip to the next family
        // in the list — it drops the declaration entirely, and an inherited
        // property then resolves to the browser default (a serif). The fallback
        // keeps the declaration valid wherever the variable is absent.
        sans: [
          "var(--font-geist-sans, ui-sans-serif)",
          ...defaultTheme.fontFamily.sans,
        ],
        mono: [
          "var(--font-geist-mono, ui-monospace)",
          ...defaultTheme.fontFamily.mono,
        ],
      },
      animation: {
        "infinite-scroll": "infinite-scroll 25s linear infinite",
      },
      keyframes: {
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        gh: {
          // GitHub's deepest canvas value. Used where a surface has to sit
          // below the page itself (the footer) — a tinted near-black that
          // belongs to this palette, rather than a pure #000 that reads as
          // a hole punched in the page.
          deep: "#010409",
          bg: "#0d1117",
          surface: "#161b22",
          elevated: "#21262d",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#8b949e",
          // One accent, site-wide.
          accent: "#3fb950",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
