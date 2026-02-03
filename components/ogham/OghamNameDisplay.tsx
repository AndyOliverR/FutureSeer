/**
 * Ogham Name Display Component
 * Display user name in Ogham script with visual staves layout
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import OghamStave from './OghamStave'
import { OghamNameAnalysis } from '@/lib/ogham/oghamReportGenerator'
import { Sparkles, TreePine } from 'lucide-react'

interface OghamNameDisplayProps {
  nameAnalysis: OghamNameAnalysis
  onLetterClick?: (letter: any) => void
}

export default function OghamNameDisplay({ 
  nameAnalysis,
  onLetterClick 
}: OghamNameDisplayProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Sparkles className="w-5 h-5" />
          Your Name in Ogham
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Name */}
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-2">Original Name</p>
          <p className="text-2xl font-bold text-slate-900">{nameAnalysis.originalName}</p>
        </div>

        {/* Ogham Script Display */}
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-3">Ogham Script</p>
          <div 
            className="text-4xl font-ogham text-amber-900 mb-4 p-4 bg-amber-100 rounded-lg border-2 border-amber-300"
            style={{ fontFamily: 'Noto Sans Ogham, Arial, sans-serif', direction: 'rtl' }}
          >
            {nameAnalysis.oghamScript}
          </div>
        </div>

        {/* Individual Staves */}
        <div>
          <p className="text-slate-700 text-sm mb-3 flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            Tree Letters of Your Name
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {nameAnalysis.letters.map((letter, index) => (
              <motion.div
                key={`${letter.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OghamStave
                  letter={letter}
                  size="md"
                  showDetails={true}
                  onClick={() => onLetterClick?.(letter)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Overall Meaning */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-300">
          <p className="text-slate-700 text-sm leading-relaxed">
            {nameAnalysis.overallMeaning}
          </p>
        </div>

        {/* Combined Traits */}
        {nameAnalysis.combinedTraits.length > 0 && (
          <div>
            <p className="text-slate-700 text-sm mb-2">Your Tree Traits</p>
            <div className="flex flex-wrap gap-2">
              {nameAnalysis.combinedTraits.slice(0, 8).map((trait, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs border-2 border-amber-400"
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

