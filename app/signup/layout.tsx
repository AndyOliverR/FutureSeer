import type { Metadata } from "next";
import { buildAuthPageMetadata } from "@/lib/seo/buildPageMetadata";

export const metadata: Metadata = buildAuthPageMetadata("signup");

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
