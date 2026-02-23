"use client"

import { Badge } from "@/components/ui/badge"
import { ToolSymbol } from "@/components/MysticalSymbol"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ToolPageHeaderProps {
  toolName: string
  toolSlug: string
  toolDescription?: string
  toolCategory?: string
  isPremium?: boolean
  isComing_soon?: boolean
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="mb-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Link
          href="/tools"
          className="p-2 -ml-2 rounded-full hover:bg-surface-container-low active:scale-90 transition-all text-amber-400"
          aria-label="Back to tools"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        {showIcon && (
          <div className="p-2 bg-surface-container-low rounded-2xl border border-outline-variant shadow-inner">
            <ToolSymbol
              toolName={toolSlug}
              size="sm"
              variant="default"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-white truncate leading-tight">
            {toolName}
          </h1>
          {toolCategory && (
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400/70 leading-none">
              {toolCategory}
            </p>
          )}
        </div>
      </div>
      
      {toolDescription && (
        <p className="text-sm text-surface-on-variant leading-relaxed font-normal px-1">
          {toolDescription}
        </p>
      )}

      {(isPremium || isComingSoon) && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          {isPremium && (
            <Badge className="bg-primary-container text-on-primary-container border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              ✨ Premium
            </Badge>
          )}
          {isComingSoon && (
            <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              🚧 Soon
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  )
}
