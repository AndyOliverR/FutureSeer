"use client"

import { useMemo, useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { VisualTimeline } from '@/components/western/VisualTimeline'
import { ZodiacIcon, NumberIcon } from '@/components/icons/AstrologyIcon'
import { 
  extractChallengesAndOpportunities,
  textToBulletPoints,
  extractKeyInsights
} from '@/lib/utils/devotionistFormatter'
import { 
  Sun, 
  Hash, 
  User, 
  Sparkles,
  TrendingUp,
  Heart,
  Briefcase,
  Target,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Zap,
  Users
} from 'lucide-react'

interface AstroNumerologyTabProps {
  userId?: string
  birthDate?: string
  fullName?: string
  sunSign?: string
  analysis?: any
  cachedReport?: ComprehensiveAnalysis | { comprehensiveAnalysis?: ComprehensiveAnalysis; [key: string]: any } | null
  isLoadingReport?: boolean
}

interface ComprehensiveAnalysis {
  personalitySynthesis: string
  careerGuidance: string
  relationshipInsights: string
  lifePurpose: string
  personalGrowth: string
  challenges: string[]
  opportunities: string[]
  yearlyForecast: string
}

// Pythagorean numerology letter values
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

const MASTER_NUMBERS = [11, 22, 33]

// Reduce to single digit or master number
function reduceToSingleDigit(num: number): number {
  if (MASTER_NUMBERS.includes(num)) return num
  if (num < 10) return num
  return reduceToSingleDigit(num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0))
}

// Calculate Life Path Number from birth date
function calculateLifePathNumber(birthDate: string): number {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const daySum = reduceToSingleDigit(day)
  const monthSum = reduceToSingleDigit(month)
  const yearSum = reduceToSingleDigit(year)
  
  const total = daySum + monthSum + yearSum
  return reduceToSingleDigit(total)
}

// Calculate Name Number (Destiny Number) from full name
function calculateNameNumber(fullName: string): number {
  const nameArray = fullName.toUpperCase().replace(/\s+/g, '').split('')
  const sum = nameArray.reduce((total, letter) => {
    return total + (LETTER_VALUES[letter] || 0)
  }, 0)
  
  return reduceToSingleDigit(sum)
}

// Life Path Number meanings
const LIFE_PATH_MEANINGS: { [key: number]: string } = {
  1: 'The Pioneer - Leadership, independence, innovation',
  2: 'The Mediator - Cooperation, diplomacy, sensitivity',
  3: 'The Communicator - Creativity, expression, joy',
  4: 'The Builder - Stability, organization, hard work',
  5: 'The Adventurer - Freedom, change, experience',
  6: 'The Nurturer - Responsibility, harmony, service',
  7: 'The Seeker - Analysis, spirituality, wisdom',
  8: 'The Achiever - Power, material success, authority',
  9: 'The Humanitarian - Compassion, idealism, completion',
  11: 'The Intuitive - Spiritual insight, inspiration, illumination',
  22: 'The Master Builder - Practical vision, large-scale achievement',
  33: 'The Master Teacher - Universal love, healing, guidance'
}

// Name Number meanings
const NAME_NUMBER_MEANINGS: { [key: number]: string } = {
  1: 'Natural leader with strong willpower and determination',
  2: 'Diplomatic peacemaker with intuitive understanding',
  3: 'Creative communicator with artistic talents',
  4: 'Practical organizer with strong work ethic',
  5: 'Versatile explorer with adaptability and freedom',
  6: 'Responsible caregiver with nurturing qualities',
  7: 'Analytical thinker with spiritual depth',
  8: 'Ambitious achiever with material success',
  9: 'Compassionate humanitarian with universal love',
  11: 'Intuitive visionary with spiritual gifts',
  22: 'Master builder with practical wisdom',
  33: 'Master teacher with healing abilities'
}

// Sun Sign traits (Western astrology focus on personality)
const SUN_SIGN_TRAITS: { [key: string]: string } = {
  'Aries': 'Bold, assertive, pioneering spirit with natural leadership qualities',
  'Taurus': 'Stable, practical, grounded with strong values and determination',
  'Gemini': 'Curious, adaptable, communicative with intellectual versatility',
  'Cancer': 'Nurturing, intuitive, emotional with strong family connections',
  'Leo': 'Confident, creative, generous with natural charisma and warmth',
  'Virgo': 'Analytical, detail-oriented, service-minded with perfectionist tendencies',
  'Libra': 'Diplomatic, harmonious, relationship-focused with aesthetic sensibilities',
  'Scorpio': 'Intense, transformative, mysterious with deep emotional depth',
  'Sagittarius': 'Adventurous, philosophical, optimistic with love for exploration',
  'Capricorn': 'Ambitious, disciplined, responsible with practical wisdom',
  'Aquarius': 'Innovative, independent, humanitarian with forward-thinking vision',
  'Pisces': 'Intuitive, compassionate, artistic with deep emotional sensitivity'
}

// Helper function to extract comprehensiveAnalysis from different data structures
const extractComprehensiveAnalysis = (data: any): ComprehensiveAnalysis | null => {
  if (!data) return null
  // If it has comprehensiveAnalysis property, use that (nested structure from API)
  if (data.comprehensiveAnalysis) {
    return data.comprehensiveAnalysis
  }
  // Otherwise assume it's already the comprehensiveAnalysis object (flat structure)
  if (data.personalitySynthesis || data.challenges || data.opportunities) {
    return data
  }
  return null
}

export default function AstroNumerologyTab({ 
  userId,
  birthDate, 
  fullName, 
  sunSign,
  analysis,
  cachedReport,
  isLoadingReport = false
}: AstroNumerologyTabProps) {
  // Get sun sign from analysis if not provided
  const actualSunSign = sunSign || analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign?.signName || analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Unknown'

  // Calculate numerology numbers
  const lifePathNumber = useMemo(() => {
    if (!birthDate) return null
    return calculateLifePathNumber(birthDate)
  }, [birthDate])

  const nameNumber = useMemo(() => {
    if (!fullName) return null
    return calculateNameNumber(fullName)
  }, [fullName])

  // State for comprehensive analysis - use cached report if available
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(
    extractComprehensiveAnalysis(cachedReport)
  )
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Update local state when cachedReport prop changes
  useEffect(() => {
    if (cachedReport) {
      const extracted = extractComprehensiveAnalysis(cachedReport)
      setComprehensiveAnalysis(extracted)
    }
  }, [cachedReport])

  // Only fetch if we don't have cached data and report isn't being loaded by parent
  useEffect(() => {
    // If parent is loading or we have cached data, don't fetch
    if (isLoadingReport || cachedReport || comprehensiveAnalysis) {
      return
    }

    // Only fetch if we have required data
    if (!userId || !birthDate || !fullName || actualSunSign === 'Unknown') {
      return
    }

    const fetchComprehensiveAnalysis = async () => {
      setIsLoadingAnalysis(true)
      setAnalysisError(null)

      try {
        const response = await fetch('/api/astro-numerology/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            birthDate,
            fullName,
            sunSign: actualSunSign,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to generate comprehensive analysis (${response.status})`)
        }

        const result = await response.json()
        if (result.success && result.data?.comprehensiveAnalysis) {
          setComprehensiveAnalysis(result.data.comprehensiveAnalysis)
        } else {
          throw new Error(result.error || 'Failed to generate analysis. Please try again.')
        }
      } catch (error: any) {
        devLog.error('Error fetching comprehensive analysis:', error, 'AstroNumerologyTab')
        const errorMessage = error?.message || 'Failed to generate comprehensive analysis'
        setAnalysisError(errorMessage)
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchComprehensiveAnalysis()
  }, [userId, birthDate, fullName, actualSunSign, cachedReport, isLoadingReport, comprehensiveAnalysis])

  const isMasterNumber = (num: number) => MASTER_NUMBERS.includes(num)

  return (
    <div className="space-y-6">
      {/* Header - Combined Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-purple-200/60 rounded-full p-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-purple-900">Your Astro-Numerology Profile</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Combining Western Astrology (Tropical Zodiac) with Pythagorean Numerology
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Combined Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Sun Sign Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg rounded-3xl">
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-slate-700 text-sm mb-2">Sun Sign</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(100%) saturate(500%) hue-rotate(25deg) brightness(120%)' }}>
                  <ZodiacIcon sign={actualSunSign} size={24} className="" />
                </div>
                <div className="text-2xl font-bold text-yellow-800">{actualSunSign}</div>
              </div>
              <div className="text-xs text-slate-600">Western Astrology</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Life Path Number Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg rounded-3xl">
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-slate-700 text-sm mb-2">Life Path Number</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                {lifePathNumber != null && (
                  <NumberIcon 
                    number={lifePathNumber} 
                    size={24} 
                    className="text-blue-600"
                    isMaster={isMasterNumber(lifePathNumber)}
                  />
                )}
                <div className="text-2xl font-bold text-blue-800">
                  {lifePathNumber != null ? lifePathNumber : '—'}
                  {lifePathNumber != null && isMasterNumber(lifePathNumber) && <span className="text-base ml-1">⭐</span>}
                </div>
              </div>
              <div className="text-xs text-slate-600">From Birth Date</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Name Number Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 shadow-lg rounded-3xl">
            <CardContent className="p-3 sm:p-6 text-center">
              <div className="w-16 h-16 bg-pink-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-pink-600" />
              </div>
              <div className="text-slate-700 text-sm mb-2">Name Number</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                {nameNumber != null && (
                  <NumberIcon 
                    number={nameNumber} 
                    size={24} 
                    className="text-pink-600"
                    isMaster={isMasterNumber(nameNumber)}
                  />
                )}
                <div className="text-2xl font-bold text-pink-800">
                  {nameNumber != null ? nameNumber : '—'}
                  {nameNumber != null && isMasterNumber(nameNumber) && <span className="text-base ml-1">⭐</span>}
                </div>
              </div>
              <div className="text-xs text-slate-600">From Full Name</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Comprehensive Analysis Section */}
      {(isLoadingAnalysis || isLoadingReport) && !comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Card className="glass-card border-white/10 max-w-md mx-auto text-white">
            <CardContent className="p-8 text-white">
              <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">Generating Your Comprehensive Report</h3>
              <p className="text-slate-200">
                FutureSeer is analyzing your astro-numerology profile with AI insights...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : analysisError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          <Card className="glass-card border-red-400/20 max-w-md mx-auto text-white">
            <CardContent className="p-8 text-white">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Error Generating Report</h3>
              <p className="text-slate-200 mb-4">{analysisError}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Comprehensive Astro-Numerology Report
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Personality Synthesis */}
                <AccordionItem value="personality" className="border-2 border-amber-300 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 px-3 sm:px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-amber-700 py-4 [&[data-state=open]]:text-amber-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-yellow-400" />
                      <span className="text-left font-semibold">Personality Synthesis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 sm:p-4">
                      <div className="mb-3">
                        <h4 className="text-slate-900 font-semibold">Your Unique Personality Blend</h4>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {actualSunSign} Sun + Life Path {lifePathNumber ?? '—'} + Name Number {nameNumber ?? '—'}
                        </p>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {comprehensiveAnalysis.personalitySynthesis?.substring(0, 250) || comprehensiveAnalysis.personalitySynthesis || 'Personality analysis will be available soon.'}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {extractKeyInsights(comprehensiveAnalysis.personalitySynthesis || '').slice(0, 4).map((insight, index) => (
                          <li key={`personality-insight-${index}`} className="text-sm text-slate-700">
                            - {insight.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Career Guidance */}
                <AccordionItem value="career" className="border-2 border-blue-300 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-blue-700 py-4 [&[data-state=open]]:text-blue-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span className="text-left font-semibold">Career & Life Path Guidance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Briefcase className="w-6 h-6" />}
                      title="Career Paths Aligned With Your Energy"
                      summary={comprehensiveAnalysis.careerGuidance?.substring(0, 200) || comprehensiveAnalysis.careerGuidance || 'Career guidance will be available soon.'}
                      items={textToBulletPoints(comprehensiveAnalysis.careerGuidance || '', 5)}
                      variant="callout"
                      colorScheme="blue"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Relationship Insights */}
                <AccordionItem value="relationships" className="border-2 border-pink-300 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-pink-700 py-4 [&[data-state=open]]:text-pink-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <span className="text-left font-semibold">Relationship Dynamics</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Heart className="w-6 h-6" />}
                      title="How You Connect With Others"
                      summary={comprehensiveAnalysis.relationshipInsights?.substring(0, 200) || comprehensiveAnalysis.relationshipInsights || 'Relationship insights will be available soon.'}
                      items={textToBulletPoints(comprehensiveAnalysis.relationshipInsights || '', 5)}
                      variant="callout"
                      colorScheme="pink"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Life Purpose */}
                <AccordionItem value="purpose" className="border-2 border-purple-300 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-purple-700 py-4 [&[data-state=open]]:text-purple-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="text-left font-semibold">Life Purpose & Destiny</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Target className="w-6 h-6" />}
                      title="Your Deeper Purpose in This Lifetime"
                      summary={comprehensiveAnalysis.lifePurpose?.substring(0, 200) || comprehensiveAnalysis.lifePurpose || 'Life purpose analysis will be available soon.'}
                      items={extractKeyInsights(comprehensiveAnalysis.lifePurpose || '').slice(0, 3).map(insight => ({
                        text: insight.description,
                        highlight: true
                      }))}
                      variant="callout"
                      colorScheme="purple"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Personal Growth */}
                <AccordionItem value="growth" className="border-2 border-green-300 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-green-700 py-4 [&[data-state=open]]:text-green-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-left font-semibold">Personal Growth Roadmap</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<TrendingUp className="w-6 h-6" />}
                      title="Steps to Maximize Your Potential"
                      summary={comprehensiveAnalysis.personalGrowth?.substring(0, 200) || comprehensiveAnalysis.personalGrowth || 'Personal growth guidance will be available soon.'}
                      items={textToBulletPoints(comprehensiveAnalysis.personalGrowth || '', 6).map((item, index) => ({
                        ...item,
                        text: `${index + 1}. ${item.text}`,
                        highlight: index < 3
                      }))}
                      variant="callout"
                      colorScheme="green"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Challenges & Opportunities */}
                <AccordionItem value="challenges" className="border-2 border-orange-300 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-orange-700 py-4 [&[data-state=open]]:text-orange-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span className="text-left font-semibold">Challenges & Opportunities</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Challenges */}
                      <DevotionistStyleCard
                        icon={<AlertCircle className="w-6 h-6" />}
                        title="Challenges to Navigate"
                        items={(comprehensiveAnalysis.challenges && Array.isArray(comprehensiveAnalysis.challenges) && comprehensiveAnalysis.challenges.length > 0) 
                          ? comprehensiveAnalysis.challenges.map(challenge => ({ text: challenge, type: 'challenge' as const }))
                          : [{ text: 'Challenges analysis will be available soon.', type: 'neutral' as const }]
                        }
                        variant="callout"
                        colorScheme="orange"
                      />
                      
                      {/* Opportunities */}
                      <DevotionistStyleCard
                        icon={<Sparkles className="w-6 h-6" />}
                        title="Opportunities to Embrace"
                        items={(comprehensiveAnalysis.opportunities && Array.isArray(comprehensiveAnalysis.opportunities) && comprehensiveAnalysis.opportunities.length > 0)
                          ? comprehensiveAnalysis.opportunities.map(opportunity => ({ text: opportunity, type: 'positive' as const }))
                          : [{ text: 'Opportunities analysis will be available soon.', type: 'neutral' as const }]
                        }
                        variant="callout"
                        colorScheme="green"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Yearly Forecast */}
                <AccordionItem value="forecast" className="border-2 border-cyan-300 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 px-4 shadow-md">
                  <AccordionTrigger className="text-slate-800 hover:text-cyan-700 py-4 [&[data-state=open]]:text-cyan-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      <span className="text-left font-semibold">Yearly Forecast</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {comprehensiveAnalysis.yearlyForecast ? (
                      <div className="space-y-4">
                        <DevotionistStyleCard
                          icon={<Calendar className="w-6 h-6" />}
                          title={`${new Date().getFullYear()} Forecast Overview`}
                          summary={comprehensiveAnalysis.yearlyForecast.substring(0, 250)}
                          items={extractKeyInsights(comprehensiveAnalysis.yearlyForecast).slice(0, 4).map(insight => ({
                            text: insight.description,
                            highlight: insight.highlight
                          }))}
                          variant="callout"
                          colorScheme="cyan"
                        />
                        {comprehensiveAnalysis.yearlyForecast.length > 250 && (
                          <p className="text-slate-700 text-sm leading-relaxed mt-4">
                            {comprehensiveAnalysis.yearlyForecast.substring(250)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <DevotionistStyleCard
                        icon={<Calendar className="w-6 h-6" />}
                        title="Yearly Forecast"
                        summary="Yearly forecast will be available soon."
                        variant="callout"
                        colorScheme="cyan"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Use Cases - Gamified */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Target className="w-5 h-5 text-amber-600" />
              How to Use Your Astro-Numerology Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              <DevotionistStyleCard
                icon={<Briefcase className="w-6 h-6" />}
                title="Career Guidance"
                summary="Align your career choices with your sun sign's strengths and your life path number's purpose."
                variant="default"
                colorScheme="blue"
                className="h-full"
              />
              <DevotionistStyleCard
                icon={<Heart className="w-6 h-6" />}
                title="Relationships"
                summary="Understand relationship dynamics through both astrological compatibility and numerological harmony."
                variant="default"
                colorScheme="pink"
                className="h-full"
              />
              <DevotionistStyleCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Personal Growth"
                summary="Use insights from both systems to navigate challenges and maximize your potential in this lifetime."
                variant="default"
                colorScheme="amber"
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
