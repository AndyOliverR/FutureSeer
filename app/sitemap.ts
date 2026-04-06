import type { MetadataRoute } from "next"
import { LEARN_SLUGS } from "@/app/learn/learnArticles"

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"
const site = rawSite.replace("://www.", "://")

/** High-value tool paths for discovery (subset of /tools/*). */
const TOOL_PATHS = [
  "/tools/vastu",
  "/tools/vastu/compass",
  "/tools/vastu/compass/8",
  "/tools/vastu/compass/16",
  "/tools/vastu/compass/32",
  "/tools/vastu/compass/45",
  "/tools/feng-shui",
  "/tools/vedic",
  "/tools/western-astrology",
  "/tools/tarot",
  "/tools/numerology",
  "/tools/iching",
  "/tools/palmistry",
  "/tools/bazi",
  "/tools/astrocartography",
  "/tools/kp-astrology",
  "/tools/horary-astrology",
  "/tools/synastry",
  "/tools/angel-numbers",
  "/tools/dream-symbols",
  "/tools/human-design",
  "/tools/lenormand",
  "/tools/runes",
  "/tools/medical-astrology",
  "/tools/mundane-astrology",
] as const

const STATIC_PATHS = [
  "/",
  "/about",
  "/community/attribution",
  "/contact",
  "/pricing",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
  "/refund-policy",
  "/shipping-policy",
  "/data-deletion",
  "/how-to-use",
  "/subscribe",
  "/signin",
  "/signup",
  "/seer",
  "/ask-the-seer",
  "/ask-vedic-seer",
  "/daily",
  "/remedies",
  "/tools",
  "/learn",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date()

  const staticEntries: MetadataRoute.Sitemap = [...STATIC_PATHS, ...TOOL_PATHS].map((path) => ({
    url: `${site}${path}`,
    lastModified: lastMod,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : path.startsWith("/learn") ? 0.75 : 0.7,
  }))

  const learnEntries: MetadataRoute.Sitemap = LEARN_SLUGS.map((slug) => ({
    url: `${site}/learn/${slug}`,
    lastModified: lastMod,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }))

  return [...staticEntries, ...learnEntries]
}
