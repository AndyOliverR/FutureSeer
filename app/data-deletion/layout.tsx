import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/data-deletion",
  title: "Data Deletion | FutureSeer",
  description: "Request deletion of your FutureSeer account data and stored readings.",
});

export default function DataDeletionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
