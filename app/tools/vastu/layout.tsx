import type { Metadata } from "next"
import { ToolSeoIntro } from "@/components/tools/ToolSeoIntro"
import { buildToolMetadata } from "@/lib/seo/toolIntros"

export const metadata: Metadata = buildToolMetadata("vastu")

export default function VastuToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSeoIntro slug="vastu" />
      {children}
    </>
  )
}
