"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface CosmicMetricCardProps {
  icon: ReactNode
  label: string
  value: string
  subtitle?: string
  subValue?: string
  tooltip?: string
  badge?: string
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan' | 'gradient'
  size?: 'small' | 'medium' | 'large'
  className?: string
  onClick?: () => void
}

const colorSchemes = {
  amber: {
    gradient: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-400/20',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-800',
    labelColor: 'text-slate-700'
  },
  blue: {
    gradient: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-400/20',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-800',
    labelColor: 'text-slate-700'
  },
  purple: {
    gradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-400/20',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-800',
    labelColor: 'text-slate-700'
  },
  pink: {
    gradient: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    iconBg: 'bg-pink-400/20',
    iconColor: 'text-pink-600',
    valueColor: 'text-pink-800',
    labelColor: 'text-slate-700'
  },
  green: {
    gradient: 'from-green-50 to-teal-50',
    border: 'border-green-200',
    iconBg: 'bg-green-400/20',
    iconColor: 'text-green-600',
    valueColor: 'text-green-800',
    labelColor: 'text-slate-700'
  },
  orange: {
    gradient: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    iconBg: 'bg-orange-400/20',
    iconColor: 'text-orange-600',
    valueColor: 'text-orange-800',
    labelColor: 'text-slate-700'
  },
  cyan: {
    gradient: 'from-cyan-50 to-blue-50',
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-400/20',
    iconColor: 'text-cyan-600',
    valueColor: 'text-cyan-800',
    labelColor: 'text-slate-700'
  },
  gradient: {
    gradient: 'from-purple-50 via-pink-50 to-amber-50',
    border: 'border-purple-200',
    iconBg: 'bg-gradient-to-br from-purple-400/20 to-pink-400/20',
    iconColor: 'text-purple-600',
    valueColor: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
    labelColor: 'text-slate-700'
  }
}

const sizeConfig = {
  small: {
    iconSize: 'w-10 h-10',
    iconPadding: 'p-2',
    valueSize: 'text-lg',
    labelSize: 'text-xs',
    subtitleSize: 'text-xs'
  },
  medium: {
    iconSize: 'w-16 h-16',
    iconPadding: 'p-3',
    valueSize: 'text-2xl',
    labelSize: 'text-sm',
    subtitleSize: 'text-xs'
  },
  large: {
    iconSize: 'w-20 h-20',
    iconPadding: 'p-4',
    valueSize: 'text-3xl',
    labelSize: 'text-base',
    subtitleSize: 'text-sm'
  }
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
  const colors = colorSchemes[colorScheme]
  const sizes = sizeConfig[size]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{}}
      className={className}
    >
      <Card 
        className={`bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} shadow-lg rounded-3xl ${onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-300' : ''} h-full`}
        onClick={onClick}
        title={tooltip}
      >
        <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
          {/* Icon */}
          <div className={`${sizes.iconSize} ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>

          {/* Label */}
          <div className={`${colors.labelColor} ${sizes.labelSize} mb-2 font-medium`}>
            {label}
          </div>

          {/* Value with Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`${colors.valueColor} ${sizes.valueSize} font-bold`}>
              {value}
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>

          {/* Subtitle / subValue */}
          {(subValue ?? subtitle) && (
            <div className={`text-slate-600 ${sizes.subtitleSize}`} title={tooltip}>
              {subValue ?? subtitle}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
