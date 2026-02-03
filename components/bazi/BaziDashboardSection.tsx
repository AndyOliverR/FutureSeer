"use client"

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'
import { m3Collapse, m3BouncySpring, m3SmoothEase, m3Elevation } from '@/lib/material3Animations'

export interface BaziDashboardSectionProps {
  title: string
  icon: ReactNode
  badge?: string
  defaultExpanded?: boolean
  children: ReactNode
  className?: string
  storageKey?: string // Optional key to persist expand/collapse state
}

/**
 * BaziDashboardSection - A collapsible section component for BaZi tool
 * Features devotionist amber/gold styling with glass morphism effects
 */
export function BaziDashboardSection({
  title,
  icon,
  badge,
  defaultExpanded = false,
  children,
  className = '',
  storageKey
}: BaziDashboardSectionProps) {
  // Initialize state from localStorage if storageKey is provided
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultExpanded
    
    try {
      const stored = localStorage.getItem(`bazi-section-${storageKey}`)
      return stored !== null ? JSON.parse(stored) : defaultExpanded
    } catch {
      return defaultExpanded
    }
  })

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`bazi-section-${storageKey}`, JSON.stringify(isExpanded))
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }, [isExpanded, storageKey])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={m3SmoothEase}
      className={className}
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={m3BouncySpring}
      >
        <Card 
          className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-300 shadow-lg hover:shadow-xl rounded-3xl transition-all duration-300 overflow-hidden"
          role="region"
          aria-expanded={isExpanded}
          aria-label={title}
        >
          {/* Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

          {/* Header */}
          <CardHeader
            className="bg-gradient-to-r from-amber-100 to-yellow-100 cursor-pointer select-none hover:from-amber-200 hover:to-yellow-200 transition-all duration-200 border-b border-amber-200"
            onClick={toggleExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleExpanded()
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-2 bg-amber-100 rounded-xl border-2 border-amber-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={m3BouncySpring}
                >
                  <div className="text-amber-700" aria-hidden="true">
                    {icon}
                  </div>
                </motion.div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-serif font-bold text-amber-900">
                    {title}
                  </h3>
                  {badge && (
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 px-3 py-1 text-xs font-semibold">
                      {badge}
                    </Badge>
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={m3BouncySpring}
                className="text-amber-700"
                aria-hidden="true"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </div>
          </CardHeader>

          {/* Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                variants={m3Collapse}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                style={{ overflow: 'hidden' }}
              >
                <CardContent className="p-6 bg-white/80">
                  {children}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  )
}
