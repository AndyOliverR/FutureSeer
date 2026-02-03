"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Guidance } from '@/lib/bibliomancyIntelligence'
import { Heart, Briefcase, HeartPulse, Sparkles, DollarSign, Users, CheckCircle, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PassageCard from './PassageCard'

interface LifeAreaGuidanceProps {
  lifeAreaGuidance: {
    love: Guidance
    career: Guidance
    health: Guidance
    spirituality: Guidance
    finances: Guidance
    relationships: Guidance
  }
}

const lifeAreaConfig = {
  love: {
    icon: Heart,
    label: 'Love & Romance',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300'
  },
  career: {
    icon: Briefcase,
    label: 'Career & Work',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  health: {
    icon: HeartPulse,
    label: 'Health & Wellness',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  spirituality: {
    icon: Sparkles,
    label: 'Spirituality',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  finances: {
    icon: DollarSign,
    label: 'Finances',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300'
  },
  relationships: {
    icon: Users,
    label: 'Relationships',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-300'
  }
}

// Helper function to determine if text is RTL (Arabic or Hebrew)
function isRTL(text: string): boolean {
  // Check for Arabic or Hebrew characters
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return rtlRegex.test(text)
}

export default function LifeAreaGuidance({ lifeAreaGuidance }: LifeAreaGuidanceProps) {
  return (
    <div className="space-y-6">
      {Object.entries(lifeAreaGuidance).map(([area, guidance], index) => {
        const config = lifeAreaConfig[area as keyof typeof lifeAreaConfig]
        const Icon = config.icon

        return (
          <motion.div
            key={area}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Icon className={`h-6 w-6 ${config.color}`} />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Passage */}
                <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
                  <div className="mb-2">
                    <Badge variant="secondary" className={`${config.bgColor} ${config.color} border ${config.borderColor}`}>
                      {guidance.passage.reference}
                    </Badge>
                  </div>
                  {/* Original Language Text */}
                  {guidance.passage.originalText && (
                    <blockquote 
                      className={`${config.color} leading-relaxed text-lg mb-2 font-medium`}
                      dir={isRTL(guidance.passage.originalText) ? 'rtl' : 'ltr'}
                      style={{ 
                        textAlign: isRTL(guidance.passage.originalText) ? 'right' : 'left',
                        fontFamily: isRTL(guidance.passage.originalText) 
                          ? 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif' 
                          : 'inherit'
                      }}
                    >
                      {guidance.passage.originalText}
                    </blockquote>
                  )}
                  {/* English Translation */}
                  <blockquote className={`${config.color} italic leading-relaxed`}>
                    "{guidance.passage.text}"
                  </blockquote>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-sm font-semibold text-amber-700 mb-2">Divine Message</h4>
                  <p className="text-slate-700 leading-relaxed">{guidance.message}</p>
                </div>

                {/* Actions */}
                {guidance.actions && guidance.actions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-600" />
                      Actions
                    </h4>
                    <ul className="space-y-1">
                      {guidance.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Affirmations */}
                {guidance.affirmations && guidance.affirmations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-600" />
                      Affirmations
                    </h4>
                    <ul className="space-y-1">
                      {guidance.affirmations.map((affirmation, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 italic">
                          <span className="text-amber-600 mt-1">"</span>
                          <span>{affirmation}</span>
                          <span className="text-amber-600">"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

