import type { MetadataRoute } from "next"

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"
const site = rawSite.replace("://www.", "://")

/** Private app surfaces — never open to AI or general crawlers. */
const PRIVATE_DISALLOW = [
  "/admin/",
  "/api/",
  "/notes/",
  "/profile-setup",
  "/settings/",
  "/support/tickets",
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_DISALLOW],
      },
      // Citation-friendly AI crawlers: same allow as humans, private paths still blocked.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "CCBot",
        ],
        allow: "/",
        disallow: [...PRIVATE_DISALLOW],
      },
      // Aggressive scrapers remain blocked sitewide.
      {
        userAgent: ["Bytespider", "Diffbot"],
        disallow: ["/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  }
}
