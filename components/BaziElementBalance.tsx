"use client"

import { BaziElements } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Activity, ArrowRight, Info, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

interface BaziElementBalanceProps {
  elements: BaziElements
  dayMasterElement: string
}

// Element cycle relationships for Wu Xing (Five Elements Theory)
const elementCycles = {
  wood: {
    produces: 'Fire',
    producedBy: 'Water',
    controls: 'Earth',
    controlledBy: 'Metal',
    icon: '🌳'
  },
  fire: {
    produces: 'Earth',
    producedBy: 'Wood',
    controls: 'Metal',
    controlledBy: 'Water',
    icon: '🔥'
  },
  earth: {
    produces: 'Metal',
    producedBy: 'Fire',
    controls: 'Water',
    controlledBy: 'Wood',
    icon: '🏔️'
  },
  metal: {
    produces: 'Water',
    producedBy: 'Earth',
    controls: 'Wood',
    controlledBy: 'Fire',
    icon: '⚔️'
  },
  water: {
    produces: 'Wood',
    producedBy: 'Metal',
    controls: 'Fire',
    controlledBy: 'Earth',
    icon: '💧'
  }
}

export function BaziElementBalance({ elements, dayMasterElement }: BaziElementBalanceProps) {
  const elementData = [
    { 
      key: 'wood' as const, 
      name: 'Wood', 
      color: 'bg-green-500', 
      lightColor: 'bg-green-400',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      description: 'Growth, creativity, expansion',
      traits: 'Flexible, Growing, Generous'
    },
    { 
      key: 'fire' as const, 
      name: 'Fire', 
      color: 'bg-red-500', 
      lightColor: 'bg-red-400',
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
      description: 'Passion, energy, transformation',
      traits: 'Passionate, Dynamic, Radiant'
    },
    { 
      key: 'earth' as const, 
      name: 'Earth', 
      color: 'bg-yellow-600', 
      lightColor: 'bg-yellow-500',
      borderColor: 'border-yellow-600',
      textColor: 'text-yellow-400',
      description: 'Stability, nurturing, grounding',
      traits: 'Stable, Nurturing, Reliable'
    },
    { 
      key: 'metal' as const, 
      name: 'Metal', 
      color: 'bg-gray-400', 
      lightColor: 'bg-gray-300',
      borderColor: 'border-gray-400',
      textColor: 'text-gray-300',
      description: 'Precision, discipline, structure',
      traits: 'Precise, Strong, Structured'
    },
    { 
      key: 'water' as const, 
      name: 'Water', 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-400',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      description: 'Wisdom, flow, adaptability',
      traits: 'Wise, Flowing, Adaptable'
    }
  ]

  const total = Object.values(elements).reduce((a, b) => a + b, 0)
  const dayMasterKey = dayMasterElement.toLowerCase() as keyof BaziElements

  return (
    <div className="space-y-6">
      <CardContent className="p-0">
        <TooltipProvider>
          <div className="space-y-5">
            {elementData.map(({ key, name, color, lightColor, borderColor, textColor, description, traits }, index) => {
              const count = elements[key]
              const percentage = total > 0 ? (count / total) * 100 : 0
              const isDayMaster = key === dayMasterKey
              const isStrong = percentage > 20
              const isWeak = percentage < 10
              const cycle = elementCycles[key]
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 ${borderColor}/40 hover:${borderColor}/60 transition-all duration-300 rounded-2xl cursor-help overflow-hidden`}>
                        <CardContent className="p-4">
                          {/* Element Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{cycle.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-bold ${textColor}`}>{name}</span>
                                  {isDayMaster && (
                                    <Badge className="bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs">
                                      Day Master
                                    </Badge>
                                  )}
                                  {isStrong && !isDayMaster && (
                                    <Badge className="bg-green-500/30 text-green-300 border border-green-500/50 text-xs flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      Strong
                                    </Badge>
                                  )}
                                  {isWeak && !isDayMaster && (
                                    <Badge className="bg-red-500/30 text-red-300 border border-red-500/50 text-xs flex items-center gap-1">
                                      <TrendingDown className="w-3 h-3" />
                                      Weak
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${textColor}`}>{count.toFixed(1)}</div>
                              <div className="text-xs text-slate-400">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          
                          {/* Animated Progress Bar */}
                          <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600/50">
                            <motion.div
                              className={`h-4 rounded-full ${lightColor} ${
                                isDayMaster ? 'ring-2 ring-amber-400 ring-inset shadow-lg shadow-amber-500/50' : ''
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                            />
                            {isDayMaster && (
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                              >
                                <span className="text-xs font-bold text-white drop-shadow-lg">YOUR CORE ELEMENT</span>
                              </motion.div>
                            )}
                          </div>
                          
                          {/* Element Traits */}
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <span>{traits}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm bg-slate-900 border-amber-500/50 text-slate-100 p-4">
                      <div className="space-y-2">
                        <div className="font-bold text-amber-300 mb-2">{name} Element Cycles</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">Produces →</span>
                          <span>{cycle.produces}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-400">Produced by →</span>
                          <span>{cycle.producedBy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-400">Controls →</span>
                          <span>{cycle.controls}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-400">Controlled by →</span>
                          <span>{cycle.controlledBy}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )
            })}
          </div>
        </TooltipProvider>
        
        {/* Enhanced Balance Assessment */}
        <Card className="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-amber-500/40 rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/40">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold mb-2 text-lg">Balance Assessment</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {total > 0 ? (
                    <>
                      Your chart shows a <span className="font-semibold text-amber-300">{Object.values(elements).some(v => v > 20) ? 'strongly unbalanced' : Object.values(elements).some(v => v > 15) ? 'moderately balanced' : 'well-balanced'}</span> element distribution. 
                      The <span className="font-semibold text-amber-300">{dayMasterElement}</span> element (Day Master) is your core energy signature.
                      {Object.values(elements).some(v => v < 5) && 
                        <span className="block mt-2 text-yellow-300">💡 Consider strengthening weak elements through favorable activities, colors, and directions to achieve better harmony.</span>
                      }
                      {Object.values(elements).some(v => v > 25) && 
                        <span className="block mt-2 text-orange-300">⚠️ Some elements are dominant. Balance can be achieved by engaging with their controlling elements.</span>
                      }
                    </>
                  ) : (
                    'Element balance calculation in progress...'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Wu Xing Cycle Diagram Reference */}
        <Card className="mt-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-2 border-indigo-500/30 rounded-2xl">
          <CardContent className="p-4">
            <div className="text-center">
              <h5 className="text-indigo-300 font-semibold mb-2 text-sm">Wu Xing (五行) - Five Elements Theory</h5>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300 flex-wrap">
                <span className="px-2 py-1 bg-green-500/20 rounded border border-green-500/30">Wood 🌳</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-red-500/20 rounded border border-red-500/30">Fire 🔥</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-yellow-500/20 rounded border border-yellow-600/30">Earth 🏔️</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-gray-400/20 rounded border border-gray-400/30">Metal ⚔️</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-blue-500/20 rounded border border-blue-500/30">Water 💧</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-slate-400">...</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Production Cycle: Each element nourishes the next</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </div>
  )
}

