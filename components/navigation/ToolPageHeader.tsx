"use client"

import { Badge } from "@/components/ui/badge"
import { ToolSymbol } from "@/components/MysticalSymbol"
import { motion } from "framer-motion"

interface ToolPageHeaderProps {
  toolName: string
  toolSlug: string
  toolDescription?: string
  toolCategory?: string
  isPremium?: boolean
  isComingSoon?: boolean
  showIcon?: boolean
}

export function ToolPageHeader({
  toolName,
  toolSlug,
  toolDescription,
  toolCategory,
  isPremium = false,
  isComingSoon = false,
  showIcon = true
}: ToolPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4 mb-4">
        {showIcon && (
          <ToolSymbol
            toolName={toolSlug}
            size="lg"
            variant="glow"
            animated={true}
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-amber-400 mb-2 font-serif">
            {toolName}
          </h1>
          {toolDescription && (
            <p className="text-[var(--m3-on-surface-variant)] text-lg">
              {toolDescription}
            </p>
          )}
        </div>
      </div>
      
      {(isPremium || isComingSoon || toolCategory) && (
        <div className="flex items-center gap-4 flex-wrap">
          {isPremium && (
            <Badge variant="default" className="bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]">
              ✨ Premium
            </Badge>
          )}
          {isComingSoon && (
            <Badge variant="outline" className="text-amber-400 border-amber-400">
              Coming Soon
            </Badge>
          )}
          {toolCategory && (
            <Badge variant="outline" className="text-[var(--m3-on-surface-variant)]">
              {toolCategory}
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  )
}
