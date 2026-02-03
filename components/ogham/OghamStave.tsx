/**
 * Ogham Stave Component
 * Visual representation of individual Ogham letters with tree imagery
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OghamLetter } from '@/lib/ogham/oghamService'
import { TreePine, Sparkles } from 'lucide-react'

interface OghamStaveProps {
  letter: OghamLetter
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  onClick?: () => void
}

export default function OghamStave({ 
  letter, 
  size = 'md',
  showDetails = false,
  onClick 
}: OghamStaveProps) {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-24 h-32',
    lg: 'w-32 h-40'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const unicodeSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-slate-900/90 to-slate-800/90
        border-2 border-amber-500/30
        hover:border-amber-500/60
        transition-all duration-300
        backdrop-blur-sm
        shadow-lg
        hover:shadow-amber-500/20
        flex flex-col items-center justify-center
        p-2
      `}>
        <CardContent className="flex flex-col items-center justify-center h-full p-0">
          {/* Unicode Ogham Character */}
          <div className={`
            ${unicodeSizes[size]}
            font-ogham
            text-amber-400
            mb-2
            leading-none
          `} style={{ fontFamily: 'Noto Sans Ogham, Arial, sans-serif' }}>
            {letter.unicode}
          </div>

          {/* Tree Icon */}
          <TreePine className={`
            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
            text-amber-500/60
            mb-1
          `} />

          {/* Tree Name */}
          <div className={`
            ${textSizes[size]}
            font-semibold
            text-amber-400
            text-center
            mb-1
          `}>
            {letter.tree}
          </div>

          {/* Letter Name */}
          <div className={`
            ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'}
            text-slate-400
            text-center
          `}>
            {letter.name}
          </div>

          {/* Details Badge */}
          {showDetails && (
            <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              {letter.meaning.split(',')[0]}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

