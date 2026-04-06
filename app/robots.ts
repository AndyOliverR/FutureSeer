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
    ],
    sitemap: `${site}/sitemap.xml`,
  }
}
