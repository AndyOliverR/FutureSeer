import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MagicalButtonProps {
  href: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
}

export function MagicalButton({ href, children, variant = "primary", className }: MagicalButtonProps) {
  const baseClasses =
    "px-8 py-4 rounded-full font-light text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"

  const variants = {
    primary:
      "bg-gradient-to-r from-gold to-yellow-400 text-purple-950 hover:from-yellow-400 hover:to-gold shadow-gold/25",
    secondary:
      "border border-purple-400 text-purple-200 hover:bg-purple-800/30 hover:border-purple-300 backdrop-blur-sm",
  }

  return (
    <Link href={href} className={cn(baseClasses, variants[variant], className)}>
      {children}
    </Link>
  )
}
