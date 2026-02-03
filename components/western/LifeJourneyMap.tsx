"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUpcomingMilestones, getCurrentLifePosition, LifeMilestone } from '@/lib/western/lifeJourneyUtils'
import { Calendar, Star, Clock, ArrowRight } from 'lucide-react'

export interface LifeJourneyMapProps {
  birthDate: string | Date
  chartData?: any
}

// Get milestone icon
function getMilestoneIcon(type: LifeMilestone['type']): string {
  const icons: Record<LifeMilestone['type'], string> = {
    saturn: '♄',
    jupiter: '♃',
    chiron: '⚕',
    'progressed-moon': '☽',
    'solar-return': '☉',
    'lunar-return': '☽'
  }
  return icons[type]
}

// Get milestone color
function getMilestoneColor(significance: LifeMilestone['significance']) {
  const colors: Record<LifeMilestone['significance'], any> = {
    major: {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      badge: 'bg-purple-200 text-purple-900',
      glow: 'shadow-purple-200'
    },
    moderate: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badge: 'bg-blue-200 text-blue-900',
      glow: 'shadow-blue-200'
    },
    minor: {
      bg: 'bg-cyan-100',
      border: 'border-cyan-300',
      text: 'text-cyan-800',
      badge: 'bg-cyan-200 text-cyan-900',
      glow: 'shadow-cyan-200'
    }
  }
  return colors[significance]
}

export function LifeJourneyMap({ birthDate }: LifeJourneyMapProps) {
  const currentPosition = useMemo(() => {
    return getCurrentLifePosition(birthDate)
  }, [birthDate])
  
  const upcomingMilestones = useMemo(() => {
    return getUpcomingMilestones(birthDate, 10).slice(0, 8) // Next 8 milestones within 10 years
  }, [birthDate])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Life Journey</h3>
        <p className="text-slate-600 text-sm">
          Major astrological cycles and milestones throughout your life
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
                  <div className="text-3xl font-bold text-amber-900">{currentPosition.age}</div>
                  <div className="text-xs text-slate-600">Years Old</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm font-bold text-purple-900">{currentPosition.saturnPhase}</div>
                  <div className="text-xs text-slate-600">Saturn Phase</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm font-bold text-blue-900">{currentPosition.jupiterPhase}</div>
                  <div className="text-xs text-slate-600">Jupiter Phase</div>
                </div>
              </div>
              
              {currentPosition.recentMilestone && (
                <div className="bg-white/60 rounded-lg p-3 mb-3">
                  <div className="text-xs text-slate-600 mb-1">Recently Passed:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getMilestoneIcon(currentPosition.recentMilestone.type)}</span>
                    <span className="font-semibold text-slate-800">{currentPosition.recentMilestone.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {currentPosition.recentMilestone.age} years
                    </Badge>
                  </div>
                </div>
              )}
              
              {currentPosition.nextMilestone && (
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Coming Next:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getMilestoneIcon(currentPosition.nextMilestone.type)}</span>
                    <span className="font-semibold text-slate-800">{currentPosition.nextMilestone.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {currentPosition.nextMilestone.yearsUntil 
                        ? `In ${currentPosition.nextMilestone.yearsUntil} ${currentPosition.nextMilestone.yearsUntil === 1 ? 'year' : 'years'}`
                        : 'This year'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones Timeline */}
      <div>
        <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Upcoming Milestones
        </h4>
        
        <div className="space-y-4">
          {upcomingMilestones.map((milestone, index) => {
            const colors = getMilestoneColor(milestone.significance)
            
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card className={`border-2 ${colors.border} ${colors.bg} rounded-2xl shadow-md hover:shadow-lg ${colors.glow} transition-all duration-300`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`${colors.badge} rounded-full p-3 text-2xl flex-shrink-0`}>
                        {milestone.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className={`font-bold text-lg ${colors.text}`}>
                              {milestone.name}
                            </h5>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {milestone.date.toLocaleDateString('en-US', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </span>
                              {milestone.yearsUntil !== undefined && (
                                <>
                                  <ArrowRight className="w-4 h-4" />
                                  <span className="font-semibold">
                                    {milestone.yearsUntil === 0 
                                      ? 'This year' 
                                      : `In ${milestone.yearsUntil} ${milestone.yearsUntil === 1 ? 'year' : 'years'}`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={colors.badge}>
                              Age {milestone.age}
                            </Badge>
                            {milestone.significance === 'major' && (
                              <Badge variant="secondary" className="bg-amber-200 text-amber-900 text-xs">
                                ★ Major
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <h4 className="font-bold text-slate-800 text-lg mb-3">About Life Cycles</h4>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Saturn Cycles (29 years):</strong> Major life lessons, maturation, and karmic completions. 
              The Saturn Return at age 29 and 58 are particularly significant.
            </p>
            <p>
              <strong>Jupiter Cycles (12 years):</strong> Periods of growth, expansion, and new opportunities. 
              Each return brings fresh wisdom and abundance.
            </p>
            <p>
              <strong>Progressed Moon (2.5 years):</strong> Emotional shifts and new chapters in your inner life. 
              Each sign change brings different emotional themes.
            </p>
            <p>
              <strong>Solar Returns (Annual):</strong> Your personal new year when the Sun returns to its birth position. 
              Sets the tone for the year ahead.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
