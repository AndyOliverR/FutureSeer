import type { Metadata } from "next"
import { ToolSeoIntro } from "@/components/tools/ToolSeoIntro"
import { buildToolMetadata } from "@/lib/seo/toolIntros"

export const metadata: Metadata = buildToolMetadata("vedic")

export default function VedicToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSeoIntro slug="vedic" />
      {children}
    </>
  )
}
