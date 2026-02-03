"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZodiacIcon } from '@/components/icons/AstrologyIcon'
import {
  User,
  DollarSign,
  MessageCircle,
  Home,
  Heart,
  Briefcase,
  Users,
  Skull,
  Plane,
  Trophy,
  Lightbulb,
  Waves
} from 'lucide-react'

export interface HouseDashboardProps {
  houses: any[]
  houseAnalysis?: Array<{ house: number; analysis: string }>
}

// House meanings and icons
const HOUSE_DATA = [
  { number: 1, name: 'Self & Identity', icon: User, theme: 'Persona, appearance, vitality', element: 'Fire' },
  { number: 2, name: 'Values & Resources', icon: DollarSign, theme: 'Money, possessions, self-worth', element: 'Earth' },
  { number: 3, name: 'Communication', icon: MessageCircle, theme: 'Siblings, learning, short trips', element: 'Air' },
  { number: 4, name: 'Home & Family', icon: Home, theme: 'Roots, foundation, private life', element: 'Water' },
  { number: 5, name: 'Creativity & Joy', icon: Heart, theme: 'Romance, children, self-expression', element: 'Fire' },
  { number: 6, name: 'Health & Service', icon: Briefcase, theme: 'Daily work, routines, wellness', element: 'Earth' },
  { number: 7, name: 'Partnerships', icon: Users, theme: 'Marriage, contracts, others', element: 'Air' },
  { number: 8, name: 'Transformation', icon: Skull, theme: 'Shared resources, death, rebirth', element: 'Water' },
  { number: 9, name: 'Philosophy & Travel', icon: Plane, theme: 'Higher learning, long journeys', element: 'Fire' },
  { number: 10, name: 'Career & Status', icon: Trophy, theme: 'Public life, achievements, legacy', element: 'Earth' },
  { number: 11, name: 'Community & Dreams', icon: Lightbulb, theme: 'Friends, hopes, social causes', element: 'Air' },
  { number: 12, name: 'Spirituality & Solitude', icon: Waves, theme: 'Hidden matters, karma, retreat', element: 'Water' }
]

// Get element color
function getElementColor(element: string) {
  const colors: Record<string, any> = {
    Fire: {
      bg: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-200/60',
      iconColor: 'text-orange-700'
    },
    Earth: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      iconBg: 'bg-green-200/60',
      iconColor: 'text-green-700'
    },
    Air: {
      bg: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-200/60',
      iconColor: 'text-cyan-700'
    },
    Water: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-200/60',
      iconColor: 'text-blue-700'
    }
  }
  return colors[element] || colors.Fire
}

export function HouseDashboard({ houses, houseAnalysis }: HouseDashboardProps) {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null)
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">The Twelve Houses</h3>
        <p className="text-slate-600 text-sm">
          Life areas and themes represented in your birth chart
        </p>
      </div>

      {/* House Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {HOUSE_DATA.map((houseData, index) => {
          const house = houses[index]
          const analysis = houseAnalysis?.find(h => h.house === houseData.number)
          const colors = getElementColor(houseData.element)
          const Icon = houseData.icon
          const isSelected = selectedHouse === houseData.number
          
          return (
            <motion.div
              key={houseData.number}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card 
                className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bg} hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer ${isSelected ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedHouse(isSelected ? null : houseData.number)}
              >
                <CardContent className="p-4">
                  {/* House Number Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {houseData.number}
                    </Badge>
                    {house && (
                      <div className="flex items-center gap-1">
                        <ZodiacIcon sign={house.sign?.signName || house.sign} size={16} />
                      </div>
                    )}
                  </div>
                  
                  {/* Icon */}
                  <div className={`${colors.iconBg} rounded-lg p-3 mb-3 inline-flex`}>
                    <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  
                  {/* Name */}
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    {houseData.name}
                  </h4>
                  
                  {/* Sign */}
                  {house && (
                    <div className="text-xs text-slate-600 mb-2">
                      {house.sign?.signName || house.sign}
                      {house.degree && ` ${house.degree.toFixed(1)}°`}
                    </div>
                  )}
                  
                  {/* Theme */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {houseData.theme}
                  </p>
                  
                  {/* Element Badge */}
                  <Badge 
                    variant="outline" 
                    className="mt-3 text-xs"
                  >
                    {houseData.element}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Selected House Analysis */}
      <AnimatePresence>
        {selectedHouse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardContent className="p-6">
                {(() => {
                  const houseData = HOUSE_DATA.find(h => h.number === selectedHouse)
                  const house = houses[selectedHouse - 1]
                  const analysis = houseAnalysis?.find(h => h.house === selectedHouse)
                  const Icon = houseData?.icon || User
                  
                  return (
                    <>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-purple-200/60 rounded-lg p-3">
                          <Icon className="w-8 h-8 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold text-purple-900">
                              {selectedHouse}th House
                            </h3>
                            <Badge className="bg-purple-200 text-purple-900">
                              {houseData?.element}
                            </Badge>
                          </div>
                          <h4 className="text-xl text-purple-800 mb-2">
                            {houseData?.name}
                          </h4>
                          {house && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <ZodiacIcon sign={house.sign?.signName || house.sign} size={20} />
                              <span className="font-semibold">
                                {house.sign?.signName || house.sign}
                              </span>
                              {house.degree && (
                                <span className="text-slate-500">
                                  {house.degree.toFixed(2)}°
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {analysis ? (
                        <div className="bg-white/60 rounded-lg p-4">
                          <h5 className="font-bold text-slate-800 mb-2">Analysis</h5>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {analysis.analysis}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white/60 rounded-lg p-4">
                          <p className="text-slate-700 leading-relaxed">
                            <strong>Theme:</strong> {houseData?.theme}
                          </p>
                          <p className="text-slate-600 text-sm mt-2">
                            Full analysis will be available once the comprehensive report is generated.
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setSelectedHouse(null)}
                        className="mt-4 text-sm text-purple-600 hover:text-purple-800 underline"
                      >
                        Close details
                      </button>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
