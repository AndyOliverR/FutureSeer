import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/remedies",
  title: "Remedies | FutureSeer",
  description: "Explore traditional remedies and guidance across FutureSeer divination systems.",
});

export default function RemediesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
