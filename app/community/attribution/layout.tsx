import type { Metadata } from "next"

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app"

/** Primary indexable community URL (list + guest read/post). */
export const metadata: Metadata = {
  title: "Community Discussions | FutureSeer",
  description:
    "Read and join discussions on astrology, tarot, numerology, and occult practice. Guests may post with reCAPTCHA; sign in for the full community.",
  alternates: {
    canonical: `${site}/community/attribution`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Community Discussions | FutureSeer",
    description:
      "Public threads and limited guest posting—personalized features after sign-in.",
    url: `${site}/community/attribution`,
    siteName: "FutureSeer",
    type: "website",
  },
}

export default function CommunityAttributionLayout({ children }: { children: React.ReactNode }) {
  return children
}
