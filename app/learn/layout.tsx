import type { Metadata } from "next"

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"

export const metadata: Metadata = {
  title: "Learn | Vastu, Astrology, Numerology & Divination Guides | FutureSeer",
  description:
    "Original guides on Vastu compasses, main entrances, lucky numbers and colours, multi-divination workflows, and how to use FutureSeer’s tools together—futureseer.app.",
  alternates: {
    canonical: `${site}/learn`,
  },
  openGraph: {
    title: "Learn | FutureSeer",
    description:
      "Educational articles on Vastu, astrology, numerology, and divination—built for seekers and search-friendly discovery.",
    url: `${site}/learn`,
    siteName: "FutureSeer",
    type: "website",
  },
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children
}
