import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  safelist: [
    "fixed",
    "inset-0",
    "z-[10000]",
    "z-[10001]",
    "z-[2147483646]",
    "min-w-[40px]",
    "min-h-[40px]",
    "min-w-[44px]",
    "min-h-[44px]",
    "w-[calc(100vw-32px)]",
    "max-w-[90vw]",
    "max-h-[min(90dvh,90vh)]",
  ],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* Breakpoints: single source for responsive layout (see docs/LAYOUT.md) */
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        gold: "#fbbf24",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        serif: ["var(--font-cormorant)", "Times New Roman", "serif"],
        heading: ["Cinzel", "serif"],
        'sacred-heading': ["Cinzel", "serif"],
        'sacred-body': ["Cormorant Garamond", "serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      minHeight: {
        screen: "100vh",
        svh: "100svh",
      },
      height: {
        svh: "100svh",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
