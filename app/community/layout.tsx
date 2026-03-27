import type { Metadata } from "next"

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"

export const metadata: Metadata = {
  title: "Community | FutureSeer",
  description:
    "Browse public mystical community discussions on FutureSeer. Sign in for members, voting, and full features.",
  alternates: {
    canonical: `${site}/community/attribution`,
  },
  openGraph: {
    title: "Community | FutureSeer",
    description:
      "Discuss astrology, tarot, numerology, and more. Guests can read and post with verification.",
    url: `${site}/community/attribution`,
    siteName: "FutureSeer",
    type: "website",
  },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}
