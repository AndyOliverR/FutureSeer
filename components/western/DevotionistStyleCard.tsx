"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles,
  Circle
} from 'lucide-react'

export interface DevotionistStyleCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  summary?: string
  items?: Array<{ icon?: ReactNode; text: string; highlight?: boolean; type?: 'positive' | 'neutral' | 'challenge' }>
  variant?: 'default' | 'callout' | 'timeline'
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'
  className?: string
  children?: ReactNode
}

const colorSchemes = {
  amber: {
    border: 'border-amber-300',
    hoverBorder: 'hover:border-amber-400',
    bg: 'bg-amber-50/80',
    iconBg: 'bg-amber-200/60',
    iconColor: 'text-amber-700',
    titleColor: 'text-amber-900',
    accentColor: 'text-amber-700'
  },
  blue: {
    border: 'border-blue-300',
    hoverBorder: 'hover:border-blue-400',
    bg: 'bg-blue-50/80',
    iconBg: 'bg-blue-200/60',
    iconColor: 'text-blue-700',
    titleColor: 'text-blue-900',
    accentColor: 'text-blue-700'
  },
  purple: {
    border: 'border-purple-300',
    hoverBorder: 'hover:border-purple-400',
    bg: 'bg-purple-50/80',
    iconBg: 'bg-purple-200/60',
    iconColor: 'text-purple-700',
    titleColor: 'text-purple-900',
    accentColor: 'text-purple-700'
  },
  pink: {
    border: 'border-pink-300',
    hoverBorder: 'hover:border-pink-400',
    bg: 'bg-pink-50/80',
    iconBg: 'bg-pink-200/60',
    iconColor: 'text-pink-700',
    titleColor: 'text-pink-900',
    accentColor: 'text-pink-700'
  },
  green: {
    border: 'border-green-300',
    hoverBorder: 'hover:border-green-400',
    bg: 'bg-green-50/80',
    iconBg: 'bg-green-200/60',
    iconColor: 'text-green-700',
    titleColor: 'text-green-900',
    accentColor: 'text-green-700'
  },
  orange: {
    border: 'border-orange-300',
    hoverBorder: 'hover:border-orange-400',
    bg: 'bg-orange-50/80',
    iconBg: 'bg-orange-200/60',
    iconColor: 'text-orange-700',
    titleColor: 'text-orange-900',
    accentColor: 'text-orange-700'
  },
  cyan: {
    border: 'border-cyan-300',
    hoverBorder: 'hover:border-cyan-400',
    bg: 'bg-cyan-50/80',
    iconBg: 'bg-cyan-200/60',
    iconColor: 'text-cyan-700',
    titleColor: 'text-cyan-900',
    accentColor: 'text-cyan-700'
  }
}

export function DevotionistStyleCard({
  icon,
  title,
  subtitle,
  summary,
  items,
  variant = 'default',
  colorScheme = 'amber',
  className = '',
  children
}: DevotionistStyleCardProps) {
  const colors = colorSchemes[colorScheme]
  
  // Default icon for items based on type
  const getItemIcon = (item: { icon?: ReactNode; type?: 'positive' | 'neutral' | 'challenge' }) => {
    if (item.icon) return item.icon
    
    if (item.type === 'positive') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (item.type === 'challenge') {
      return <AlertCircle className="w-4 h-4 text-orange-600" />
    } else {
      return <Circle className="w-3 h-3 text-slate-500 fill-current" />
    }
  }

  if (variant === 'callout') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hoverBorder} transition-all duration-300 p-4 ${className}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`${colors.iconBg} rounded-lg p-2 flex-shrink-0`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <h4 className={`${colors.titleColor} font-semibold text-lg mb-1`}>{title}</h4>
            {subtitle && (
              <p className="text-slate-600 text-sm mb-2">{subtitle}</p>
            )}
            {summary && (
              <p className="text-slate-700 text-sm leading-relaxed mb-3">{summary}</p>
            )}
            {items && items.length > 0 && (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">
                      {getItemIcon(item)}
                    </span>
                    <span className={`text-sm text-slate-700 ${item.highlight ? 'font-medium' : ''}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </motion.div>
    )
  }

  if (variant === 'timeline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative pl-8 ${className}`}
      >
        {/* Timeline line */}
        <div className={`absolute left-3 top-0 bottom-0 w-0.5 bg-slate-300/30`} />
        
        {/* Timeline marker */}
        <div className={`absolute left-0 top-1 ${colors.iconBg} rounded-full p-1.5`}>
          <div className={colors.iconColor}>
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4 mb-4 shadow-sm`}>
          <h4 className={`${colors.titleColor} font-semibold text-base mb-1`}>{title}</h4>
          {subtitle && (
            <p className="text-slate-600 text-xs mb-2">{subtitle}</p>
          )}
          {summary && (
            <p className="text-slate-700 text-sm leading-relaxed mb-2">{summary}</p>
          )}
          {items && items.length > 0 && (
            <ul className="space-y-1.5 mt-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">
                    {getItemIcon(item)}
                  </span>
                  <span className={`text-xs text-slate-700 ${item.highlight ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${colors.border} ${colors.bg} ${colors.hoverBorder} transition-all duration-300 rounded-xl shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`${colors.iconBg} rounded-lg p-2 flex-shrink-0`}>
              <div className={colors.iconColor}>
                {icon}
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`${colors.titleColor} font-semibold text-base mb-1`}>{title}</h4>
              {subtitle && (
                <p className="text-slate-600 text-xs mb-2">{subtitle}</p>
              )}
            </div>
          </div>
          
          {summary && (
            <p className="text-slate-700 text-sm leading-relaxed mb-3">{summary}</p>
          )}
          
          {items && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">
                    {getItemIcon(item)}
                  </span>
                  <span className={`text-sm text-slate-700 ${item.highlight ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
