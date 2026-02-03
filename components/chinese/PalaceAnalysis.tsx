/**
 * Palace Analysis Component
 * Detailed interpretations of the 12 palaces in Zi Wei Dou Shu
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  Home, 
  Users, 
  Heart, 
  Baby, 
  DollarSign,
  Activity,
  Plane,
  UserCheck,
  Briefcase,
  Building,
  Sparkles,
  UserPlus
} from 'lucide-react'
import { Palace, Star as StarType } from '@/lib/chinese/chineseAstrologyService'
import { 
  chineseAstrologyTheme,
  getStarColor,
  getPalaceColor,
  getElementColor
} from '@/lib/chinese/chineseTheme'

interface PalaceAnalysisProps {
  palaces: Palace[]
  mainStars: StarType[]
  supportingStars: StarType[]
  onStarClick?: (star: StarType) => void
}

const PALACE_INFO = [
  {
    id: 0,
    name: 'Life Palace',
    nameChinese: '命宫',
    icon: Star,
    color: '#FFD700',
    description: 'The core of your personality and life path',
    aspects: ['Personality', 'Physical appearance', 'General life direction', 'Core self'],
    keywords: ['identity', 'self', 'personality', 'destiny'],
    significations: [
      'Your basic character and temperament',
      'Physical appearance and health constitution',
      'General life direction and purpose',
      'How you present yourself to the world',
      'Your natural talents and abilities'
    ]
  },
  {
    id: 1,
    name: 'Parents Palace',
    nameChinese: '父母宫',
    icon: UserPlus,
    color: '#8B4513',
    description: 'Relationships with parents and authority figures',
    aspects: ['Parents', 'Teachers', 'Mentors', 'Authority figures'],
    keywords: ['parents', 'authority', 'guidance', 'learning'],
    significations: [
      'Relationship with parents and family elders',
      'Educational opportunities and learning ability',
      'Relationships with teachers and mentors',
      'Connection to authority figures',
      'Inheritance and family legacy'
    ]
  },
  {
    id: 2,
    name: 'Fortune Palace',
    nameChinese: '福德宫',
    icon: Sparkles,
    color: '#9370DB',
    description: 'Spiritual blessings and inner happiness',
    aspects: ['Spirituality', 'Inner peace', 'Blessings', 'Fortune'],
    keywords: ['spirituality', 'blessings', 'fortune', 'inner peace'],
    significations: [
      'Spiritual development and religious inclination',
      'Inner happiness and contentment',
      'Blessings and good fortune',
      'Charitable nature and giving spirit',
      'Connection to higher consciousness'
    ]
  },
  {
    id: 3,
    name: 'Property Palace',
    nameChinese: '田宅宫',
    icon: Building,
    color: '#228B22',
    description: 'Real estate, home, and material possessions',
    aspects: ['Real estate', 'Home', 'Property', 'Material possessions'],
    keywords: ['property', 'home', 'real estate', 'possessions'],
    significations: [
      'Real estate investments and property matters',
      'Home environment and family residence',
      'Material possessions and wealth accumulation',
      'Land and property inheritance',
      'Stability in living situation'
    ]
  },
  {
    id: 4,
    name: 'Career Palace',
    nameChinese: '官禄宫',
    icon: Briefcase,
    color: '#4169E1',
    description: 'Professional life and social status',
    aspects: ['Career', 'Profession', 'Social status', 'Achievements'],
    keywords: ['career', 'profession', 'status', 'achievement'],
    significations: [
      'Professional career and work life',
      'Social status and reputation',
      'Leadership abilities and authority',
      'Achievements and recognition',
      'Relationship with superiors and colleagues'
    ]
  },
  {
    id: 5,
    name: 'Friendship Palace',
    nameChinese: '奴仆宫',
    icon: UserCheck,
    color: '#FF6347',
    description: 'Friends, helpers, and social relationships',
    aspects: ['Friends', 'Helpers', 'Social circle', 'Support network'],
    keywords: ['friends', 'helpers', 'social', 'support'],
    significations: [
      'Friendships and social relationships',
      'Helpers and supporters in life',
      'Social circle and networking',
      'Ability to work with others',
      'Service to others and community'
    ]
  },
  {
    id: 6,
    name: 'Travel Palace',
    nameChinese: '迁移宫',
    icon: Plane,
    color: '#87CEEB',
    description: 'Travel, relocation, and life changes',
    aspects: ['Travel', 'Relocation', 'Change', 'Movement'],
    keywords: ['travel', 'relocation', 'change', 'movement'],
    significations: [
      'Travel opportunities and experiences',
      'Relocation and moving to new places',
      'Life changes and transformations',
      'Foreign connections and international matters',
      'Adaptability to new environments'
    ]
  },
  {
    id: 7,
    name: 'Health Palace',
    nameChinese: '疾厄宫',
    icon: Activity,
    color: '#32CD32',
    description: 'Physical health and vitality',
    aspects: ['Health', 'Vitality', 'Physical condition', 'Wellness'],
    keywords: ['health', 'vitality', 'physical', 'wellness'],
    significations: [
      'Physical health and vitality',
      'Susceptibility to illness and disease',
      'Recovery ability and healing',
      'Physical constitution and stamina',
      'Relationship with medical practitioners'
    ]
  },
  {
    id: 8,
    name: 'Wealth Palace',
    nameChinese: '财帛宫',
    icon: DollarSign,
    color: '#FFD700',
    description: 'Money, wealth, and financial matters',
    aspects: ['Money', 'Wealth', 'Finance', 'Prosperity'],
    keywords: ['wealth', 'money', 'finance', 'prosperity'],
    significations: [
      'Financial wealth and money matters',
      'Ability to earn and accumulate wealth',
      'Investment opportunities and financial planning',
      'Relationship with money and material success',
      'Charitable giving and financial generosity'
    ]
  },
  {
    id: 9,
    name: 'Children Palace',
    nameChinese: '子女宫',
    icon: Baby,
    color: '#FF69B4',
    description: 'Children, creativity, and legacy',
    aspects: ['Children', 'Creativity', 'Legacy', 'Fertility'],
    keywords: ['children', 'creativity', 'legacy', 'fertility'],
    significations: [
      'Children and offspring',
      'Creative abilities and artistic expression',
      'Legacy and what you leave behind',
      'Fertility and reproductive health',
      'Mentorship and teaching others'
    ]
  },
  {
    id: 10,
    name: 'Marriage Palace',
    nameChinese: '夫妻宫',
    icon: Heart,
    color: '#DC143C',
    description: 'Romantic relationships and partnerships',
    aspects: ['Marriage', 'Partnership', 'Love', 'Relationships'],
    keywords: ['marriage', 'partnership', 'love', 'relationships'],
    significations: [
      'Marriage and romantic partnerships',
      'Love relationships and emotional connections',
      'Spouse characteristics and compatibility',
      'Relationship dynamics and harmony',
      'Commitment and loyalty in relationships'
    ]
  },
  {
    id: 11,
    name: 'Sibling Palace',
    nameChinese: '兄弟宫',
    icon: Users,
    color: '#FF8C00',
    description: 'Relationships with siblings and close friends',
    aspects: ['Siblings', 'Close friends', 'Peers', 'Competitors'],
    keywords: ['siblings', 'friends', 'peers', 'competition'],
    significations: [
      'Relationships with siblings and close relatives',
      'Close friendships and peer relationships',
      'Competition and rivalry',
      'Collaboration and teamwork',
      'Communication and social skills'
    ]
  }
]

export default function PalaceAnalysis({
  palaces,
  mainStars,
  supportingStars,
  onStarClick
}: PalaceAnalysisProps) {
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'stars' | 'interpretation'>('overview')

  // Get palace with detailed info
  const getPalaceWithInfo = (palaceIndex: number) => {
    const palace = palaces[palaceIndex]
    const info = PALACE_INFO[palaceIndex]
    return { palace, info }
  }

  // Calculate palace strength distribution
  const palaceStrengths = useMemo(() => {
    return palaces.map(palace => ({
      name: palace.englishName,
      strength: palace.strength,
      element: palace.element,
      starCount: palace.stars.length
    }))
  }, [palaces])

  // Get strongest and weakest palaces
  const strongestPalace = palaceStrengths.reduce((max, palace) => 
    palace.strength > max.strength ? palace : max
  )
  const weakestPalace = palaceStrengths.reduce((min, palace) => 
    palace.strength < min.strength ? palace : min
  )

  return (
    <div className="space-y-6">
      {/* Palace Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {palaces.map((palace, index) => {
          const info = PALACE_INFO[index]
          const Icon = info.icon
          const isSelected = selectedPalace === index
          
          return (
            <motion.div
              key={`palace-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-500 shadow-lg shadow-amber-500/20' 
                    : 'bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-purple-200 hover:border-amber-500/50'
                }`}
                onClick={() => setSelectedPalace(isSelected ? null : index)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: info.color }}
                    />
                    <div>
                      <h4 className={`font-semibold text-sm ${isSelected ? 'text-amber-900' : 'text-purple-900'}`}>
                        {info.name}
                      </h4>
                      <p className={`text-xs ${isSelected ? 'text-amber-800' : 'text-slate-700'}`}>
                        {info.nameChinese}
                      </p>
                    </div>
                    
                    {/* Palace Strength */}
                    <div className="w-full">
                      <div className={`flex justify-between text-xs mb-1 ${isSelected ? 'text-amber-800' : 'text-slate-700'}`}>
                        <span>Strength</span>
                        <span>{Math.round(palace.strength * 100)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isSelected ? 'bg-amber-200' : 'bg-purple-200'}`}>
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${palace.strength * 100}%`,
                            backgroundColor: getElementColor(palace.element)
                          }}
                        />
                      </div>
                    </div>

                    {/* Star Count */}
                    <Badge variant="outline" className={`text-xs ${isSelected ? 'border-amber-300 text-amber-800 bg-amber-50' : 'border-purple-300 text-purple-700 bg-purple-50'}`}>
                      {palace.stars.length} stars
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Palace Details */}
      <AnimatePresence>
        {selectedPalace !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const { info } = getPalaceWithInfo(selectedPalace)
                    const Icon = info.icon
                    return (
                      <>
                        <div className="p-3 rounded-full bg-purple-200/60 border border-purple-300">
                          <Icon className="w-6 h-6 text-purple-700" />
                        </div>
                        <div>
                          <CardTitle className="text-purple-900">
                            {info.name}
                          </CardTitle>
                          <p className="text-slate-700 text-sm">
                            {info.nameChinese}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stars" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
                    >
                      Stars
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interpretation" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
                    >
                      Interpretation
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {(() => {
                      const { palace, info } = getPalaceWithInfo(selectedPalace)
                      return (
                        <>
                          <p className="text-slate-700">
                            {info.description}
                          </p>
                          
                          <div>
                            <h4 className="text-purple-900 font-semibold mb-2">Key Aspects</h4>
                            <div className="flex flex-wrap gap-2">
                              {info.aspects.map((aspect, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="border-amber-300 text-amber-800 bg-amber-50"
                                >
                                  {aspect}
                                </Badge>
                              ))}
                            </div>
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
                          
                          <div>
                            <h4 className="text-purple-900 font-semibold mb-2">Palace Strength</h4>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm text-slate-700 mb-1">
                                  <span>Overall Strength</span>
                                  <span>{Math.round(palace.strength * 100)}%</span>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-3">
                                  <div 
                                    className="h-3 rounded-full transition-all duration-1000"
                                    style={{ 
                                      width: `${palace.strength * 100}%`,
                                      backgroundColor: getElementColor(palace.element)
                                    }}
                                  />
                                </div>
                              </div>
                              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                                {palace.element}
                              </Badge>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>
                  
                  <TabsContent value="stars" className="space-y-4 mt-4">
                    {(() => {
                      const { palace } = getPalaceWithInfo(selectedPalace)
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {palace.stars.map((star, index) => (
                              <motion.div
                                key={`star-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getStarColor(star.nature, star.type) }}
                                  />
                                  <h5 className="font-semibold text-purple-900">
                                    {star.nameChinese}
                                  </h5>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      star.nature === 'auspicious' ? 'border-green-300 text-green-700 bg-green-50' :
                                      star.nature === 'inauspicious' ? 'border-red-300 text-red-700 bg-red-50' :
                                      'border-blue-300 text-blue-700 bg-blue-50'
                                    }`}
                                  >
                                    {star.nature}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-700 mb-2">
                                  {star.interpretation}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {star.keywords.map((keyword, keywordIndex) => (
                                    <span 
                                      key={keywordIndex}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>
                  
                  <TabsContent value="interpretation" className="space-y-4 mt-4">
                    {(() => {
                      const { info } = getPalaceWithInfo(selectedPalace)
                      return (
                        <>
                          <div>
                            <h4 className="text-purple-900 font-semibold mb-3">Detailed Significations</h4>
                            <ul className="space-y-2">
                              {info.significations.map((signification, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700">
                                  <span className="text-purple-700 mt-1">•</span>
                                  <span>{signification}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-purple-900 font-semibold mb-3">Life Guidance</h4>
                            <div className="p-4 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                              <p className="text-slate-700 text-sm">
                                This palace indicates the areas of life where you should focus your energy. 
                                A strong {info.name.toLowerCase()} suggests natural abilities in these areas, 
                                while a weaker one may require more conscious effort and development.
                              </p>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palace Strength Summary */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900">Palace Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-purple-900 font-semibold mb-3">Strongest Palace</h4>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <Star className="w-5 h-5 text-green-700" />
                <div>
                  <p className="font-semibold text-green-900">{strongestPalace.name}</p>
                  <p className="text-sm text-slate-700">
                    Strength: {Math.round(strongestPalace.strength * 100)}% • 
                    Element: {strongestPalace.element} • 
                    Stars: {strongestPalace.starCount}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-purple-900 font-semibold mb-3">Weakest Palace</h4>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border-2 border-red-200">
                <Star className="w-5 h-5 text-red-700" />
                <div>
                  <p className="font-semibold text-red-900">{weakestPalace.name}</p>
                  <p className="text-sm text-slate-700">
                    Strength: {Math.round(weakestPalace.strength * 100)}% • 
                    Element: {weakestPalace.element} • 
                    Stars: {weakestPalace.starCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
