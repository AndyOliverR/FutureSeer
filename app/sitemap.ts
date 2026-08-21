import type { MetadataRoute } from "next"
import { LEARN_SLUGS } from "@/app/learn/learnArticles"
import { SEO_LOCALES, localeSegment, normalizeSeoBaseUrl } from "@/lib/seo/locales"

const site = normalizeSeoBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app")

/**
 * Static tool routes with a real page (excludes dynamic /tools/[slug] and
 * /tools/western-astrology/advanced/[slug]). Keeps sitemap aligned with app routes for discovery.
 */
const TOOL_PATHS = [
  "/tools/13-signs-zodiac",
  "/tools/akashic-records",
  "/tools/angel-numbers",
  "/tools/astrology",
  "/tools/astrocartography",
  "/tools/astroscribe",
  "/tools/bazi",
  "/tools/bibliomancy",
  "/tools/daily-decisions",
  "/tools/dream-symbols",
  "/tools/electional-astrology",
  "/tools/energy-healing",
  "/tools/esoteric-astrology",
  "/tools/face-reading",
  "/tools/feng-shui",
  "/tools/financial-astrology",
  "/tools/fixed-star-astrology",
  "/tools/geomancy",
  "/tools/hellenistic-astrology",
  "/tools/hermetic-astrology",
  "/tools/horary-astrology",
  "/tools/human-design",
  "/tools/iching",
  "/tools/iztro",
  "/tools/kabbalistic-astrology",
  "/tools/kabbalistic-numerology",
  "/tools/kerykeion",
  "/tools/kp-astrology",
  "/tools/lenormand",
  "/tools/lunar-astrology",
  "/tools/medical-astrology",
  "/tools/mundane-astrology",
  "/tools/name-analysis",
  "/tools/navaratna-planetary-stones",
  "/tools/numerology",
  "/tools/ogham",
  "/tools/palmistry",
  "/tools/pendulum",
  "/tools/psychological-astrology",
  "/tools/runes",
  "/tools/scrying",
  "/tools/shamanic-astrology",
  "/tools/sortilege",
  "/tools/synastry",
  "/tools/tarot",
  "/tools/trichakra-method",
  "/tools/vastu",
  "/tools/vastu/compass",
  "/tools/vastu/compass/8",
  "/tools/vastu/compass/16",
  "/tools/vastu/compass/32",
  "/tools/vastu/compass/45",
  "/tools/vedic",
  "/tools/western-astrology",
  "/tools/ziwei-dou-shu",
] as const

const STATIC_PATHS = [
  "/",
  "/about",
  "/catalog",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund-policy",
  "/shipping-policy",
  "/data-deletion",
  "/how-to-use",
  "/subscribe",
  "/daily",
  "/remedies",
  "/tools",
  "/learn",
  "/calculators/life-path",
  "/calculators/angel-numbers",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date()

  const seen = new Set<string>()
  const createEntry = (
    path: string,
    changeFrequency: "weekly" | "monthly",
    priority: number,
  ): MetadataRoute.Sitemap[number] | null => {
    const url = `${site}${path}`
    if (seen.has(url)) return null
    seen.add(url)
    return { url, lastModified: lastMod, changeFrequency, priority }
  }

  const staticEntries: MetadataRoute.Sitemap = [...STATIC_PATHS, ...TOOL_PATHS]
    .map((path) => createEntry(path, path === "/" ? "weekly" : "monthly", path === "/" ? 1 : 0.7))
    .filter((entry): entry is MetadataRoute.Sitemap[number] => Boolean(entry))

  const learnEntries: MetadataRoute.Sitemap = LEARN_SLUGS.map((slug) => ({
    url: `${site}/learn/${slug}`,
    lastModified: lastMod,
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }))

  const localizedLandingEntries: MetadataRoute.Sitemap = SEO_LOCALES.map((locale) =>
    createEntry(`/${localeSegment(locale)}`, "weekly", 0.85),
  ).filter((entry): entry is MetadataRoute.Sitemap[number] => Boolean(entry))

  return [
    ...staticEntries,
    ...learnEntries
      .map((entry) => (seen.has(entry.url) ? null : (seen.add(entry.url), entry)))
      .filter((entry): entry is MetadataRoute.Sitemap[number] => Boolean(entry)),
    ...localizedLandingEntries,
  ]
}
