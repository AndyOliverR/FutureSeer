"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TarotCard } from '@/lib/tarotIntelligence'
import { ProfileCardsData } from '@/types/tarot'
import { Sparkles, Wand2, Wine, Swords, Coins } from 'lucide-react'

export interface ArcanaDistributionChartProps {
  profileCards: ProfileCardsData | null
}

interface ArcanaDistribution {
  major: {
    count: number
    cards: TarotCard[]
  }
  minor: {
    count: number
    wands: number
    cups: number
    swords: number
    pentacles: number
    cards: TarotCard[]
  }
}

// Calculate arcana distribution
function calculateArcanaDistribution(profileCards: ProfileCardsData | null): ArcanaDistribution {
  const distribution: ArcanaDistribution = {
    major: { count: 0, cards: [] },
    minor: { count: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, cards: [] }
  }
  
  if (!profileCards) return distribution
  
  const cards = [
    profileCards.birthCard,
    profileCards.lifePathCard,
    profileCards.soulCard,
    profileCards.personalityCard
  ].filter((c): c is TarotCard => c != null)
  
  cards.forEach((card: TarotCard) => {
    if (card.arcana === 'major') {
      distribution.major.count++
      distribution.major.cards.push(card)
    } else if (card.arcana === 'minor') {
      distribution.minor.count++
      distribution.minor.cards.push(card)
      if (card.suit) {
        distribution.minor[card.suit] = (distribution.minor[card.suit] || 0) + 1
      }
    }
  })
  
  return distribution
}

// Get suit icon and color
function getSuitConfig(suit: string): { icon: React.ReactElement; color: string; bg: string; border: string } {
  const configs: Record<string, any> = {
    wands: { icon: <Wand2 className="w-5 h-5" />, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
    cups: { icon: <Wine className="w-5 h-5" />, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
    swords: { icon: <Swords className="w-5 h-5" />, color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    pentacles: { icon: <Coins className="w-5 h-5" />, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' }
  }
  return configs[suit] || configs.wands
}

export function ArcanaDistributionChart({ profileCards }: ArcanaDistributionChartProps) {
  const distribution = useMemo(() => calculateArcanaDistribution(profileCards), [profileCards])
  
  const total = distribution.major.count + distribution.minor.count
  const majorPercentage = total > 0 ? Math.round((distribution.major.count / total) * 100) : 0
  const minorPercentage = total > 0 ? Math.round((distribution.minor.count / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Major vs Minor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Major Arcana Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg rounded-3xl h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-200/60 rounded-full p-3">
                  <Sparkles className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-900 text-xl">Major Arcana</h4>
                  <p className="text-xs text-slate-600">Life's Big Themes</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-5xl font-bold text-purple-900">{distribution.major.count}</div>
                <div className="text-sm text-slate-600 mt-1">{majorPercentage}% of your profile</div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4 h-3 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${majorPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                />
              </div>
              
              <p className="text-sm text-slate-700 leading-relaxed">
                Major Arcana cards represent significant life lessons, spiritual growth, and transformative experiences. 
                {distribution.major.count > 0 && ` Your profile includes: ${distribution.major.cards.map(c => c.name).join(', ')}.`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Minor Arcana Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg rounded-3xl h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-200/60 rounded-full p-3">
                  <Coins className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-xl">Minor Arcana</h4>
                  <p className="text-xs text-slate-600">Daily Life Matters</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-5xl font-bold text-blue-900">{distribution.minor.count}</div>
                <div className="text-sm text-slate-600 mt-1">{minorPercentage}% of your profile</div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4 h-3 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${minorPercentage}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                />
              </div>
              
              <p className="text-sm text-slate-700 leading-relaxed">
                Minor Arcana cards represent everyday experiences, practical matters, and the details of daily life. 
                {distribution.minor.count > 0 && ` Your profile includes: ${distribution.minor.cards.map(c => c.name).join(', ')}.`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Suit Breakdown (if any Minor Arcana) */}
      {distribution.minor.count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-300 shadow-lg rounded-3xl">
            <CardContent className="p-6">
              <h4 className="font-bold text-slate-900 text-xl mb-4">Minor Arcana Suit Breakdown</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['wands', 'cups', 'swords', 'pentacles'] as const).map((suit, index) => {
                  const config = getSuitConfig(suit)
                  const count = distribution.minor[suit]
                  const percentage = distribution.minor.count > 0 ? Math.round((count / distribution.minor.count) * 100) : 0
                  
                  return (
                    <motion.div
                      key={suit}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <Card className={`${config.bg} border-2 ${config.border} rounded-2xl`}>
                        <CardContent className="p-4 text-center">
                          <div className={`${config.color} mb-2`}>
                            {config.icon}
                          </div>
                          <div className={`font-bold ${config.color} capitalize mb-1`}>
                            {suit}
                          </div>
                          <div className="text-2xl font-bold text-slate-800">
                            {count}
                          </div>
                          <Badge className="mt-2 text-xs">
                            {percentage}%
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                    <Wand2 className="w-4 h-4" /> Wands (Fire)
                  </div>
                  <p className="text-slate-600">Action, creativity, passion, ambition</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                    <Wine className="w-4 h-4" /> Cups (Water)
                  </div>
                  <p className="text-slate-600">Emotions, relationships, intuition, love</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                    <Swords className="w-4 h-4" /> Swords (Air)
                  </div>
                  <p className="text-slate-600">Thoughts, communication, truth, conflict</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="font-semibold text-green-700 mb-1 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> Pentacles (Earth)
                  </div>
                  <p className="text-slate-600">Material, finances, health, practical matters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Interpretation */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl">
        <CardContent className="p-6">
          <h4 className="font-bold text-amber-900 text-lg mb-3">Understanding Your Arcana Balance</h4>
          <p className="text-slate-700 text-sm leading-relaxed">
            {distribution.major.count > distribution.minor.count ? (
              <>
                Your profile is <strong>Major Arcana dominant</strong> ({majorPercentage}%), indicating that you're experiencing 
                or will experience significant spiritual lessons and transformative life events. Your journey focuses on profound 
                personal growth and understanding life's deeper meanings.
              </>
            ) : distribution.minor.count > distribution.major.count ? (
              <>
                Your profile is <strong>Minor Arcana dominant</strong> ({minorPercentage}%), suggesting that your focus is on 
                practical matters, daily experiences, and the details of everyday life. You excel at handling the tangible aspects 
                of your journey and building your life step by step.
              </>
            ) : (
              <>
                Your profile shows a <strong>balanced distribution</strong> between Major and Minor Arcana ({majorPercentage}% / {minorPercentage}%), 
                indicating harmony between spiritual lessons and practical living. You integrate profound insights with everyday wisdom.
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
