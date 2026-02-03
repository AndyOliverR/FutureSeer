"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FengShuiCure } from '@/lib/fengshui/fengShuiIntelligence'
import { Square, Sprout, Droplets, Gem, Palette, Lightbulb, Box, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface FengShuiCuresProps {
  cures: FengShuiCure[]
}

const CURE_ICONS: Record<string, React.ComponentType<any>> = {
  'mirror': Square,
  'plant': Sprout,
  'water': Droplets,
  'crystal': Gem,
  'color': Palette,
  'lighting': Lightbulb,
  'object': Box,
  'arrangement': Box
}

const CURE_COLORS: Record<string, string> = {
  'mirror': 'from-blue-500 to-blue-700',
  'plant': 'from-green-500 to-green-700',
  'water': 'from-cyan-500 to-cyan-700',
  'crystal': 'from-purple-500 to-purple-700',
  'color': 'from-pink-500 to-pink-700',
  'lighting': 'from-yellow-500 to-orange-500',
  'object': 'from-amber-500 to-amber-700',
  'arrangement': 'from-slate-500 to-slate-700'
}

export default function FengShuiCures({ cures }: FengShuiCuresProps) {
  const [expandedCure, setExpandedCure] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cures.map((cure, index) => {
        const Icon = CURE_ICONS[cure.type] || Box
        const gradientColor = CURE_COLORS[cure.type] || 'from-slate-500 to-slate-700'
        const isExpanded = expandedCure === cure.name

        return (
          <Card
            key={cure.name}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">{cure.name}</h3>
                    <p className="text-xs text-amber-700 mb-1">{cure.type}</p>
                    <p className="text-sm text-slate-700">{cure.description}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-slate-700 mb-1">
                    <span className="text-amber-900 font-semibold">Purpose:</span> {cure.purpose}
                  </p>
                  <p className="text-xs text-slate-700">
                    <span className="text-amber-900 font-semibold">Placement:</span> {cure.placement}
                  </p>
                </div>

                <motion.button
                  onClick={() => setExpandedCure(isExpanded ? null : cure.name)}
                  className="w-full text-left text-sm text-amber-700 hover:text-amber-900 mb-2 flex items-center gap-2"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  {isExpanded ? 'Hide' : 'Show'} Details
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-3 border-t border-amber-200"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-amber-900 mb-2">Instructions:</h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-4">
                          {cure.instructions.map((instruction, i) => (
                            <li key={i} className="list-disc">{instruction}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-amber-900 mb-2">Benefits:</h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-4">
                          {cure.benefits.map((benefit, i) => (
                            <li key={i} className="list-disc">{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

