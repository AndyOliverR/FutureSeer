import type { Metadata } from "next"
import { ToolSeoIntro } from "@/components/tools/ToolSeoIntro"
import { buildToolMetadata } from "@/lib/seo/toolIntros"

export const metadata: Metadata = buildToolMetadata("numerology")

export default function NumerologyToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSeoIntro slug="numerology" />
      {children}
    </>
  )
}
