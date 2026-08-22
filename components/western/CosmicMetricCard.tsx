"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type CosmicMetricColorScheme = 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan' | 'gradient'

export interface CosmicMetricCardProps {
  icon: ReactNode
  label: string
  value: string
  subtitle?: string
  subValue?: string
  tooltip?: string
  badge?: string
  colorScheme?: CosmicMetricColorScheme
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
}

const sizeConfig = {
  small: {
    iconSize: 'w-10 h-10',
    valueSize: 'text-lg',
    labelSize: 'text-xs',
    subtitleSize: 'text-xs'
  },
  medium: {
    iconSize: 'w-16 h-16',
    valueSize: 'text-2xl',
    labelSize: 'text-sm',
    subtitleSize: 'text-xs'
  },
  large: {
    iconSize: 'w-20 h-20',
    valueSize: 'text-3xl',
    labelSize: 'text-base',
    subtitleSize: 'text-sm'
  }
}

const palettes: Record<CosmicMetricColorScheme, { card: string; icon: string; value: string; badge: string }> = {
  amber: {
    card: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-900',
    badge: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  blue: {
    card: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-900',
    badge: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  cyan: {
    card: 'border-cyan-200 bg-cyan-50 text-cyan-900',
    icon: 'bg-cyan-100 text-cyan-700',
    value: 'text-cyan-900',
    badge: 'border-cyan-200 bg-cyan-100 text-cyan-800',
  },
  purple: {
    card: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    icon: 'bg-indigo-100 text-indigo-700',
    value: 'text-indigo-900',
    badge: 'border-indigo-200 bg-indigo-100 text-indigo-800',
  },
  green: {
    card: 'border-teal-200 bg-teal-50 text-teal-900',
    icon: 'bg-teal-100 text-teal-700',
    value: 'text-teal-900',
    badge: 'border-teal-200 bg-teal-100 text-teal-800',
  },
  pink: {
    card: 'border-sky-200 bg-slate-50 text-slate-900',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-slate-900',
    badge: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  orange: {
    card: 'border-sky-200 bg-slate-50 text-slate-900',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-slate-900',
    badge: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  gradient: {
    card: 'border-cyan-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 text-sky-900',
    icon: 'bg-sky-100 text-sky-700',
    value: 'text-sky-900',
    badge: 'border-cyan-200 bg-cyan-100 text-cyan-800',
  },
}

export function CosmicMetricCard({
  icon,
  label,
  value,
  subtitle,
  subValue,
  tooltip,
  badge,
  colorScheme = 'amber',
  size = 'medium',
  className = '',
  onClick
}: CosmicMetricCardProps) {
  const sizes = sizeConfig[size]
  const palette = palettes[colorScheme] ?? palettes.amber

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className={`h-full rounded-2xl border ${palette.card} ${onClick ? 'cursor-pointer transition-all duration-300 hover:border-sky-300' : ''}`}
        onClick={onClick}
        title={tooltip}
      >
        <CardContent className="flex h-full flex-col items-center justify-center p-4 text-center sm:p-6">
          <div className={`${sizes.iconSize} mb-3 flex items-center justify-center rounded-full ${palette.icon}`}>
            {icon}
          </div>
          <div className={`${sizes.labelSize} mb-2 font-medium text-slate-500`}>
            {label}
          </div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className={`${sizes.valueSize} font-heading tracking-wide font-medium ${palette.value}`}>
              {value}
            </div>
            {badge && (
              <Badge variant="secondary" className={`border text-xs ${palette.badge}`}>
                {badge}
              </Badge>
            )}
          </div>
          {(subValue ?? subtitle) && (
            <div className={`${sizes.subtitleSize} text-slate-500`} title={tooltip}>
              {subValue ?? subtitle}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
