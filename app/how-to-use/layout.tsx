import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/how-to-use",
  title: "How to Use FutureSeer",
  description:
    "Learn how to create your mystical profile, generate reports, and use Ask the Seer on FutureSeer.",
});

export default function HowToUseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
