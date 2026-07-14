/**
 * PERFORMANCE ARCHITECTURE — Font loading
 * Self-hosted via next/font (no render-blocking Google Fonts @import).
 * Inter + Cinzel load on every route; Cormorant is available via CSS variable for quote/hero prose.
 */
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Cinzel has no weight 300 — only 400–900 (plus variable).
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

/** Decorative serif — used by .font-quote / sacred-body, not required for first paint */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const fontClassNames = `${inter.variable} ${cinzel.variable} ${cormorant.variable}`;
