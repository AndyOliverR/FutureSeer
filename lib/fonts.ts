/**
 * PERFORMANCE ARCHITECTURE — Font loading
 * Self-hosted via next/font (no render-blocking Google Fonts @import).
 * Inter + Cinzel preload on every route; Cormorant is decorative (no preload).
 */
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// Cinzel: web headings ~400, mobile Material ~500. No weight 300.
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cinzel",
  display: "swap",
});

/** Decorative serif — used by .font-quote / sacred-body; not first-paint critical. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

export const fontClassNames = `${inter.variable} ${cinzel.variable} ${cormorant.variable}`;
