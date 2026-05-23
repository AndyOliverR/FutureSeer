import type { Metadata } from "next";
import { buildAuthPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildAuthPageMetadata("signin");

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
