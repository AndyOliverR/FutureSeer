import type { Metadata } from "next";

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app";
const site = rawSite.replace("://www.", "://");

export const metadata: Metadata = {
  title: "Install FutureSeer",
  description:
    "Install FutureSeer from your browser. The same web app works on phone, tablet, and desktop — no App Store or Play Store required.",
  alternates: {
    canonical: `${site}/mobile-waitlist`,
  },
  openGraph: {
    title: "Install FutureSeer",
    description:
      "Add FutureSeer to your home screen from the browser. Same app on iPhone, Android, and desktop.",
    url: `${site}/mobile-waitlist`,
    siteName: "FutureSeer",
    type: "website",
  },
};

export default function MobileWaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
