import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/pricing",
  title: "Pricing | FutureSeer",
  description:
    "FutureSeer pricing and plans for AI-powered astrology, tarot, numerology, and unified mystical insights.",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
