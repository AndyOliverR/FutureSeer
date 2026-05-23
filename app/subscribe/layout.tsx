import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/subscribe",
  title: "Subscribe | FutureSeer",
  description: "Subscribe to FutureSeer for full access to mystical tools and AI guidance.",
});

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
