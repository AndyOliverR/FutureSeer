import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/seer",
  title: "Ask the Seer | FutureSeer",
  description: "Unified Ask the Seer chat across all your FutureSeer tools.",
  noindex: true,
});

export default function SeerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
