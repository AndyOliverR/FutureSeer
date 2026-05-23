import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/disclaimer",
  title: "Disclaimer | FutureSeer",
  description: "Legal disclaimer for FutureSeer mystical and divination content.",
});

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
