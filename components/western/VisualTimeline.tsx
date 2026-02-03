"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description?: string
  type?: 'positive' | 'neutral' | 'challenge' | 'milestone'
  icon?: ReactNode
  details?: string[]
}

interface VisualTimelineProps {
  events: TimelineEvent[]
  title?: string
  colorScheme?: 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'
  className?: string
}

const colorSchemes = {
  amber: {
    line: 'bg-amber-300/50',
    marker: 'bg-amber-600',
    text: 'text-amber-900',
    bg: 'bg-amber-50/80',
    border: 'border-amber-300'
  },
  blue: {
    line: 'bg-blue-300/50',
    marker: 'bg-blue-600',
    text: 'text-blue-900',
    bg: 'bg-blue-50/80',
    border: 'border-blue-300'
  },
  purple: {
    line: 'bg-purple-300/50',
    marker: 'bg-purple-600',
    text: 'text-purple-900',
    bg: 'bg-purple-50/80',
    border: 'border-purple-300'
  },
  pink: {
    line: 'bg-pink-300/50',
    marker: 'bg-pink-600',
    text: 'text-pink-900',
    bg: 'bg-pink-50/80',
    border: 'border-pink-300'
  },
  green: {
    line: 'bg-green-300/50',
    marker: 'bg-green-600',
    text: 'text-green-900',
    bg: 'bg-green-50/80',
    border: 'border-green-300'
  },
  orange: {
    line: 'bg-orange-300/50',
    marker: 'bg-orange-600',
    text: 'text-orange-900',
    bg: 'bg-orange-50/80',
    border: 'border-orange-300'
  },
  cyan: {
    line: 'bg-cyan-300/50',
    marker: 'bg-cyan-600',
    text: 'text-cyan-900',
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-300'
  }
}

const typeIcons = {
  positive: <TrendingUp className="w-4 h-4" />,
  challenge: <TrendingDown className="w-4 h-4" />,
  milestone: <Calendar className="w-4 h-4" />,
  neutral: <Minus className="w-4 h-4" />
}

const typeColors = {
  positive: 'text-green-700 border-green-300 bg-green-50/80',
  challenge: 'text-orange-700 border-orange-300 bg-orange-50/80',
  milestone: 'text-blue-700 border-blue-300 bg-blue-50/80',
  neutral: 'text-slate-600 border-slate-300 bg-slate-50/80'
}

export function VisualTimeline({ 
  events, 
  title, 
  colorScheme = 'cyan',
  className = '' 
}: VisualTimelineProps) {
  const colors = colorSchemes[colorScheme]

  if (!events || events.length === 0) {
    return null
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {title && (
        <h4 className={`${colors.text} font-semibold text-lg mb-6`}>{title}</h4>
      )}
      
      <div className="relative">
        {/* Vertical timeline line */}
        <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${colors.line}`} />
        
        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const eventType = event.type || 'neutral'
            const eventIcon = event.icon || typeIcons[eventType]
            const eventColors = typeColors[eventType]
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="relative pl-12"
              >
                {/* Timeline marker */}
                <div className={`absolute left-0 top-1 w-8 h-8 ${colors.marker} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  <div className="w-4 h-4">
                    {eventIcon}
                  </div>
                </div>
                
                {/* Event content */}
                <div className={`rounded-xl border-2 ${eventColors} p-4 shadow-sm`}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-slate-800 text-base">{event.title}</h5>
                      </div>
                      <p className="text-slate-600 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.date}
                      </p>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-slate-700 text-sm leading-relaxed mb-2">
                      {event.description}
                    </p>
                  )}
                  
                  {event.details && event.details.length > 0 && (
                    <ul className="space-y-1.5 mt-3 pt-3 border-t border-slate-300/30">
                      {event.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
