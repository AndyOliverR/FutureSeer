import type { MetadataRoute } from "next"

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"
const site = rawSite.replace("://www.", "://")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/notes/",
          "/profile-setup",
          "/settings/",
          "/support/tickets",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Bytespider",
          "Diffbot",
        ],
        disallow: ["/", "/api/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  }
}
