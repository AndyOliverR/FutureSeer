"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface BackButtonProps {
  href: string
  label?: string
  className?: string
  variant?: "default" | "minimal"
}

export function BackButton({ 
  href, 
  label = "Back", 
  className = "",
  variant = "default"
}: BackButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 text-[var(--m3-primary)] hover:text-[var(--m3-primary)]/80 transition-colors group focus-visible:outline-2 focus-visible:outline-[var(--m3-primary)] focus-visible:outline-offset-2 rounded-md m3-transition-standard"
  
  const variantClasses = variant === "minimal" 
    ? "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
    : "text-amber-200 hover:text-amber-300"

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-label={`Navigate back to ${label.toLowerCase()}`}
    >
      <motion.div
        whileHover={{ x: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <ArrowLeft className="w-4 h-4" />
      </motion.div>
      <span className="m3-label-medium">{label}</span>
    </Link>
  )
}
