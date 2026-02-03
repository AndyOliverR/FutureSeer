"use client"

import { BaziChart } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Sparkles } from "lucide-react"

interface BaziFourPillarsChartProps {
  chart: BaziChart
}

// Element color mappings for devotionist styling
const elementColors = {
  'Wood': { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', glow: 'shadow-green-500/20' },
  'Fire': { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', glow: 'shadow-red-500/20' },
  'Earth': { bg: 'bg-yellow-500/20', border: 'border-yellow-600/40', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  'Metal': { bg: 'bg-gray-400/20', border: 'border-gray-400/40', text: 'text-gray-300', glow: 'shadow-gray-400/20' },
  'Water': { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-blue-500/20' }
}

const getElementStyle = (element: string) => {
  return elementColors[element as keyof typeof elementColors] || elementColors['Metal']
}

export function BaziFourPillarsChart({ chart }: BaziFourPillarsChartProps) {
  const pillars = [
    { 
      pillar: chart.yearPillar, 
      label: 'Year Pillar', 
      icon: '📅', 
      description: 'Ancestral energy and family background',
      tooltip: 'Represents your ancestry, early childhood (0-15 years), and inherited traits'
    },
    { 
      pillar: chart.monthPillar, 
      label: 'Month Pillar', 
      icon: '🌙', 
      description: 'Parental influence and early development',
      tooltip: 'Represents your parents, youth (16-30 years), career foundation, and social relationships'
    },
    { 
      pillar: chart.dayPillar, 
      label: 'Day Pillar', 
      icon: '☀️', 
      description: 'Core self and Day Master',
      tooltip: 'The Day Master (Day Stem) is YOU - your core personality, spouse/partner, and prime years (31-45)'
    },
    { 
      pillar: chart.hourPillar, 
      label: 'Hour Pillar', 
      icon: '⏰', 
      description: 'Legacy and later life',
      tooltip: 'Represents your children, legacy, later years (46+), and life outcomes'
    }
  ]

  return (
    <div className="space-y-6">
      <CardContent className="p-0">
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map(({ pillar, label, icon, description, tooltip }) => {
              const stemStyle = getElementStyle(pillar.heavenlyStem.element)
              const branchStyle = getElementStyle(pillar.earthlyBranch.element)
              
              return (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Card className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 ${stemStyle.border} hover:${stemStyle.glow} hover:shadow-lg transition-all duration-300 rounded-2xl cursor-help`}>
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2 drop-shadow-lg">{icon}</div>
                          <div className="text-sm text-amber-300 font-bold mb-1 flex items-center justify-center gap-1">
                            {label}
                            <Info className="w-3 h-3 text-amber-400/60" />
                          </div>
                          <div className="text-xs text-slate-400 leading-tight">{description}</div>
                        </div>
                        
                        {/* Heavenly Stem */}
                        <div className={`mb-4 pb-4 border-b-2 ${stemStyle.border} rounded-lg p-3 ${stemStyle.bg}`}>
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-2 font-semibold tracking-wide">HEAVENLY STEM (天干)</div>
                            <div className="text-2xl font-bold text-white mb-2">{pillar.heavenlyStem.name}</div>
                            <Badge className={`${stemStyle.bg} ${stemStyle.text} border ${stemStyle.border} mb-2`}>
                              {pillar.heavenlyStem.element}
                            </Badge>
                            <div className="flex items-center justify-center gap-2 text-xs mt-2">
                              <span className={`px-2 py-1 rounded ${pillar.heavenlyStem.yinYang === 'yang' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                {pillar.heavenlyStem.yinYang === 'yang' ? '☀ Yang' : '☾ Yin'}
                              </span>
                              <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                                {pillar.heavenlyStem.strength}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Earthly Branch */}
                        <div className={`rounded-lg p-3 ${branchStyle.bg}`}>
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-2 font-semibold tracking-wide">EARTHLY BRANCH (地支)</div>
                            <div className="text-2xl font-bold text-white mb-2">{pillar.earthlyBranch.name}</div>
                            <Badge className={`${branchStyle.bg} ${branchStyle.text} border ${branchStyle.border} mb-1`}>
                              {pillar.earthlyBranch.element}
                            </Badge>
                            <div className="text-sm text-amber-300 mb-2">🐾 {pillar.earthlyBranch.animal}</div>
                            <div className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300 inline-block">
                              {pillar.earthlyBranch.strength}%
                            </div>
                            
                            {/* Hidden Stems */}
                            {pillar.earthlyBranch.hiddenStems.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-600/30">
                                <div className="text-xs text-slate-500 mb-2 flex items-center justify-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Hidden Stems
                                </div>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                  {pillar.earthlyBranch.hiddenStems.map((stem, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-slate-800/80 rounded-md text-slate-300 border border-slate-700">
                                      {stem}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-slate-900 border-amber-500/50 text-slate-100">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>
        
        {/* Day Master Highlight - Enhanced */}
        <Card className="mt-6 bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-amber-900/30 rounded-full border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300 font-bold tracking-wide">DAY MASTER 日主</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{chart.dayMaster.name}</div>
              <Badge className={`text-lg px-4 py-1.5 mb-3 ${getElementStyle(chart.dayMaster.element).bg} ${getElementStyle(chart.dayMaster.element).text} border-2 ${getElementStyle(chart.dayMaster.element).border}`}>
                {chart.dayMaster.element} Element
              </Badge>
              <div className="inline-block px-3 py-1.5 rounded-lg mb-4 bg-slate-800/50 border border-slate-700">
                <span className="text-sm text-slate-300">
                  {chart.dayMaster.yinYang === 'yang' ? '☀ Yang' : '☾ Yin'} Energy
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto">
                The <span className="font-semibold text-amber-300">Day Master</span> (Day Heavenly Stem) represents your <span className="font-semibold">core self, essence, and personality</span>. 
                It is the most crucial element in your BaZi chart, revealing how you interact with the world and process life experiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </div>
  )
}

