"use client"

import { ExternalLink } from "lucide-react"

interface AffiliateLinkProps {
  href: string
  children?: React.ReactNode
  label?: string
  className?: string
}

/**
 * Reusable affiliate link - opens in new tab, nofollow for SEO.
 * Use next to product recommendations (crystals, gems, etc.)
 */
export function AffiliateLink({ href, children, label = "See more", className = "" }: AffiliateLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 hover:underline text-sm font-medium transition-colors ${className}`}
    >
      {children ?? label}
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
    </a>
  )
}
