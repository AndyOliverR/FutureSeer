import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/privacy",
  title: "Privacy Policy | FutureSeer",
  description:
    "How FutureSeer collects, uses, and protects your personal data, mystical profile, and reading history.",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
