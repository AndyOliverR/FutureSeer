import type { MetadataRoute } from "next"

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"

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
