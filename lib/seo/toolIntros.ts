import type { Metadata } from "next"

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"
const site = rawSite.replace("://www.", "://")

export const PRIORITY_TOOL_SLUGS = [
  "vastu",
  "vedic",
  "western-astrology",
  "tarot",
  "numerology",
  "feng-shui",
  "iching",
] as const

export type PriorityToolSlug = (typeof PRIORITY_TOOL_SLUGS)[number]

export type ToolSeoBlock = {
  slug: PriorityToolSlug
  path: string
  title: string
  description: string
  /** 1–2 short paragraphs for crawlable HTML (original copy). */
  introParagraphs: string[]
  /** Optional learn article slug to link. */
  learnSlug?: string
}

export const TOOL_SEO_BLOCKS: Record<PriorityToolSlug, ToolSeoBlock> = {
  vastu: {
    slug: "vastu",
    path: "/tools/vastu",
    title: "Vastu Shastra Tool | Compass, 16 Zones & AI Guidance | FutureSeer",
    description:
      "Explore Vastu for your home: device compass with a visual dial (4, 8, 16, 32, and 45-field precision), main entrance guidance, room placement, remedies, and Ask the Seer—all in one AI-powered platform at FutureSeer.",
    introParagraphs: [
      "Vastu Shastra maps directions, zones, and entrances to support harmony between your space and natural energies. FutureSeer combines traditional directional grids (16 zones, 32 padas, optional 45-field reference) with your profile so you can study facing, main door placement, and room use in one place.",
      "Use the live compass dial on supported devices, fill in your layout, then open Ask the Vastu Seer for questions grounded in your inputs. Personalized reports and chat stay behind your account—this page introduces what the tool does.",
    ],
    learnSlug: "vastu-research-and-traditional-practice",
  },
  vedic: {
    slug: "vedic",
    path: "/tools/vedic",
    title: "Vedic Astrology (Jyotish) | Birth Chart & AI | FutureSeer",
    description:
      "Sidereal Vedic astrology: birth chart, divisional charts, dasha, and AI-guided interpretation. Sign in for full personalized readings on futureseer.app.",
    introParagraphs: [
      "Vedic Astrology (Jyotish) uses sidereal positions, planetary periods (dasha), and divisional charts to describe timing and temperament. FutureSeer’s tool is built for serious study: generate charts from your birth data, explore key factors, and ask the Vedic Seer in plain language.",
      "Sign in and complete your profile to unlock stored reports and cross-tool context. The interactive experience is gated; this overview is public so seekers can find what the tool offers.",
    ],
    learnSlug: "divination-research-and-practitioner-perspectives",
  },
  "western-astrology": {
    slug: "western-astrology",
    path: "/tools/western-astrology",
    title: "Western Astrology | Tropical Chart & AI | FutureSeer",
    description:
      "Tropical Western astrology chart, houses, aspects, and AI-powered interpretation. FutureSeer—multi-divination on futureseer.app.",
    introParagraphs: [
      "Western astrology uses the tropical zodiac, houses, and planetary aspects to explore personality and life themes. FutureSeer computes your chart from birth time and place, then layers AI explanations you can refine with Ask the Western Seer.",
      "Personalized saved readings and Seer chat require an account; this introduction is indexable so new users can discover the product before signing up.",
    ],
    learnSlug: "divination-research-and-practitioner-perspectives",
  },
  tarot: {
    slug: "tarot",
    path: "/tools/tarot",
    title: "Tarot Reading | AI Interpretation | FutureSeer",
    description:
      "Draw and interpret Tarot spreads with AI assistance on FutureSeer. Part of a unified divination workspace at futureseer.app.",
    introParagraphs: [
      "Tarot uses symbolic cards and spreads to reflect situations and choices. FutureSeer’s Tarot experience supports guided draws and AI interpretation aligned with traditional card meanings—not generic horoscopes pasted onto the deck.",
      "Save history and deeper sessions after sign-in; this page describes the tool for discovery and search.",
    ],
    learnSlug: "tarot-psychology-research-perspectives",
  },
  numerology: {
    slug: "numerology",
    path: "/tools/numerology",
    title: "Numerology | Numbers, Name & Life Path | FutureSeer",
    description:
      "Chaldean and Pythagorean numerology, name and birth-date analysis, and AI on FutureSeer. Explore your numbers at futureseer.app.",
    introParagraphs: [
      "Numerology derives patterns from names and birth dates—life path, expression, and related numbers vary by system. FutureSeer exposes structured calculations and interpretations you can compare with astrology tools in the same app.",
      "Personalized storage and Ask the Seer use your profile; this overview is public for SEO and discovery.",
    ],
    learnSlug: "occult-ethics-grounding-and-boundaries",
  },
  "feng-shui": {
    slug: "feng-shui",
    path: "/tools/feng-shui",
    title: "Feng Shui | Bagua, Directions & AI | FutureSeer",
    description:
      "Feng Shui space analysis: bagua, directions, and AI guidance on FutureSeer. Distinct from Vastu—both available in one app.",
    introParagraphs: [
      "Feng Shui works with qi flow, five elements, and compass or form-school methods. FutureSeer offers a dedicated Feng Shui workflow separate from Indian Vastu so you can follow the tradition you prefer—or compare both.",
      "Full reports and personalized chat are for signed-in users; this page summarizes the tool for search engines and new visitors.",
    ],
    learnSlug: "occult-ethics-grounding-and-boundaries",
  },
  iching: {
    slug: "iching",
    path: "/tools/iching",
    title: "I Ching | Hexagrams & AI | FutureSeer",
    description:
      "Consult the I Ching (Yijing): hexagrams, changing lines, and AI commentary on FutureSeer—classical divination in a modern workspace.",
    introParagraphs: [
      "The I Ching is a classical Chinese divination system built from hexagrams and changing lines. FutureSeer’s tool respects traditional line texts while helping you apply a reading to your question with structured AI support.",
      "Sign in to keep a journal of casts; this introduction is crawlable for discovery.",
    ],
    learnSlug: "divination-research-and-practitioner-perspectives",
  },
}

export function buildToolMetadata(slug: PriorityToolSlug): Metadata {
  const b = TOOL_SEO_BLOCKS[slug]
  return {
    title: b.title,
    description: b.description,
    alternates: { canonical: `${site}${b.path}` },
    openGraph: {
      title: b.title.replace(" | FutureSeer", "") + " | FutureSeer",
      description: b.description,
      url: `${site}${b.path}`,
      siteName: "FutureSeer",
      type: "website",
    },
  }
}
