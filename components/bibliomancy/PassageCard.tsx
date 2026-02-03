"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Passage } from '@/lib/bibliomancyIntelligence'
import { Quote, Book, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PassageCardProps {
  passage: Passage
  index?: number
}

// Helper function to determine if text is RTL (Arabic or Hebrew)
function isRTL(text: string): boolean {
  // Check for Arabic or Hebrew characters
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return rtlRegex.test(text)
}

export default function PassageCard({ passage, index = 0 }: PassageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Book className="h-5 w-5 text-amber-600" />
              {passage.reference}
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-200 text-amber-900 border-amber-300">
              {passage.book}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Passage Text */}
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <Quote className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                {/* Original Language Text */}
                {passage.originalText && (
                  <blockquote 
                    className="text-amber-900 leading-relaxed text-xl mb-3 font-medium"
                    dir={isRTL(passage.originalText) ? 'rtl' : 'ltr'}
                    style={{ 
                      textAlign: isRTL(passage.originalText) ? 'right' : 'left',
                      fontFamily: isRTL(passage.originalText) 
                        ? 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' 
                        : 'inherit'
                    }}
                  >
                    {passage.originalText}
                  </blockquote>
                )}
                {/* English Translation */}
                <blockquote className="text-amber-900 italic leading-relaxed text-lg">
                  "{passage.text}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div>
            <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Interpretation
            </h4>
            <p className="text-slate-700 leading-relaxed">{passage.interpretation}</p>
          </div>

          {/* Application */}
          <div>
            <h4 className="text-sm font-semibold text-amber-700 mb-2">Application</h4>
            <p className="text-slate-700 leading-relaxed">{passage.application}</p>
          </div>

          {/* Themes */}
          {passage.themes && passage.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-300">
              {passage.themes.map((theme, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="bg-amber-200 text-amber-900 border-amber-300"
                >
                  {theme}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

