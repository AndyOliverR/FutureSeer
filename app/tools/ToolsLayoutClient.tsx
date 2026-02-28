"use client"

import { usePathname } from "next/navigation"
import { BackButton } from "@/components/navigation/BackButton"
import { ASTROLOGY_TOOL_SLUGS, DIVINATION_TOOL_SLUGS, NUMEROLOGY_TOOL_SLUGS, READING_TOOL_SLUGS, CHINESE_TOOL_SLUGS, REMEDIES_TOOL_SLUGS, INDIAN_TOOL_SLUGS, ANALYSIS_TOOL_SLUGS, ENERGY_TOOL_SLUGS } from "@/lib/services/toolManager"

export function ToolsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isToolsListing = pathname === "/tools"
  const showBackToTools = pathname?.startsWith("/tools") && !isToolsListing

  if (!showBackToTools) {
    return <>{children}</>
  }

  const isWesternAstrologyAdvanced = pathname?.startsWith("/tools/western-astrology/advanced/")
  const pathSegment = pathname?.split("/").filter(Boolean)[1]
  const isAstrologyTool = Boolean(
    pathSegment &&
    (ASTROLOGY_TOOL_SLUGS.includes(pathSegment) ||
      ASTROLOGY_TOOL_SLUGS.some((slug) => slug.startsWith(pathSegment + "-") || slug === pathSegment))
  )
  const isDivinationTool = Boolean(
    pathSegment &&
    (DIVINATION_TOOL_SLUGS.includes(pathSegment) || pathSegment === 'iching')
  )
  const isNumerologyTool = Boolean(
    pathSegment && NUMEROLOGY_TOOL_SLUGS.includes(pathSegment)
  )
  const isReadingTool = Boolean(
    pathSegment && READING_TOOL_SLUGS.includes(pathSegment)
  )
  const isChineseTool = Boolean(
    pathSegment && CHINESE_TOOL_SLUGS.includes(pathSegment)
  )
  const isRemediesTool = Boolean(
    pathSegment && REMEDIES_TOOL_SLUGS.includes(pathSegment)
  )
  const isIndianTool = Boolean(
    pathSegment &&
    (INDIAN_TOOL_SLUGS.includes(pathSegment) ||
      (pathSegment === 'vedic' && INDIAN_TOOL_SLUGS.includes('vedic-astrology')))
  )
  const isAnalysisTool = Boolean(pathSegment && ANALYSIS_TOOL_SLUGS.includes(pathSegment))
  const isEnergyTool = Boolean(pathSegment && ENERGY_TOOL_SLUGS.includes(pathSegment))

  return (
    <>
      <div className="pt-1 px-4 sm:px-6">
        {isWesternAstrologyAdvanced ? (
          <BackButton href="/tools/western-astrology?tab=advanced" label="Back to Western Astrology" />
        ) : isAstrologyTool ? (
          <BackButton href="/tools?category=Astrology" label="Back to Astrology" />
        ) : isDivinationTool ? (
          <BackButton href="/tools?category=Divination" label="Back to Divination" />
        ) : isNumerologyTool ? (
          <BackButton href="/tools?category=Numerology" label="Back to Numbers" />
        ) : isReadingTool ? (
          <BackButton href="/tools?category=Reading" label="Back to Reading" />
        ) : isChineseTool ? (
          <BackButton href="/tools?category=Chinese" label="Back to Chinese" />
        ) : isRemediesTool ? (
          <BackButton href="/tools?category=Remedies" label="Back to Remedies" />
        ) : isIndianTool ? (
          <BackButton href="/tools?category=Indian" label="Back to Indian" />
        ) : isAnalysisTool ? (
          <BackButton href="/tools?category=Analysis" label="Back to Analysis" />
        ) : isEnergyTool ? (
          <BackButton href="/tools?category=Energy" label="Back to Energy" />
        ) : (
          <BackButton href="/tools" label="Back to Tools" />
        )}
      </div>
      {children}
    </>
  )
}
