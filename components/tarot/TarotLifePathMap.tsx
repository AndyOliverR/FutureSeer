"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TarotCard } from '@/lib/tarotIntelligence'
import { ProfileCardsData, NumerologyData } from '@/types/tarot'
import { Calendar, Star, Clock, ArrowRight } from 'lucide-react'
import { tarotIntelligence } from '@/lib/tarotIntelligence'

export interface TarotLifePathMapProps {
  birthDate: string | Date
  profileCards: ProfileCardsData | null
  numerologyData?: NumerologyData
}

// Calculate current age
function calculateAge(birthDate: string | Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Map age to Major Arcana card
function getAgeCard(age: number): TarotCard | null {
  const majorCards = tarotIntelligence.getMajorArcanaCards()
  const cardIndex = age % 22
  return majorCards.find(card => card.number === cardIndex) || null
}

// Get life cycle name
function getLifeCycle(age: number): string {
  if (age < 22) return 'First Cycle: Foundation'
  if (age < 44) return 'Second Cycle: Growth'
  if (age < 66) return 'Third Cycle: Mastery'
  return 'Fourth Cycle: Wisdom'
}

// Get milestone color
function getMilestoneColor(age: number): { bg: string; border: string; text: string } {
  const cycle = Math.floor(age / 22)
  const colors = [
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' }
  ]
  return colors[cycle] || colors[0]
}

export function TarotLifePathMap({ birthDate, profileCards, numerologyData }: TarotLifePathMapProps) {
  const currentAge = useMemo(() => calculateAge(birthDate), [birthDate])
  const currentCard = useMemo(() => getAgeCard(currentAge), [currentAge])
  const currentCycle = useMemo(() => getLifeCycle(currentAge), [currentAge])
  
  // Generate upcoming milestones (next 8 significant ages)
  const upcomingMilestones = useMemo(() => {
    const milestones = []
    const keyAges = [22, 33, 44, 55, 66, 77, 88]
    
    for (const age of keyAges) {
      if (age > currentAge && age < currentAge + 30) {
        const card = getAgeCard(age)
        if (card) {
          milestones.push({ age, card, cycle: getLifeCycle(age) })
        }
      }
    }
    
    // Add next few years if not enough milestones
    for (let i = 1; milestones.length < 6 && i <= 10; i++) {
      const age = currentAge + i
      if (!keyAges.includes(age)) {
        const card = getAgeCard(age)
        if (card) {
          milestones.push({ age, card, cycle: getLifeCycle(age), isMinor: true })
        }
      }
    }
    
    return milestones.slice(0, 6)
  }, [currentAge])

  const personalYearNumber = numerologyData?.personalYearNumber

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Tarot Life Journey</h3>
        <p className="text-slate-600 text-sm">
          Major Arcana cycles and milestones throughout your life
        </p>
      </div>

      {/* Current Position Card */}
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-300 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-200/60 rounded-full p-4">
              <Star className="w-8 h-8 text-amber-700" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-amber-900 mb-2">
                You Are Here
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-3xl font-bold text-amber-900">{currentAge}</div>
                  <div className="text-xs text-slate-600">Years Old</div>
                </div>
                {currentCard && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-sm font-bold text-purple-900">{currentCard.name}</div>
                    <div className="text-xs text-slate-600">Current Card</div>
                  </div>
                )}
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm font-bold text-blue-900">{currentCycle.split(':')[0]}</div>
                  <div className="text-xs text-slate-600">{currentCycle.split(':')[1]}</div>
                </div>
              </div>
              
              {currentCard && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold">Your Current Energy:</span> {currentCard.upright}
                </p>
              )}
              
              {personalYearNumber && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge className="bg-purple-200 text-purple-900">
                    Personal Year {personalYearNumber}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones Timeline */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Upcoming Tarot Milestones
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMilestones.map((milestone, index) => {
            const colors = getMilestoneColor(milestone.age)
            return (
              <motion.div
                key={milestone.age}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-md rounded-2xl hover:shadow-lg transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold ${colors.text}">
                        Age {milestone.age}
                      </div>
                      {!milestone.isMinor && (
                        <Badge className={`${colors.bg} ${colors.text} font-semibold`}>
                          Milestone
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="font-bold ${colors.text} text-lg mb-1">
                        {milestone.card.name}
                      </div>
                      <div className="text-xs text-slate-600 mb-2">
                        {milestone.cycle}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {milestone.card.upright.substring(0, 100)}...
                    </p>
                    
                    <div className="mt-3 flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="w-3 h-3" />
                      In {milestone.age - currentAge} year{milestone.age - currentAge !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Life Cycle Explanation */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Understanding Your Tarot Life Cycles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="font-semibold text-purple-800 mb-1">Ages 0-22: Foundation</div>
              <p className="text-slate-700 text-xs">
                Your first journey through the Major Arcana, establishing your core identity and life patterns.
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="font-semibold text-blue-800 mb-1">Ages 22-44: Growth</div>
              <p className="text-slate-700 text-xs">
                Building upon your foundation, developing skills, relationships, and personal power.
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="font-semibold text-green-800 mb-1">Ages 44-66: Mastery</div>
              <p className="text-slate-700 text-xs">
                Refining your gifts, achieving goals, and stepping into wisdom and leadership.
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="font-semibold text-amber-800 mb-1">Ages 66+: Wisdom</div>
              <p className="text-slate-700 text-xs">
                Sharing knowledge, embracing completion, and preparing for transformation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
