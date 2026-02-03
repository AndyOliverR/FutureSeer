/**
 * Chinese Zodiac Wheel Component
 * Interactive 12 Animal Zodiac visualization
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star,
  Heart,
  Users,
  Shield,
  Zap,
  Target,
  Calendar,
  MapPin,
  Palette,
  Hash,
  Briefcase
} from 'lucide-react'
import { ChineseZodiac } from '@/lib/chinese/chineseAstrologyService'
import { 
  chineseAstrologyTheme,
  getZodiacColor,
  getChineseChartInlineStyles
} from '@/lib/chinese/chineseTheme'

interface ChineseZodiacWheelProps {
  zodiacAnimal: ChineseZodiac
  birthYear: number
  onAnimalClick?: (animal: string) => void
  showCompatibility?: boolean
  showElements?: boolean
}

interface ZodiacAnimal {
  name: string
  nameChinese: string
  element: string
  years: number[]
  personality: string[]
  strengths: string[]
  weaknesses: string[]
  career: string[]
  compatibility: string[]
  luckyColors: string[]
  luckyNumbers: number[]
  luckyDirections: string[]
  icon: string
  description: string
}

const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  {
    name: 'Rat',
    nameChinese: '鼠',
    element: 'water',
    years: [1900, 1912, 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020],
    personality: ['Intelligent', 'Adaptable', 'Quick-witted', 'Charming'],
    strengths: ['Resourceful', 'Versatile', 'Kind', 'Optimistic'],
    weaknesses: ['Greedy', 'Possessive', 'Suspicious', 'Stubborn'],
    career: ['Business', 'Finance', 'Politics', 'Writing'],
    compatibility: ['Dragon', 'Monkey', 'Ox'],
    luckyColors: ['Blue', 'Gold', 'Green'],
    luckyNumbers: [2, 3, 6, 8],
    luckyDirections: ['North', 'Northwest', 'West'],
    icon: '🐭',
    description: 'The Rat is the first animal in the Chinese zodiac cycle, symbolizing intelligence and adaptability.'
  },
  {
    name: 'Ox',
    nameChinese: '牛',
    element: 'earth',
    years: [1901, 1913, 1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021],
    personality: ['Diligent', 'Dependable', 'Strong', 'Determined'],
    strengths: ['Patient', 'Honest', 'Methodical', 'Persistent'],
    weaknesses: ['Stubborn', 'Conservative', 'Slow', 'Unforgiving'],
    career: ['Agriculture', 'Engineering', 'Medicine', 'Teaching'],
    compatibility: ['Snake', 'Rooster', 'Rat'],
    luckyColors: ['White', 'Yellow', 'Green'],
    luckyNumbers: [1, 4, 6, 9],
    luckyDirections: ['North', 'Northeast'],
    icon: '🐂',
    description: 'The Ox represents hard work, honesty, and determination in the Chinese zodiac.'
  },
  {
    name: 'Tiger',
    nameChinese: '虎',
    element: 'wood',
    years: [1902, 1914, 1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022],
    personality: ['Brave', 'Confident', 'Competitive', 'Charismatic'],
    strengths: ['Courageous', 'Independent', 'Enthusiastic', 'Natural leader'],
    weaknesses: ['Impatient', 'Aggressive', 'Self-centered', 'Impulsive'],
    career: ['Leadership', 'Military', 'Sports', 'Entertainment'],
    compatibility: ['Horse', 'Dog', 'Pig'],
    luckyColors: ['Blue', 'Gray', 'Orange'],
    luckyNumbers: [1, 3, 4, 6],
    luckyDirections: ['East', 'North', 'South'],
    icon: '🐅',
    description: 'The Tiger symbolizes courage, power, and unpredictability in Chinese culture.'
  },
  {
    name: 'Rabbit',
    nameChinese: '兔',
    element: 'wood',
    years: [1903, 1915, 1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023],
    personality: ['Gentle', 'Quiet', 'Elegant', 'Artistic'],
    strengths: ['Kind', 'Diplomatic', 'Patient', 'Talented'],
    weaknesses: ['Timid', 'Overly cautious', 'Pessimistic', 'Secretive'],
    career: ['Arts', 'Design', 'Counseling', 'Hospitality'],
    compatibility: ['Goat', 'Pig', 'Dog'],
    luckyColors: ['Red', 'Pink', 'Purple', 'Blue'],
    luckyNumbers: [3, 4, 6, 9],
    luckyDirections: ['East', 'South', 'Northwest'],
    icon: '🐰',
    description: 'The Rabbit represents gentleness, elegance, and artistic sensitivity.'
  },
  {
    name: 'Dragon',
    nameChinese: '龙',
    element: 'earth',
    years: [1904, 1916, 1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024],
    personality: ['Confident', 'Intelligent', 'Enthusiastic', 'Ambitious'],
    strengths: ['Charismatic', 'Successful', 'Innovative', 'Generous'],
    weaknesses: ['Arrogant', 'Impatient', 'Demanding', 'Intolerant'],
    career: ['Leadership', 'Innovation', 'Politics', 'Business'],
    compatibility: ['Monkey', 'Rat', 'Rooster'],
    luckyColors: ['Gold', 'Silver', 'Grayish white'],
    luckyNumbers: [1, 6, 7],
    luckyDirections: ['East', 'North', 'West'],
    icon: '🐉',
    description: 'The Dragon is the most powerful and auspicious animal in Chinese astrology.'
  },
  {
    name: 'Snake',
    nameChinese: '蛇',
    element: 'fire',
    years: [1905, 1917, 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025],
    personality: ['Enigmatic', 'Intelligent', 'Wise', 'Mysterious'],
    strengths: ['Intuitive', 'Graceful', 'Determined', 'Perceptive'],
    weaknesses: ['Jealous', 'Possessive', 'Secretive', 'Vain'],
    career: ['Philosophy', 'Psychology', 'Research', 'Finance'],
    compatibility: ['Ox', 'Rooster', 'Monkey'],
    luckyColors: ['Black', 'Red', 'Yellow'],
    luckyNumbers: [2, 8, 9],
    luckyDirections: ['Southwest', 'West', 'Northwest'],
    icon: '🐍',
    description: 'The Snake symbolizes wisdom, intuition, and transformation in Chinese culture.'
  },
  {
    name: 'Horse',
    nameChinese: '马',
    element: 'fire',
    years: [1906, 1918, 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026],
    personality: ['Energetic', 'Independent', 'Free-spirited', 'Adventurous'],
    strengths: ['Enthusiastic', 'Talented', 'Perceptive', 'Flexible'],
    weaknesses: ['Impatient', 'Hot-tempered', 'Stubborn', 'Selfish'],
    career: ['Travel', 'Sports', 'Journalism', 'Sales'],
    compatibility: ['Tiger', 'Dog', 'Goat'],
    luckyColors: ['Brown', 'Yellow', 'Green'],
    luckyNumbers: [2, 3, 7, 8],
    luckyDirections: ['South', 'Northwest'],
    icon: '🐴',
    description: 'The Horse represents freedom, energy, and the spirit of adventure.'
  },
  {
    name: 'Goat',
    nameChinese: '羊',
    element: 'earth',
    years: [1907, 1919, 1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027],
    personality: ['Creative', 'Empathetic', 'Peaceful', 'Artistic'],
    strengths: ['Gentle', 'Caring', 'Intuitive', 'Creative'],
    weaknesses: ['Indecisive', 'Pessimistic', 'Overly emotional', 'Weak-willed'],
    career: ['Arts', 'Medicine', 'Teaching', 'Social work'],
    compatibility: ['Rabbit', 'Pig', 'Horse'],
    luckyColors: ['Brown', 'Red', 'Purple'],
    luckyNumbers: [2, 7, 8],
    luckyDirections: ['Southwest', 'North'],
    icon: '🐐',
    description: 'The Goat symbolizes creativity, empathy, and artistic sensitivity.'
  },
  {
    name: 'Monkey',
    nameChinese: '猴',
    element: 'metal',
    years: [1908, 1920, 1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028],
    personality: ['Intelligent', 'Witty', 'Inventive', 'Versatile'],
    strengths: ['Clever', 'Innovative', 'Confident', 'Enthusiastic'],
    weaknesses: ['Arrogant', 'Jealous', 'Suspicious', 'Impatient'],
    career: ['Technology', 'Entertainment', 'Finance', 'Research'],
    compatibility: ['Dragon', 'Rat', 'Snake'],
    luckyColors: ['White', 'Blue', 'Gold'],
    luckyNumbers: [4, 9],
    luckyDirections: ['North', 'Northwest', 'West'],
    icon: '🐒',
    description: 'The Monkey represents intelligence, wit, and innovation in Chinese astrology.'
  },
  {
    name: 'Rooster',
    nameChinese: '鸡',
    element: 'metal',
    years: [1909, 1921, 1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029],
    personality: ['Honest', 'Observant', 'Hardworking', 'Punctual'],
    strengths: ['Diligent', 'Brave', 'Confident', 'Resourceful'],
    weaknesses: ['Critical', 'Perfectionist', 'Stubborn', 'Impatient'],
    career: ['Management', 'Public service', 'Journalism', 'Law'],
    compatibility: ['Ox', 'Snake', 'Dragon'],
    luckyColors: ['Gold', 'Brown', 'Yellow'],
    luckyNumbers: [5, 7, 8],
    luckyDirections: ['South', 'Southeast'],
    icon: '🐓',
    description: 'The Rooster symbolizes punctuality, hard work, and honesty.'
  },
  {
    name: 'Dog',
    nameChinese: '狗',
    element: 'earth',
    years: [1910, 1922, 1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030],
    personality: ['Loyal', 'Honest', 'Cautious', 'Faithful'],
    strengths: ['Loyal', 'Brave', 'Responsible', 'Intelligent'],
    weaknesses: ['Pessimistic', 'Stubborn', 'Critical', 'Worrying'],
    career: ['Security', 'Teaching', 'Counseling', 'Public service'],
    compatibility: ['Tiger', 'Horse', 'Rabbit'],
    luckyColors: ['Green', 'Red', 'Purple'],
    luckyNumbers: [3, 4, 9],
    luckyDirections: ['East', 'South', 'North'],
    icon: '🐕',
    description: 'The Dog represents loyalty, honesty, and protection in Chinese culture.'
  },
  {
    name: 'Pig',
    nameChinese: '猪',
    element: 'water',
    years: [1911, 1923, 1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031],
    personality: ['Compassionate', 'Generous', 'Diligent', 'Peaceful'],
    strengths: ['Kind', 'Honest', 'Patient', 'Determined'],
    weaknesses: ['Naive', 'Overly trusting', 'Materialistic', 'Stubborn'],
    career: ['Healthcare', 'Social work', 'Agriculture', 'Entertainment'],
    compatibility: ['Rabbit', 'Goat', 'Tiger'],
    luckyColors: ['Yellow', 'Gray', 'Brown', 'Gold'],
    luckyNumbers: [2, 5, 8],
    luckyDirections: ['North', 'Northeast'],
    icon: '🐷',
    description: 'The Pig represents compassion, generosity, and abundance in Chinese astrology.'
  }
]

export default function ChineseZodiacWheel({
  zodiacAnimal,
  birthYear,
  onAnimalClick,
  showCompatibility = true,
  showElements = true
}: ChineseZodiacWheelProps) {
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'wheel' | 'compatibility' | 'details'>('wheel')

  // Get animal data
  const getAnimalData = (animalName: string) => {
    return ZODIAC_ANIMALS.find(animal => 
      animal.name.toLowerCase() === animalName.toLowerCase()
    )
  }

  // Calculate animal positions in circle
  const animalPositions = useMemo(() => {
    const centerX = 300
    const centerY = 300
    const radius = 200
    
    return ZODIAC_ANIMALS.map((animal, index) => {
      const angle = (index * 30) - 90 // Start from top, 30 degrees apart
      const radian = (angle * Math.PI) / 180
      
      return {
        ...animal,
        x: centerX + radius * Math.cos(radian),
        y: centerY + radius * Math.sin(radian),
        angle
      }
    })
  }, [])

  // Get compatibility between animals
  const getCompatibility = (animal1: string, animal2: string) => {
    const animalData = getAnimalData(animal1)
    if (!animalData) return 'unknown'
    
    if (animalData.compatibility.includes(animal2)) return 'excellent'
    return 'neutral'
  }

  const currentAnimal = getAnimalData(zodiacAnimal.animal)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-700" />
            Chinese Zodiac Wheel (十二生肖)
          </CardTitle>
          <p className="text-slate-700 text-sm">
            The 12 animals of the Chinese zodiac cycle
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="wheel" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Zodiac Wheel
              </TabsTrigger>
              <TabsTrigger 
                value="compatibility" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Compatibility
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all"
              >
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wheel" className="space-y-6 mt-6">
              {/* Zodiac Wheel */}
              <div className="flex justify-center">
                <div className="relative">
                  <motion.svg
                    width={600}
                    height={600}
                    viewBox="0 0 600 600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="drop-shadow-xl"
                  >
                    {/* Gradient Definitions */}
                    <defs>
                      <radialGradient id="zodiacGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(255, 215, 0, 0.1)" />
                        <stop offset="100%" stopColor="rgba(220, 20, 60, 0.05)" />
                      </radialGradient>
                      
                      <filter id="animalGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background Circle */}
                    <circle 
                      cx="300" 
                      cy="300" 
                      r="250" 
                      fill="url(#zodiacGradient)" 
                      stroke={chineseAstrologyTheme.colors.primary}
                      strokeWidth="3"
                      opacity="0.3"
                    />

                    {/* Inner Circle */}
                    <circle 
                      cx="300" 
                      cy="300" 
                      r="150" 
                      fill="none" 
                      stroke={chineseAstrologyTheme.colors.secondary}
                      strokeWidth="2"
                      opacity="0.5"
                    />

                    {/* Animal Symbols */}
                    {animalPositions.map((animal, index) => {
                      const isCurrentAnimal = animal.name === zodiacAnimal.animal
                      const isHovered = hoveredAnimal === animal.name
                      const isSelected = selectedAnimal === animal.name
                      
                      return (
                        <motion.g
                          key={animal.name}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onMouseEnter={() => setHoveredAnimal(animal.name)}
                          onMouseLeave={() => setHoveredAnimal(null)}
                          onClick={() => {
                            setSelectedAnimal(isSelected ? null : animal.name)
                            if (onAnimalClick) onAnimalClick(animal.name)
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Animal Glow Effect */}
                          {(isHovered || isCurrentAnimal) && (
                            <circle
                              cx={animal.x}
                              cy={animal.y}
                              r="35"
                              fill="none"
                              stroke={isCurrentAnimal ? chineseAstrologyTheme.colors.primary : chineseAstrologyTheme.colors.secondary}
                              strokeWidth="3"
                              opacity="0.5"
                              filter="url(#animalGlow)"
                            />
                          )}

                          {/* Animal Background */}
                          <circle
                            cx={animal.x}
                            cy={animal.y}
                            r="25"
                            fill={isCurrentAnimal ? chineseAstrologyTheme.colors.primary : 
                                  isSelected ? chineseAstrologyTheme.colors.secondary : 
                                  'rgba(30, 41, 59, 0.8)'}
                            stroke={getZodiacColor(animal.name)}
                            strokeWidth="2"
                            opacity={isCurrentAnimal ? 1 : 0.8}
                          />

                          {/* Animal Icon */}
                          <text
                            x={animal.x}
                            y={animal.y + 8}
                            textAnchor="middle"
                            fontSize="20"
                            fill={isCurrentAnimal ? 'white' : getZodiacColor(animal.name)}
                          >
                            {animal.icon}
                          </text>

                          {/* Animal Name */}
                          <text
                            x={animal.x}
                            y={animal.y - 35}
                            textAnchor="middle"
                            fontSize="12"
                            fill={chineseAstrologyTheme.colors.secondary}
                            fontWeight="bold"
                            style={{ fontFamily: chineseAstrologyTheme.typography.englishFont }}
                          >
                            {animal.name}
                          </text>

                          {/* Chinese Name */}
                          <text
                            x={animal.x}
                            y={animal.y - 45}
                            textAnchor="middle"
                            fontSize="14"
                            fill={chineseAstrologyTheme.colors.primary}
                            fontWeight="bold"
                            style={{ fontFamily: chineseAstrologyTheme.typography.chineseFont }}
                          >
                            {animal.nameChinese}
                          </text>

                          {/* Birth Years */}
                          <text
                            x={animal.x}
                            y={animal.y + 35}
                            textAnchor="middle"
                            fontSize="10"
                            fill={chineseAstrologyTheme.colors.secondary}
                          >
                            {animal.years.slice(-3).join(', ')}
                          </text>
                        </motion.g>
                      )
                    })}

                    {/* Central Title */}
                    <text
                      x="300"
                      y="280"
                      textAnchor="middle"
                      fontSize="24"
                      fill={chineseAstrologyTheme.colors.primary}
                      fontWeight="bold"
                      style={{ fontFamily: chineseAstrologyTheme.typography.chineseFont }}
                    >
                      十二生肖
                    </text>
                    
                    <text
                      x="300"
                      y="305"
                      textAnchor="middle"
                      fontSize="16"
                      fill={chineseAstrologyTheme.colors.secondary}
                      fontWeight="normal"
                      style={{ fontFamily: chineseAstrologyTheme.typography.englishFont }}
                    >
                      Chinese Zodiac
                    </text>

                    {/* Current Animal Highlight */}
                    {currentAnimal && (
                      <text
                        x="300"
                        y="330"
                        textAnchor="middle"
                        fontSize="18"
                        fill={chineseAstrologyTheme.colors.secondary}
                        fontWeight="bold"
                      >
                        Your Animal: {currentAnimal.icon} {currentAnimal.name} ({currentAnimal.nameChinese})
                      </text>
                    )}
                  </motion.svg>
                </div>
              </div>

              {/* Animal Information */}
              {hoveredAnimal && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 max-w-md">
                    <CardContent className="p-4">
                      {(() => {
                        const animal = getAnimalData(hoveredAnimal)
                        if (!animal) return null
                        
                        return (
                          <div className="text-center space-y-2">
                            <div className="text-3xl mb-2">{animal.icon}</div>
                            <h3 className="text-xl font-bold text-amber-300">
                              {animal.name} ({animal.nameChinese})
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {animal.description}
                            </p>
                            <div className="flex justify-center gap-2 mt-3">
                              <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                                {animal.element}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {animal.years.slice(-2).join(', ')}
                              </Badge>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="compatibility" className="space-y-6 mt-6">
              {currentAnimal && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ZODIAC_ANIMALS.map((animal, index) => {
                    const compatibility = getCompatibility(zodiacAnimal.animal, animal.name)
                    const isCurrent = animal.name === zodiacAnimal.animal
                    
                    if (isCurrent) return null
                    
                    return (
                      <motion.div
                        key={animal.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`transition-all duration-300 ${
                          compatibility === 'excellent' ? 'bg-green-500/10 border-green-500/30' :
                          'bg-slate-900/40 border-slate-700/50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{animal.icon}</span>
                              <div>
                                <h4 className="font-semibold text-white">
                                  {animal.name}
                                </h4>
                                <p className="text-slate-400 text-sm">
                                  {animal.nameChinese}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  compatibility === 'excellent' ? 'border-green-500/30 text-green-300' :
                                  'border-slate-600 text-slate-300'
                                }`}
                              >
                                {compatibility === 'excellent' ? 'Excellent Match' : 'Neutral'}
                              </Badge>
                              
                              <p className="text-sm text-slate-400">
                                {compatibility === 'excellent' ? 
                                  'Strong compatibility and harmony' : 
                                  'Compatibility depends on other factors'
                                }
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {currentAnimal && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personality & Traits */}
                  <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-purple-700" />
                        Personality & Traits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnimal.strengths.map((strength, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-green-500/30 text-green-300"
                            >
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Weaknesses</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnimal.weaknesses.map((weakness, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-red-500/30 text-red-300"
                            >
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lucky Elements */}
                  <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-700" />
                        Lucky Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Lucky Colors</h4>
                        <div className="flex gap-2">
                          {currentAnimal.luckyColors.map((color, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                              <span className="text-sm text-slate-300">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Lucky Numbers</h4>
                        <div className="flex gap-2">
                          {currentAnimal.luckyNumbers.map((number, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-amber-500/30 text-amber-300"
                            >
                              {number}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Lucky Directions</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnimal.luckyDirections.map((direction, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-slate-600 text-slate-300"
                            >
                              {direction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Career & Compatibility */}
                  <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-700" />
                        Career & Compatibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Suitable Careers</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnimal.career.map((career, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-blue-500/30 text-blue-300"
                            >
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-amber-200 font-semibold mb-2">Best Compatibility</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnimal.compatibility.map((animal, index) => {
                            const animalData = getAnimalData(animal)
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-lg">{animalData?.icon}</span>
                                <Badge 
                                  variant="outline" 
                                  className="border-green-500/30 text-green-300"
                                >
                                  {animal}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
