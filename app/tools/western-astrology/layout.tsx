import type { Metadata } from "next"
import { ToolSeoIntro } from "@/components/tools/ToolSeoIntro"
import { buildToolMetadata } from "@/lib/seo/toolIntros"

export const metadata: Metadata = buildToolMetadata("western-astrology")

export default function WesternAstrologyToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSeoIntro slug="western-astrology" />
      {children}
    </>
  )
}
