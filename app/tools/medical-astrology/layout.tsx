import type { Metadata } from "next"
import { buildToolPageMetadata } from "@/lib/seo/buildToolPageMetadata"

export const metadata: Metadata = buildToolPageMetadata("medical-astrology")

export default function ToolSeoLayout({ children }: { children: React.ReactNode }) {
  return children
}
