import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/refund-policy",
  title: "Refund Policy | FutureSeer",
  description: "Refund policy for FutureSeer subscriptions and purchases.",
});

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
