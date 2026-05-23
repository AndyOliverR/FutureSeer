import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/ask-the-seer",
  title: "Ask the Seer | FutureSeer",
  description: "Ask the Seer on FutureSeer.",
  noindex: true,
});

export default function AskTheSeerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
