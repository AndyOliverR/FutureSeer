import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/shipping-policy",
  title: "Shipping Policy | FutureSeer",
  description: "Shipping policy for FutureSeer physical products, if applicable.",
});

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
