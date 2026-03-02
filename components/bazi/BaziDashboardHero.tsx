"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BaziReading } from '@/lib/baziIntelligence'
import { CosmicMetricCard } from '../western/CosmicMetricCard'
import { m3BouncySpring, m3SmoothEase, m3Scale, m3Elevation } from '@/lib/material3Animations'
import {
  Sparkles,
  Calendar,
  Activity,
  Zap,
  TrendingUp,
  Crown
} from 'lucide-react'

export interface BaziDashboardHeroProps {
  reading: BaziReading
  userProfile: any
  currentAge?: number
}

// Element color mappings
const elementColors = {
  'Wood': { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/50', text: 'text-green-400', icon: '🌳' },
  'Fire': { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: '🔥' },
  'Earth': { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-600/50', text: 'text-yellow-400', icon: '🏔️' },
  'Metal': { bg: 'from-gray-400/20 to-slate-400/20', border: 'border-gray-400/50', text: 'text-gray-300', icon: '⚔️' },
  'Water': { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/50', text: 'text-blue-400', icon: '💧' }
}

const getElementStyle = (element: string) => {
  return elementColors[element as keyof typeof elementColors] || elementColors['Metal']
}

export function BaziDashboardHero({ reading, userProfile, currentAge }: BaziDashboardHeroProps) {
  const dayMaster = reading.dayMaster
  const elements = reading.elements
  const currentCycle = reading.luckCycles.find(c => 
    currentAge && currentAge >= c.startAge && currentAge < c.endAge
  ) || reading.luckCycles[0]
  
  // Calculate element percentages
  const total = Object.values(elements).reduce((a, b) => a + b, 0)
  const dominantElement = Object.entries(elements).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )
  const weakestElement = Object.entries(elements).reduce((a, b) => 
    b[1] < a[1] && b[1] > 0 ? b : a
  )

  const dayMasterStyle = getElementStyle(dayMaster.element)
  
  // Calculate balance score
  const balanceScore = 100 - (Math.max(...Object.values(elements)) - Math.min(...Object.values(elements).filter(v => v > 0))) * 10
  const balanceRating = balanceScore > 80 ? 'Excellent' : balanceScore > 60 ? 'Good' : balanceScore > 40 ? 'Moderate' : 'Needs Balance'

  return (
    <div className="space-y-6">
      {/* Main Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m3SmoothEase}
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={m3BouncySpring}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg hover:shadow-xl rounded-3xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                variants={m3Scale}
                initial="initial"
                animate="animate"
                transition={{ ...m3BouncySpring, delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <motion.div 
                  className="text-6xl drop-shadow-2xl"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  🏮
                </motion.div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 mb-3">
                Your BaZi Blueprint
              </h1>
              
              <p className="text-slate-700 text-lg max-w-2xl mx-auto">
                Four Pillars of Destiny - {userProfile?.displayName || userProfile?.fullName || 'Seeker'}
              </p>
            </div>

            {/* Day Master Highlight */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...m3BouncySpring, delay: 0.3 }}
            >
              <motion.div
                whileHover={{}}
                transition={m3BouncySpring}
              >
                <Card className="bg-white border-2 border-amber-200 shadow-md hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-amber-700" />
                    <span className="text-sm font-bold text-amber-900 tracking-wide">DAY MASTER 日主</span>
                  </div>
                  
                  <div className="text-5xl mb-3">{dayMasterStyle.icon}</div>
                  
                  <div className="text-3xl font-serif font-bold text-amber-900 mb-2">
                    {dayMaster.name}
                  </div>
                  
                  <Badge className="bg-amber-100 text-amber-900 border-2 border-amber-300 text-lg px-4 py-1.5 mb-3">
                    {dayMaster.element} Element
                  </Badge>
                  
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 border-2 border-amber-200">
                    <span className="text-sm text-slate-700">
                      {dayMaster.yinYang === 'yang' ? '☀ Yang' : '☾ Yin'} Energy
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 mt-4 max-w-2xl mx-auto leading-relaxed">
                    Your core essence and personality archetype in the cosmic dance of elements
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </motion.div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Element Balance */}
              <CosmicMetricCard
                icon={<Activity className="w-5 h-5" />}
                label="Element Balance"
                value={balanceRating}
                subValue={`${balanceScore.toFixed(0)}% Harmonized`}
                colorScheme="green"
                tooltip={`Dominant: ${dominantElement[0]} (${((dominantElement[1] / total) * 100).toFixed(0)}%) | Weakest: ${weakestElement[0]} (${((weakestElement[1] / total) * 100).toFixed(0)}%)`}
              />

              {/* Current Luck Cycle */}
              {currentCycle && (
                <CosmicMetricCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Current Cycle"
                  value={`Ages ${currentCycle.startAge}-${currentCycle.endAge}`}
                  subValue={`${currentCycle.element} ${currentCycle.animal}`}
                  colorScheme="orange"
                  tooltip={currentCycle.overallInfluence.substring(0, 100) + '...'}
                />
              )}

              {/* Favorable Elements */}
              <CosmicMetricCard
                icon={<Sparkles className="w-5 h-5" />}
                label="Favorable Elements"
                value={reading.favorable.elements.slice(0, 2).join(' & ')}
                subValue={`${reading.favorable.elements.length} Total`}
                colorScheme="purple"
                tooltip="Elements that bring you fortune and balance"
              />
            </div>

            {/* Mini Element Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...m3SmoothEase, delay: 0.4 }}
            >
              <Card className="mt-6 bg-white border-2 border-amber-200 shadow-md hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <h3 className="text-sm font-serif font-bold text-amber-900">Element Distribution</h3>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(elements).map(([element, count]) => {
                    const percentage = total > 0 ? (count / total) * 100 : 0
                    const style = getElementStyle(element.charAt(0).toUpperCase() + element.slice(1))
                    const isDayMaster = element.toLowerCase() === dayMaster.element.toLowerCase()
                    
                    return (
                      <div key={element} className="flex items-center gap-3">
                        <span className="text-2xl w-8 text-center">{style.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">
                                {element.charAt(0).toUpperCase() + element.slice(1)}
                              </span>
                              {isDayMaster && (
                                <Badge className="bg-amber-100 text-amber-900 border-2 border-amber-300 text-xs">
                                  Core
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-600">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="relative w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 ${
                                isDayMaster ? 'ring-1 ring-amber-500' : ''
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Birth Details */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-600 flex-wrap">
              {userProfile?.birthDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(userProfile.birthDate).toLocaleDateString()}</span>
                </div>
              )}
              {userProfile?.birthTime && (
                <span>• {userProfile.birthTime}</span>
              )}
              {userProfile?.birthPlace && (
                <span>• {userProfile.birthPlace}</span>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
