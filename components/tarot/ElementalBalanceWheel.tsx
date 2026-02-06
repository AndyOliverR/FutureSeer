"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TarotCard, TarotReading } from '@/lib/tarotIntelligence'
import { ProfileCardsData } from '@/types/tarot'
import { Flame, Droplets, Wind, Mountain } from 'lucide-react'

export interface ElementalBalanceWheelProps {
  profileCards: ProfileCardsData | null
  recentReadings?: TarotReading[]
}

interface ElementalData {
  fire: number
  water: number
  air: number
  earth: number
}

// Calculate elemental distribution
function calculateElementalBalance(profileCards: ProfileCardsData | null, recentReadings?: TarotReading[]): ElementalData {
  const elements: ElementalData = { fire: 0, water: 0, air: 0, earth: 0 }
  
  if (!profileCards) return elements
  
  // Count from profile cards
  const cards = [
    profileCards.birthCard,
    profileCards.lifePathCard,
    profileCards.soulCard,
    profileCards.personalityCard
  ].filter((c): c is TarotCard => c != null)
  
  cards.forEach((card: TarotCard) => {
    if (card.element) {
      elements[card.element] = (elements[card.element] || 0) + 1
    }
  })
  
  return elements
}

// Get element color
function getElementColor(element: string): { bg: string; text: string; border: string; icon: React.ReactElement } {
  const colors: Record<string, any> = {
    fire: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: <Flame className="w-6 h-6" /> },
    water: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: <Droplets className="w-6 h-6" /> },
    air: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: <Wind className="w-6 h-6" /> },
    earth: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: <Mountain className="w-6 h-6" /> }
  }
  return colors[element] || colors.fire
}

// Get element description
function getElementDescription(element: string): string {
  const descriptions: Record<string, string> = {
    fire: 'Passion, action, creativity, and transformation',
    water: 'Emotion, intuition, relationships, and healing',
    air: 'Intellect, communication, logic, and ideas',
    earth: 'Stability, grounding, material world, and practicality'
  }
  return descriptions[element] || ''
}

export function ElementalBalanceWheel({ profileCards, recentReadings }: ElementalBalanceWheelProps) {
  const elementalBalance = useMemo(
    () => calculateElementalBalance(profileCards, recentReadings),
    [profileCards, recentReadings]
  )
  
  const total = elementalBalance.fire + elementalBalance.water + elementalBalance.air + elementalBalance.earth
  const dominant = useMemo(() => {
    const entries = Object.entries(elementalBalance)
    const max = Math.max(...entries.map(([, count]) => count))
    const dominantEntry = entries.find(([, count]) => count === max)
    return dominantEntry ? dominantEntry[0] : 'fire'
  }, [elementalBalance])
  
  // Calculate percentages
  const percentages = {
    fire: total > 0 ? Math.round((elementalBalance.fire / total) * 100) : 0,
    water: total > 0 ? Math.round((elementalBalance.water / total) * 100) : 0,
    air: total > 0 ? Math.round((elementalBalance.air / total) * 100) : 0,
    earth: total > 0 ? Math.round((elementalBalance.earth / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Circular Visualization */}
      <div className="relative">
        {/* Center Circle with Dominant Element */}
        <div className="flex justify-center items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={`relative ${getElementColor(dominant).bg} rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 ${getElementColor(dominant).border} shadow-lg`}
          >
            <div className={getElementColor(dominant).text}>
              {getElementColor(dominant).icon}
            </div>
            <div className={`font-bold ${getElementColor(dominant).text} text-xl mt-2 capitalize`}>
              {dominant}
            </div>
            <div className="text-xs text-slate-600">
              Dominant
            </div>
          </motion.div>
        </div>

        {/* Element Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['fire', 'water', 'air', 'earth'] as const).map((element, index) => {
            const colors = getElementColor(element)
            const count = elementalBalance[element]
            const percentage = percentages[element]
            
            return (
              <motion.div
                key={element}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`${colors.bg} border-2 ${colors.border} shadow-md rounded-2xl hover:shadow-lg transition-all`}>
                  <CardContent className="p-4 text-center">
                    <div className={colors.text}>
                      {colors.icon}
                    </div>
                    <div className={`font-bold ${colors.text} text-lg capitalize mt-2`}>
                      {element}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 my-2">
                      {count}
                    </div>
                    <div className="text-xs text-slate-600">
                      {percentage}%
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-500')}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Element Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['fire', 'water', 'air', 'earth'] as const).map((element) => {
            const colors = getElementColor(element)
            return (
              <Card key={element} className={`${colors.bg} border-2 ${colors.border} rounded-xl`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={colors.text}>
                      {colors.icon}
                    </div>
                    <div className={`font-bold ${colors.text} capitalize text-lg`}>
                      {element}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {getElementDescription(element)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Interpretation */}
        <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl">
          <CardContent className="p-6">
            <h4 className="font-bold text-purple-900 text-lg mb-3">Your Elemental Balance</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              Your profile shows a {dominant.charAt(0).toUpperCase() + dominant.slice(1)}-dominant energy pattern 
              ({percentages[dominant as keyof typeof percentages]}% of your cards). 
              This indicates that {getElementDescription(dominant).toLowerCase()} plays a central role in your spiritual journey. 
              {total === 4 ? (
                ` With all four profile cards accounted for, this gives you a complete picture of your elemental nature.`
              ) : (
                ` Complete your profile to see a more comprehensive elemental analysis.`
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
