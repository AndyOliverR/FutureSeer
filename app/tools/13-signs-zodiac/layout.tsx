import type { Metadata } from "next"
import { buildToolPageMetadata } from "@/lib/seo/buildToolPageMetadata"

export const metadata: Metadata = buildToolPageMetadata("13-signs-zodiac")

export default function ToolSeoLayout({ children }: { children: React.ReactNode }) {
  return children
}
