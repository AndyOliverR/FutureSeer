import type { Metadata } from "next";

const rawSite = process.env.NEXT_PUBLIC_APP_URL ?? "https://futureseer.app";
const site = rawSite.replace("://www.", "://");

export const metadata: Metadata = {
  title: "Daily Cosmic Guidance | FutureSeer",
  description:
    "Receive your daily AI-generated cosmic guidance with symbols, themes, and remedies based on your FutureSeer profile.",
  alternates: {
    canonical: `${site}/daily`,
  },
  openGraph: {
    title: "Daily Cosmic Guidance | FutureSeer",
    description:
      "Daily mystical guidance and remedies generated for your FutureSeer journey.",
    url: `${site}/daily`,
    siteName: "FutureSeer",
    type: "website",
  },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
