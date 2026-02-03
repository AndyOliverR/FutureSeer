"use client"

import { usePathname } from "next/navigation"
import { BackButton } from "@/components/navigation/BackButton"

export function ToolsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isToolsListing = pathname === "/tools"
  const showBackToTools = pathname?.startsWith("/tools") && !isToolsListing

  if (!showBackToTools) {
    return <>{children}</>
  }

  return (
    <>
      <div className="pt-1 px-4 sm:px-6">
        <BackButton href="/tools" label="Back to Tools" />
      </div>
      {children}
    </>
  )
}
