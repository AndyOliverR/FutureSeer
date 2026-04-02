import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

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
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        // Material 3 Color Mapping
        primary: {
          DEFAULT: "var(--m3-primary)",
          foreground: "var(--m3-on-primary)",
          container: "var(--m3-primary-container)",
          "on-container": "var(--m3-on-primary-container)",
        },
        secondary: {
          DEFAULT: "rgb(226 232 240)",
          foreground: "rgb(15 23 42)",
          container: "rgb(241 245 249)",
          "on-container": "rgb(15 23 42)",
        },
        tertiary: {
          DEFAULT: "var(--m3-tertiary)",
          foreground: "var(--m3-on-tertiary)",
          container: "var(--m3-tertiary-container)",
          "on-container": "var(--m3-on-tertiary-container)",
        },
        surface: {
          DEFAULT: "var(--m3-surface)",
          bright: "var(--m3-surface-bright)",
          dim: "var(--m3-surface-dim)",
          container: {
            lowest: "var(--m3-surface-container-lowest)",
            low: "var(--m3-surface-container-low)",
            DEFAULT: "var(--m3-surface-container)",
            high: "var(--m3-surface-container-high)",
            highest: "var(--m3-surface-container-highest)",
          },
          on: {
            DEFAULT: "var(--m3-on-surface)",
            variant: "var(--m3-on-surface-variant)",
          }
        },
        outline: {
          DEFAULT: "var(--m3-outline)",
          variant: "var(--m3-outline-variant)",
        },
        // Maintain existing mappings for Shadcn compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "var(--m3-surface-container)",
          foreground: "var(--m3-on-surface)",
        },
        popover: {
          DEFAULT: "var(--m3-surface-container-high)",
          foreground: "var(--m3-on-surface)",
        },
        muted: {
          DEFAULT: "var(--m3-surface-container-low)",
          foreground: "var(--m3-on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--m3-primary-container)",
          foreground: "var(--m3-on-primary-container)",
        },
        destructive: {
          DEFAULT: "rgb(220 38 38)",
          foreground: "#ffffff",
        },
        border: "var(--m3-outline-variant)",
        input: "var(--m3-outline-variant)",
        ring: "var(--m3-primary)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "28px", // Material 3 Extra Large
        "2xl": "32px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Cinzel", "serif"],
        'sacred-heading': ["Cinzel", "serif"],
        'sacred-body': ["Cormorant Garamond", "serif"],
        quote: ["Didot", "Didot LT STD", "Bodoni MT", "Cormorant Garamond", "Georgia", "serif"],
        // Konsta UI theme fonts (required by konsta/react/theme.css)
        ios: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "SF UI Text", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        material: ["Roboto", "system-ui", "Noto Sans", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
