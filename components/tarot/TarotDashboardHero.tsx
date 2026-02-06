"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CosmicMetricCard } from '@/components/western/CosmicMetricCard'
import { TarotProfileDiagram } from './TarotProfileDiagram'
import { TarotCard } from '@/lib/tarotIntelligence'
import { CombinedSystemData, ProfileCardsData, UserProfile } from '@/types/tarot'
import {
  Sparkles,
  User,
  Target,
  Heart,
  Flame,
  Droplets,
  Wind,
  Mountain,
  BookOpen
} from 'lucide-react'

export interface TarotDashboardHeroProps {
  profileCards: ProfileCardsData | null
  userProfile: UserProfile | any  // Using 'any' temporarily for compatibility with existing auth hook
  combinedSystemData?: CombinedSystemData | null
}

// Helper to get element icon
function getElementIcon(element?: string): React.ReactElement {
  const icons: Record<string, React.ReactElement> = {
    fire: <Flame className="w-8 h-8" />,
    earth: <Mountain className="w-8 h-8" />,
    air: <Wind className="w-8 h-8" />,
    water: <Droplets className="w-8 h-8" />
  }
  return icons[element?.toLowerCase() || ''] || <Sparkles className="w-8 h-8" />
}

// Calculate dominant element from profile cards
function calculateDominantElement(profileCards: ProfileCardsData | null) {
  if (!profileCards) return { element: 'Unknown', count: 0 }
  
  const elements: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 }
  
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
  
  const dominant = Object.entries(elements).reduce((max, [elem, count]) => 
    count > max.count ? { element: elem, count } : max
  , { element: 'fire', count: 0 })
  
  return {
    element: dominant.element.charAt(0).toUpperCase() + dominant.element.slice(1),
    count: dominant.count
  }
}

// Calculate arcana balance
function calculateArcanaBalance(profileCards: ProfileCardsData | null) {
  if (!profileCards) return { major: 0, minor: 0 }
  
  const cards = [
    profileCards.birthCard,
    profileCards.lifePathCard,
    profileCards.soulCard,
    profileCards.personalityCard
  ].filter((c): c is TarotCard => c != null)
  
  const major = cards.filter((c: TarotCard) => c.arcana === 'major').length
  const minor = cards.filter((c: TarotCard) => c.arcana === 'minor').length
  
  return { major, minor }
}

export function TarotDashboardHero({ profileCards, userProfile, combinedSystemData }: TarotDashboardHeroProps) {
  const dominantElement = calculateDominantElement(profileCards)
  const arcanaBalance = calculateArcanaBalance(profileCards)
  const personalYearNumber = combinedSystemData?.numerology?.personalYearNumber

  return (
    <div className="space-y-6">
      {/* Profile Visualization Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card border-white/10 rounded-2xl text-white overflow-hidden">
          <CardContent className="p-6 text-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-400 to-purple-600 mb-2">
                Your Tarot Profile
              </h2>
              <p className="text-slate-300 text-sm">
                {userProfile?.fullName || userProfile?.displayName || 'Your'} sacred Tarot cards
                {userProfile?.birthDate && ` • Born ${new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
            </div>
            
            {profileCards ? (
              <TarotProfileDiagram profileCards={profileCards} />
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-300">Complete your profile to see your Tarot cards</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Cosmic Metrics Grid */}
      {profileCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Birth Card */}
            {profileCards.birthCard && (
              <CosmicMetricCard
                icon={<User className="w-8 h-8" />}
                label="Birth Card"
                value={profileCards.birthCard.name.split(' ').pop() || profileCards.birthCard.name}
                subtitle="Foundation"
                colorScheme="purple"
                size="small"
              />
            )}

            {/* Life Path Card */}
            {profileCards.lifePathCard && (
              <CosmicMetricCard
                icon={<Target className="w-8 h-8" />}
                label="Life Path"
                value={profileCards.lifePathCard.name.split(' ').pop() || profileCards.lifePathCard.name}
                subtitle="Journey"
                colorScheme="cyan"
                size="small"
              />
            )}

            {/* Soul Card */}
            {profileCards.soulCard && (
              <CosmicMetricCard
                icon={<Heart className="w-8 h-8" />}
                label="Soul Card"
                value={profileCards.soulCard.name.split(' ').pop() || profileCards.soulCard.name}
                subtitle="Inner Self"
                colorScheme="pink"
                size="small"
              />
            )}

            {/* Personality Card */}
            {profileCards.personalityCard && (
              <CosmicMetricCard
                icon={<Sparkles className="w-8 h-8" />}
                label="Personality"
                value={profileCards.personalityCard.name.split(' ').pop() || profileCards.personalityCard.name}
                subtitle="Expression"
                colorScheme="blue"
                size="small"
              />
            )}

            {/* Dominant Element */}
            <CosmicMetricCard
              icon={getElementIcon(dominantElement.element)}
              label="Element"
              value={dominantElement.element}
              badge={`${dominantElement.count}/4`}
              colorScheme="green"
              size="small"
            />

            {/* Arcana Balance */}
            <CosmicMetricCard
              icon={<BookOpen className="w-8 h-8" />}
              label="Arcana"
              value={arcanaBalance.major > arcanaBalance.minor ? 'Major' : arcanaBalance.minor > arcanaBalance.major ? 'Minor' : 'Balanced'}
              badge={`${arcanaBalance.major}M/${arcanaBalance.minor}m`}
              colorScheme="amber"
              size="small"
            />
          </div>
        </motion.div>
      )}

      {/* Quick Insights Bar */}
      {profileCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Quick Insights:</span>
                </div>
                
                <Badge variant="secondary" className="bg-purple-200/50 text-purple-900">
                  4 Profile Cards
                </Badge>
                
                <Badge variant="secondary" className="bg-pink-200/50 text-pink-900">
                  {dominantElement.element} Dominant
                </Badge>
                
                <Badge variant="secondary" className="bg-blue-200/50 text-blue-900">
                  {arcanaBalance.major} Major / {arcanaBalance.minor} Minor
                </Badge>
                
                {personalYearNumber && (
                  <Badge variant="secondary" className="bg-amber-200/50 text-amber-900">
                    Personal Year {personalYearNumber}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
