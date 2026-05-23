import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/terms",
  title: "Terms of Service | FutureSeer",
  description: "Terms of service for using FutureSeer and its mystical guidance tools.",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
