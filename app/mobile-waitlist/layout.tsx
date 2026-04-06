import type { Metadata } from "next";

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app";
const site = rawSite.replace("://www.", "://");

export const metadata: Metadata = {
  title: "FutureSeer Mobile Apps Waitlist",
  description:
    "Join the iOS and Android app waitlist. Use FutureSeer on desktop or mobile web now while native apps are prepared for launch.",
  alternates: {
    canonical: `${site}/mobile-waitlist`,
  },
  openGraph: {
    title: "FutureSeer Mobile Apps Waitlist",
    description:
      "Desktop offers the best detailed reading experience today. Mobile apps are coming soon based on demand.",
    url: `${site}/mobile-waitlist`,
    siteName: "FutureSeer",
    type: "website",
  },
};

export default function MobileWaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
