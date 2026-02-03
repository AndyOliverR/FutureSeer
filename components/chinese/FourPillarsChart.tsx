"use client"

/**
 * Four Pillars (Ba Zi) Chart Component
 * Visualization of the Four Pillars of Destiny
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Heart,
  Brain,
  Users,
  Home,
  Briefcase,
  Star
} from 'lucide-react'
import { FourPillars, ElementBalance } from '@/lib/chinese/chineseAstrologyService'
import { 
  chineseAstrologyTheme,
  getElementColor,
  getChineseChartInlineStyles
} from '@/lib/chinese/chineseTheme'

interface FourPillarsChartProps {
  fourPillars: FourPillars
  elementBalance: ElementBalance
  onPillarClick?: (pillar: string) => void
}

interface PillarDisplay {
  name: string
  nameChinese: string
  icon: React.ComponentType<any>
  color: string
  description: string
  significations: string[]
  keywords: string[]
}

const PILLAR_INFO: PillarDisplay[] = [
  {
    name: 'Year Pillar',
    nameChinese: '年柱',
    icon: Calendar,
    color: '#8B4513',
    description: 'Ancestral influences and family background',
    significations: [
      'Family heritage and ancestral influences',
      'Relationship with grandparents and elders',
      'Cultural and social background',
      'Early childhood environment',
      'Inherited traits and characteristics'
    ],
    keywords: ['ancestry', 'family', 'heritage', 'roots', 'tradition']
  },
  {
    name: 'Month Pillar',
    nameChinese: '月柱',
    icon: Users,
    color: '#4169E1',
    description: 'Family relationships and parental influences',
    significations: [
      'Relationship with parents and immediate family',
      'Educational background and early learning',
      'Social status and family reputation',
      'Support from family and relatives',
      'Family dynamics and relationships'
    ],
    keywords: ['parents', 'family', 'education', 'support', 'status']
  },
  {
    name: 'Day Pillar',
    nameChinese: '日柱',
    icon: Star,
    color: '#FFD700',
    description: 'Self and spouse characteristics',
    significations: [
      'Core personality and self-identity',
      'Spouse characteristics and marriage potential',
      'Personal relationships and partnerships',
      'Individual talents and abilities',
      'Personal goals and aspirations'
    ],
    keywords: ['self', 'spouse', 'personality', 'relationships', 'identity']
  },
  {
    name: 'Hour Pillar',
    nameChinese: '時柱',
    icon: Clock,
    color: '#9370DB',
    description: 'Children and later life influences',
    significations: [
      'Children and offspring characteristics',
      'Later life fortune and destiny',
      'Career development and achievements',
      'Legacy and what you leave behind',
      'Relationship with younger generations'
    ],
    keywords: ['children', 'future', 'legacy', 'career', 'destiny']
  }
]

const ELEMENT_INFO = {
  wood: {
    name: 'Wood',
    nameChinese: '木',
    color: '#228B22',
    icon: '🌳',
    traits: ['Growth', 'Flexibility', 'Creativity', 'Expansion'],
    directions: ['East', 'Southeast'],
    seasons: ['Spring'],
    organs: ['Liver', 'Gallbladder'],
    emotions: ['Anger', 'Frustration'],
    virtues: ['Kindness', 'Benevolence']
  },
  fire: {
    name: 'Fire',
    nameChinese: '火',
    color: '#FF4500',
    icon: '🔥',
    traits: ['Passion', 'Energy', 'Leadership', 'Transformation'],
    directions: ['South'],
    seasons: ['Summer'],
    organs: ['Heart', 'Small Intestine'],
    emotions: ['Joy', 'Excitement'],
    virtues: ['Respect', 'Courtesy']
  },
  earth: {
    name: 'Earth',
    nameChinese: '土',
    color: '#8B4513',
    icon: '🏔️',
    traits: ['Stability', 'Nurturing', 'Practicality', 'Patience'],
    directions: ['Center', 'Southwest', 'Northeast'],
    seasons: ['Late Summer'],
    organs: ['Spleen', 'Stomach'],
    emotions: ['Worry', 'Anxiety'],
    virtues: ['Faithfulness', 'Trust']
  },
  metal: {
    name: 'Metal',
    nameChinese: '金',
    color: '#C0C0C0',
    icon: '⚔️',
    traits: ['Precision', 'Strength', 'Discipline', 'Clarity'],
    directions: ['West', 'Northwest'],
    seasons: ['Autumn'],
    organs: ['Lungs', 'Large Intestine'],
    emotions: ['Grief', 'Sadness'],
    virtues: ['Righteousness', 'Justice']
  },
  water: {
    name: 'Water',
    nameChinese: '水',
    color: '#000080',
    icon: '💧',
    traits: ['Wisdom', 'Adaptability', 'Flow', 'Intuition'],
    directions: ['North'],
    seasons: ['Winter'],
    organs: ['Kidneys', 'Bladder'],
    emotions: ['Fear', 'Anxiety'],
    virtues: ['Wisdom', 'Intelligence']
  }
}

export default function FourPillarsChart({
  fourPillars,
  elementBalance,
  onPillarClick
}: FourPillarsChartProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pillars' | 'elements' | 'balance'>('pillars')

  // Calculate element distribution
  const elementDistribution = useMemo(() => {
    const total = elementBalance.wood + elementBalance.fire + elementBalance.earth + 
                  elementBalance.metal + elementBalance.water
    
    return {
      wood: { count: elementBalance.wood, percentage: (elementBalance.wood / total) * 100 },
      fire: { count: elementBalance.fire, percentage: (elementBalance.fire / total) * 100 },
      earth: { count: elementBalance.earth, percentage: (elementBalance.earth / total) * 100 },
      metal: { count: elementBalance.metal, percentage: (elementBalance.metal / total) * 100 },
      water: { count: elementBalance.water, percentage: (elementBalance.water / total) * 100 }
    }
  }, [elementBalance])

  // Get pillar data
  const getPillarData = (pillarName: string) => {
    const pillar = fourPillars[pillarName as keyof FourPillars]
    const info = PILLAR_INFO.find(p => p.name.toLowerCase().includes(pillarName.toLowerCase()))
    return { pillar, info }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-700" />
            Four Pillars of Destiny (八字)
          </CardTitle>
          <p className="text-slate-700 text-sm">
            The Four Pillars represent the fundamental energies of your birth chart
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="pillars" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Pillars
              </TabsTrigger>
              <TabsTrigger 
                value="elements" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Elements
              </TabsTrigger>
              <TabsTrigger 
                value="balance" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Balance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pillars" className="space-y-6 mt-6">
              {/* Four Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(fourPillars).map(([pillarName, pillarData], index) => {
                  if (!pillarData || typeof pillarData !== 'object') return null
                  
                  // Find matching pillar info by name
                  // Map pillar names: 'year' -> 'Year Pillar', 'month' -> 'Month Pillar', etc.
                  const pillarNameMap: Record<string, number> = {
                    'year': 0,
                    'month': 1,
                    'day': 2,
                    'hour': 3
                  }
                  
                  const pillarIndex = pillarNameMap[pillarName.toLowerCase()] ?? index
                  const info = PILLAR_INFO[pillarIndex]
                  
                  // Safety check - if info doesn't exist, skip this pillar
                  if (!info || !info.icon) {
                    console.warn(`Pillar info not found for: ${pillarName} at index ${pillarIndex}`)
                    return null
                  }
                  
                  const Icon = info.icon
                  const isSelected = selectedPillar === pillarName
                  
                  return (
                    <motion.div
                      key={pillarName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-500 shadow-lg shadow-amber-500/20' 
                            : 'bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 hover:border-amber-500/50'
                        }`}
                        onClick={() => {
                          setSelectedPillar(isSelected ? null : pillarName)
                          if (onPillarClick) onPillarClick(pillarName)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Icon 
                              className="w-8 h-8" 
                              style={{ color: info.color }}
                            />
                            
                            <div>
                              <h4 className={`font-semibold ${isSelected ? 'text-amber-900' : 'text-purple-900'}`}>
                                {info.name}
                              </h4>
                              <p className={`text-sm ${isSelected ? 'text-amber-800' : 'text-slate-700'}`}>
                                {info.nameChinese}
                              </p>
                            </div>
                            
                            {/* Heavenly Stem */}
                            <div className={`w-full p-2 rounded border ${isSelected ? 'bg-amber-50/80 border-amber-300' : 'bg-gradient-to-br from-purple-50/60 to-amber-50/60 border-purple-200'}`}>
                              <p className={`text-xs mb-1 ${isSelected ? 'text-amber-800' : 'text-slate-600'}`}>Heavenly Stem</p>
                              <p className={`text-lg font-bold ${isSelected ? 'text-amber-900' : 'text-purple-900'}`}>
                                {pillarData.heavenlyStem}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-amber-800' : 'text-slate-600'}`}>
                                {pillarData.element}
                              </p>
                            </div>
                            
                            {/* Earthly Branch */}
                            <div className={`w-full p-2 rounded border ${isSelected ? 'bg-amber-50/80 border-amber-300' : 'bg-gradient-to-br from-purple-50/60 to-amber-50/60 border-purple-200'}`}>
                              <p className={`text-xs mb-1 ${isSelected ? 'text-amber-800' : 'text-slate-600'}`}>Earthly Branch</p>
                              <p className={`text-lg font-bold ${isSelected ? 'text-amber-900' : 'text-purple-900'}`}>
                                {pillarData.earthlyBranch}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-amber-800' : 'text-slate-600'}`}>
                                {pillarData.element}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Pillar Details */}
              {selectedPillar && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardContent className="p-6">
                      {(() => {
                        const { pillar, info } = getPillarData(selectedPillar)
                        if (!pillar || !info) return null
                        
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <info.icon className="w-6 h-6" style={{ color: info.color }} />
                              <div>
                                <h3 className="text-xl font-bold text-purple-900">
                                  {info.name}
                                </h3>
                                <p className="text-slate-700">
                                  {info.nameChinese}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-slate-700">
                              {info.description}
                            </p>
                            
                            <div>
                              <h4 className="text-purple-900 font-semibold mb-2">Key Significations</h4>
                              <ul className="space-y-1">
                                {info.significations.map((signification, index) => (
                                  <li key={index} className="flex items-start gap-2 text-slate-700">
                                    <span className="text-purple-700 mt-1">•</span>
                                    <span className="text-sm">{signification}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-purple-900 font-semibold mb-2">Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {info.keywords.map((keyword, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="border-purple-300 text-purple-700 bg-purple-50"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="elements" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ELEMENT_INFO).map(([elementName, elementData], index) => (
                  <motion.div
                    key={elementName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/40 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{elementData.icon}</span>
                          <div>
                            <h4 className="font-semibold text-white">
                              {elementData.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {elementData.nameChinese}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Traits</p>
                            <div className="flex flex-wrap gap-1">
                              {elementData.traits.map((trait, traitIndex) => (
                                <Badge 
                                  key={traitIndex} 
                                  variant="outline" 
                                  className="text-xs border-slate-600 text-slate-300"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Directions</p>
                            <p className="text-sm text-slate-300">
                              {elementData.directions.join(', ')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Season</p>
                            <p className="text-sm text-slate-300">
                              {elementData.seasons.join(', ')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Virtues</p>
                            <p className="text-sm text-slate-300">
                              {elementData.virtues.join(', ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Element Distribution Chart */}
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Element Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(elementDistribution).map(([elementName, data]) => {
                        const elementData = ELEMENT_INFO[elementName as keyof typeof ELEMENT_INFO]
                        return (
                          <div key={elementName} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{elementData.icon}</span>
                                <span className="font-medium text-purple-900">
                                  {elementData.name} ({elementData.nameChinese})
                                </span>
                              </div>
                              <span className="text-sm text-slate-700">
                                {data.count} ({data.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full transition-all duration-1000"
                                style={{ 
                                  width: `${data.percentage}%`,
                                  backgroundColor: getElementColor(elementName)
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Balance Analysis */}
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Balance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-2">Dominant Element</h4>
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                          <span className="text-2xl">
                            {ELEMENT_INFO[elementBalance.dominant as keyof typeof ELEMENT_INFO]?.icon}
                          </span>
                          <div>
                            <p className="font-semibold text-green-900">
                              {ELEMENT_INFO[elementBalance.dominant as keyof typeof ELEMENT_INFO]?.name}
                            </p>
                            <p className="text-sm text-slate-700">
                              Your strongest element - brings natural strengths
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-2">Weakest Element</h4>
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border-2 border-red-200">
                          <span className="text-2xl">
                            {ELEMENT_INFO[elementBalance.weak as keyof typeof ELEMENT_INFO]?.icon}
                          </span>
                          <div>
                            <p className="font-semibold text-red-900">
                              {ELEMENT_INFO[elementBalance.weak as keyof typeof ELEMENT_INFO]?.name}
                            </p>
                            <p className="text-sm text-slate-700">
                              Needs strengthening - focus on developing these qualities
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {elementBalance.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-700">
                              <span className="text-purple-700 mt-1">•</span>
                              <span className="text-sm">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
