import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/contact",
  title: "Contact | FutureSeer",
  description: "Contact FutureSeer for support, privacy requests, and general inquiries.",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
