"use client"

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface DashboardSectionProps {
  title: string
  icon: ReactNode
  badge?: string
  defaultExpanded?: boolean
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'
  children: ReactNode
  className?: string
  storageKey?: string // Optional key to persist expand/collapse state
}

const colorSchemes = {
  amber: {
    gradient: 'from-amber-50 to-yellow-50',
    border: 'border-amber-300',
    hoverBorder: 'hover:border-amber-400',
    headerBg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
    iconColor: 'text-amber-700',
    titleColor: 'text-amber-900',
    accentBar: 'bg-amber-400'
  },
  blue: {
    gradient: 'from-blue-50 to-cyan-50',
    border: 'border-blue-300',
    hoverBorder: 'hover:border-blue-400',
    headerBg: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    iconColor: 'text-blue-700',
    titleColor: 'text-blue-900',
    accentBar: 'bg-blue-400'
  },
  purple: {
    gradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-300',
    hoverBorder: 'hover:border-purple-400',
    headerBg: 'bg-gradient-to-r from-purple-100 to-pink-100',
    iconColor: 'text-purple-700',
    titleColor: 'text-purple-900',
    accentBar: 'bg-purple-400'
  },
  pink: {
    gradient: 'from-pink-50 to-rose-50',
    border: 'border-pink-300',
    hoverBorder: 'hover:border-pink-400',
    headerBg: 'bg-gradient-to-r from-pink-100 to-rose-100',
    iconColor: 'text-pink-700',
    titleColor: 'text-pink-900',
    accentBar: 'bg-pink-400'
  },
  green: {
    gradient: 'from-green-50 to-teal-50',
    border: 'border-green-300',
    hoverBorder: 'hover:border-green-400',
    headerBg: 'bg-gradient-to-r from-green-100 to-teal-100',
    iconColor: 'text-green-700',
    titleColor: 'text-green-900',
    accentBar: 'bg-green-400'
  },
  orange: {
    gradient: 'from-orange-50 to-amber-50',
    border: 'border-orange-300',
    hoverBorder: 'hover:border-orange-400',
    headerBg: 'bg-gradient-to-r from-orange-100 to-amber-100',
    iconColor: 'text-orange-700',
    titleColor: 'text-orange-900',
    accentBar: 'bg-orange-400'
  },
  cyan: {
    gradient: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-300',
    hoverBorder: 'hover:border-cyan-400',
    headerBg: 'bg-gradient-to-r from-cyan-100 to-blue-100',
    iconColor: 'text-cyan-700',
    titleColor: 'text-cyan-900',
    accentBar: 'bg-cyan-400'
  }
}

export function DashboardSection({
  title,
  icon,
  badge,
  defaultExpanded = false,
  colorScheme = 'amber',
  children,
  className = '',
  storageKey
}: DashboardSectionProps) {
  const colors = colorSchemes[colorScheme]
  
  // Initialize state from localStorage if storageKey is provided
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultExpanded
    
    try {
      const stored = localStorage.getItem(`dashboard-section-${storageKey}`)
      return stored !== null ? JSON.parse(stored) : defaultExpanded
    } catch {
      return defaultExpanded
    }
  })

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dashboard-section-${storageKey}`, JSON.stringify(isExpanded))
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
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className={`border-2 ${colors.border} ${colors.hoverBorder} shadow-lg rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden`}>
        {/* Accent Bar */}
        <div className={`h-1 ${colors.accentBar}`} />

        {/* Header */}
        <CardHeader
          className={`${colors.headerBg} cursor-pointer select-none px-3 py-3 sm:p-6`}
          onClick={toggleExpanded}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-controls={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleExpanded()
            }
          }}
        >
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
              {/* Icon */}
              <div className={`${colors.iconColor} flex-shrink-0`}>
                {icon}
              </div>

              {/* Title */}
              <h3 className={`${colors.titleColor} text-lg sm:text-xl font-bold min-w-0`}>
                {title}
              </h3>

              {/* Badge */}
              {badge && (
                <Badge variant="secondary" className="ml-0 sm:ml-2 text-xs sm:text-sm">
                  {badge}
                </Badge>
              )}
            </div>

            {/* Expand/Collapse Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={colors.iconColor}
            >
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          </div>
        </CardHeader>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              id={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <CardContent className={`bg-gradient-to-br ${colors.gradient} p-3 sm:p-6`}>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
