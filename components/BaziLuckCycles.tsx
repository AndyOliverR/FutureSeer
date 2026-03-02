"use client"

import { LuckCycle } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, AlertTriangle, Clock, Calendar, ChevronDown, ChevronUp, Target } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BaziLuckCyclesProps {
  cycles: LuckCycle[]
  currentAge: number
}

export function BaziLuckCycles({ cycles, currentAge }: BaziLuckCyclesProps) {
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null) // No cycle expanded by default

  const getCurrentCycle = () => {
    return cycles.find(cycle => currentAge >= cycle.startAge && currentAge < cycle.endAge) || cycles[0]
  }

  const currentCycle = getCurrentCycle()
  const currentCycleIndex = cycles.findIndex(c => c === currentCycle)

  const getRatingColor = (rating: LuckCycle['annualBreakdown'][0]['rating']) => {
    switch (rating) {
      case 'very-favorable':
        return { bg: 'bg-green-500/30', text: 'text-green-300', border: 'border-green-500/50', emoji: '✨' }
      case 'favorable':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', emoji: '⭐' }
      case 'neutral':
        return { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-600/50', emoji: '◾' }
      case 'challenging':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', emoji: '⚠️' }
      case 'very-challenging':
        return { bg: 'bg-red-500/30', text: 'text-red-300', border: 'border-red-500/50', emoji: '🔴' }
      default:
        return { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-600/50', emoji: '◾' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Cycle Highlight */}
      {currentCycle && (
        <Card className="bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-xl shadow-amber-500/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300 tracking-wide">CURRENT LUCK CYCLE</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  Ages {currentCycle.startAge}-{currentCycle.endAge}
                </div>
                <div className="text-lg text-amber-300 mb-1">
                  {currentCycle.heavenlyStem} {currentCycle.earthlyBranch}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-900/40 text-amber-200 border border-amber-500/50">
                    {currentCycle.element} Element
                  </Badge>
                  <Badge className="bg-amber-900/40 text-amber-200 border border-amber-500/50">
                    {currentCycle.animal}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-amber-900/40 rounded-full px-4 py-2 border border-amber-500/50">
                  <div className="text-sm text-amber-300">You are</div>
                  <div className="text-2xl font-bold text-white">{currentAge}</div>
                  <div className="text-xs text-amber-300">years old</div>
                </div>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed">{currentCycle.overallInfluence}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline Visualization */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-purple-500/40 rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-purple-300">Life Timeline (Da Yun)</h3>
          </div>
          <div className="relative">
            {/* Timeline Bar */}
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-700 -translate-y-1/2 rounded-full" />
            
            {/* Timeline Points */}
            <div className="relative flex justify-between items-center py-4">
              {cycles.slice(0, 8).map((cycle, idx) => {
                const isCurrent = idx === currentCycleIndex
                const isPast = idx < currentCycleIndex
                const isFuture = idx > currentCycleIndex
                
                return (
                  <motion.div
                    key={idx}
                    className="relative flex flex-col items-center cursor-pointer"
                    onClick={() => setExpandedCycle(expandedCycle === idx ? null : idx)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 z-10 ${
                      isCurrent 
                        ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/30' 
                        : isPast
                        ? 'bg-slate-600 border-slate-500'
                        : 'bg-indigo-500 border-indigo-400'
                    }`} />
                    <div className="text-xs mt-1 text-center">
                      <div className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-slate-400'}`}>
                        {cycle.startAge}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-slate-400">Past</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
              <span className="text-amber-300">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-indigo-300">Future</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Cycles */}
      <CardContent className="p-0">
        <div className="space-y-4">
          {cycles.map((cycle, index) => {
            const isCurrent = currentAge >= cycle.startAge && currentAge < cycle.endAge
            const isPast = currentAge > cycle.endAge
            const isExpanded = expandedCycle === index
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`overflow-hidden border-2 transition-all duration-300 ${
                  isCurrent 
                    ? 'border-amber-500/60 bg-gradient-to-br from-amber-900/20 to-orange-900/20 shadow-lg shadow-amber-500/10' 
                    : isPast
                    ? 'border-slate-600/40 bg-gradient-to-br from-slate-800/40 to-slate-900/40 opacity-75'
                    : 'border-indigo-500/40 bg-gradient-to-br from-indigo-900/20 to-purple-900/20'
                }`}>
                  <CardContent className="p-5">
                    {/* Cycle Header */}
                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setExpandedCycle(isExpanded ? null : index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setExpandedCycle(isExpanded ? null : index)
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border-2 transition-all ${
                          isCurrent 
                            ? 'bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-lg' 
                            : isPast
                            ? 'bg-slate-700/50 text-slate-400 border-slate-600'
                            : 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50'
                        }`}>
                          {cycle.cycleNumber}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white mb-1">
                            Ages {cycle.startAge}-{cycle.endAge}
                          </div>
                          <div className="text-sm text-amber-300 mb-1">
                            {cycle.heavenlyStem} {cycle.earthlyBranch}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              isCurrent ? 'border-amber-500/50 text-amber-300' : 'border-slate-500/50 text-slate-400'
                            }`}>
                              {cycle.element}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              isCurrent ? 'border-amber-500/50 text-amber-300' : 'border-slate-500/50 text-slate-400'
                            }`}>
                              {cycle.animal}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <Badge className="bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Current
                          </Badge>
                        )}
                        {isPast && (
                          <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50 text-xs">
                            Past
                          </Badge>
                        )}
                        {!isCurrent && !isPast && (
                          <Badge className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 text-xs">
                            Future
                          </Badge>
                        )}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className={isCurrent ? 'text-amber-400' : 'text-slate-400'}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Always visible summary */}
                    <div className="mt-4">
                      <p className="text-slate-200 text-sm mb-4 leading-relaxed">{cycle.overallInfluence}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="bg-green-500/10 border border-green-500/30 rounded-xl">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <h5 className="text-green-300 font-semibold text-sm">Opportunities</h5>
                            </div>
                            <ul className="space-y-1.5">
                              {cycle.opportunities.map((opp, i) => (
                                <li key={i} className="text-green-200 text-xs flex items-start gap-1.5">
                                  <span className="text-green-400 mt-0.5">•</span>
                                  <span>{opp}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-red-500/10 border border-red-500/30 rounded-xl">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <h5 className="text-red-300 font-semibold text-sm">Challenges</h5>
                            </div>
                            <ul className="space-y-1.5">
                              {cycle.challenges.map((challenge, i) => (
                                <li key={i} className="text-red-200 text-xs flex items-start gap-1.5">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  <span>{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Expanded Annual Breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-600/50">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              <h5 className="text-indigo-300 font-semibold text-sm">Annual Breakdown (10 Years)</h5>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                              {cycle.annualBreakdown.map((year, i) => {
                                const colors = getRatingColor(year.rating)
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    <Card className={`${colors.bg} border ${colors.border} rounded-lg overflow-hidden transition-transform`}>
                                      <CardContent className="p-2.5 text-center">
                                        <div className="text-xs font-bold mb-1 flex items-center justify-center gap-1">
                                          <span>{year.year}</span>
                                          <span className="text-base">{colors.emoji}</span>
                                        </div>
                                        <div className="text-xs mb-1 opacity-90">{year.animal}</div>
                                        <Badge variant="outline" className={`text-xs mb-1 ${colors.border} ${colors.text}`}>
                                          {year.element}
                                        </Badge>
                                        <div className={`text-xs mt-1 ${colors.text} font-medium`}>
                                          {year.influence}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        
        {/* Enhanced Legend */}
        <Card className="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-600/40 rounded-2xl">
          <CardContent className="p-5">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Year Rating Guide
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Very Favorable', color: getRatingColor('very-favorable'), description: 'Exceptional opportunities' },
                { label: 'Favorable', color: getRatingColor('favorable'), description: 'Good progress' },
                { label: 'Neutral', color: getRatingColor('neutral'), description: 'Steady state' },
                { label: 'Challenging', color: getRatingColor('challenging'), description: 'Requires care' },
                { label: 'Very Challenging', color: getRatingColor('very-challenging'), description: 'Exercise caution' }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl border-2 ${item.color.border} ${item.color.bg} flex items-center justify-center text-2xl mb-2`}>
                    {item.color.emoji}
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </div>
  )
}

