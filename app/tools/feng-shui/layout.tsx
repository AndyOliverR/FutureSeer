import type { Metadata } from "next"
import { ToolSeoIntro } from "@/components/tools/ToolSeoIntro"
import { buildToolMetadata } from "@/lib/seo/toolIntros"

export const metadata: Metadata = buildToolMetadata("feng-shui")

export default function FengShuiToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolSeoIntro slug="feng-shui" />
      {children}
    </>
  )
}
