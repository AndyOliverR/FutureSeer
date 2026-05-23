import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/ask-vedic-seer",
  title: "Ask the Vedic Seer | FutureSeer",
  description: "Vedic astrology Ask the Seer on FutureSeer.",
  noindex: true,
});

export default function AskVedicSeerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
