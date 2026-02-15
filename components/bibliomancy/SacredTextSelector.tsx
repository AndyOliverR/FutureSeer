"use client"

import React from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SacredTextType } from '@/lib/bibliomancyIntelligence'

interface SacredTextSelectorProps {
  selectedText: SacredTextType | null
  onSelect: (textType: SacredTextType) => void
  disabled?: boolean
}

interface TextOption {
  type: SacredTextType
  name: string
  icon: string
  description: string
  tradition: string
  color: string
  borderColor: string
}

const textOptions: TextOption[] = [
  {
    type: 'bible',
    name: 'Bible',
    icon: '📖',
    description: 'Christian sacred text',
    tradition: 'Christianity',
    color: 'from-blue-100 to-blue-200',
    borderColor: 'border-blue-500'
  },
  {
    type: 'quran',
    name: 'Quran',
    icon: '☪️',
    description: 'Islamic holy book',
    tradition: 'Islam',
    color: 'from-emerald-100 to-emerald-200',
    borderColor: 'border-emerald-500'
  },
  {
    type: 'bhagavad-gita',
    name: 'Bhagavad Gita',
    icon: '🕉️',
    description: 'Hindu spiritual text',
    tradition: 'Hinduism',
    color: 'from-amber-100 to-amber-200',
    borderColor: 'border-amber-500'
  },
  {
    type: 'torah',
    name: 'Torah',
    icon: '✡️',
    description: 'Jewish sacred scripture',
    tradition: 'Judaism',
    color: 'from-purple-100 to-purple-200',
    borderColor: 'border-purple-500'
  },
  {
    type: 'hafez',
    name: 'Divan of Hafez',
    icon: '🌹',
    description: 'Persian mystical poetry',
    tradition: 'Sufism',
    color: 'from-rose-100 to-rose-200',
    borderColor: 'border-rose-500'
  }
]

export default function SacredTextSelector({ selectedText, onSelect, disabled = false }: SacredTextSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-amber-900 mb-2">Choose Your Sacred Text</h3>
        <p className="text-slate-700 text-sm">
          Select the sacred text you wish to consult for divine guidance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {textOptions.map((option, index) => {
          const isSelected = selectedText === option.type
          
          return (
            <motion.button
              key={option.type}
              onClick={() => {
                if (!disabled) {
                  devLog.debug('📚 Selected sacred text:', option.type, option.name)
                  onSelect(option.type)
                }
              }}
              disabled={disabled}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? `${option.borderColor} bg-gradient-to-br ${option.color} shadow-lg` 
                  : 'border-amber-300 bg-white hover:border-amber-400 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${option.color} ${option.borderColor} border-2 flex items-center justify-center`}
                >
                  <Check className="w-4 h-4 text-slate-800" />
                </motion.div>
              )}
              
              {/* Icon */}
              <div className="text-4xl mb-3 text-center">{option.icon}</div>
              
              {/* Name */}
              <h4 className={`text-lg font-semibold mb-1 text-center ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}>
                {option.name}
              </h4>
              
              {/* Description */}
              <p className="text-sm text-slate-700 mb-2 text-center">
                {option.description}
              </p>
              
              {/* Tradition */}
              <p className="text-xs text-slate-600 text-center">
                {option.tradition}
              </p>
              
              {/* Glow effect when selected */}
              {isSelected && (
                <motion.div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.color} opacity-30 blur-xl -z-10`}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      
      {selectedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-center"
        >
          <p className="text-sm text-amber-900">
            <span className="font-semibold">{textOptions.find(o => o.type === selectedText)?.name}</span> selected. 
            You can now generate your bibliomancy reading.
          </p>
        </motion.div>
      )}
    </div>
  )
}

