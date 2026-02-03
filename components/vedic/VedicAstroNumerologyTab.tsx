"use client"

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { 
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
  Moon,
  Sun,
  Gem
} from 'lucide-react'
import { 
  calculateVedicNumerologyProfile, 
  getRulingPlanet,
  type VedicNumerologyProfile 
} from '@/lib/vedicNumerologyCalculations'

interface VedicAstroNumerologyTabProps {
  userId?: string
  birthDate?: string
  fullName?: string
  vedicChartData?: any
  cachedReport?: ComprehensiveAnalysis | { comprehensiveAnalysis?: ComprehensiveAnalysis; [key: string]: any } | null
  isLoadingReport?: boolean
}

interface ComprehensiveAnalysis {
  personalitySynthesis: string
  karmicInsights: string
  remedies: string
  careerGuidance: string
  relationshipInsights: string
  lifePurpose: string
  personalGrowth: string
  challenges: string[]
  opportunities: string[]
  yearlyForecast: string
}

// Helper function to extract comprehensiveAnalysis from different data structures
const extractComprehensiveAnalysis = (data: any): ComprehensiveAnalysis | null => {
  if (!data) return null
  if (data.comprehensiveAnalysis) {
    return data.comprehensiveAnalysis
  }
  if (data.personalitySynthesis || data.challenges || data.opportunities) {
    return data
  }
  return null
}

export default function VedicAstroNumerologyTab({ 
  userId,
  birthDate, 
  fullName, 
  vedicChartData,
  cachedReport,
  isLoadingReport = false
}: VedicAstroNumerologyTabProps) {
  // Extract Vedic chart data
  const moonSign = useMemo(() => {
    if (!vedicChartData) return 'Unknown'
    
    // Try multiple possible paths for Moon sign
    if (vedicChartData.moon?.sign) return vedicChartData.moon.sign
    if (vedicChartData.moon?.signName) return vedicChartData.moon.signName
    if (vedicChartData.planets) {
      const moon = Array.isArray(vedicChartData.planets) 
        ? vedicChartData.planets.find((p: any) => p.name === 'Moon' || p.name === 'moon')
        : vedicChartData.planets.Moon || vedicChartData.planets.moon
      if (moon?.sign) return moon.sign
      if (moon?.signName) return moon.signName
    }
    return 'Unknown'
  }, [vedicChartData])

  const lagnaSign = useMemo(() => {
    if (!vedicChartData) return 'Unknown'
    
    if (vedicChartData.ascendant?.signName) return vedicChartData.ascendant.signName
    if (vedicChartData.ascendant?.sign) return vedicChartData.ascendant.sign
    if (vedicChartData.lagna?.signName) return vedicChartData.lagna.signName
    return 'Unknown'
  }, [vedicChartData])

  const sunSign = useMemo(() => {
    if (!vedicChartData) return 'Unknown'
    
    if (vedicChartData.sun?.sign) return vedicChartData.sun.sign
    if (vedicChartData.sun?.signName) return vedicChartData.sun.signName
    if (vedicChartData.planets) {
      const sun = Array.isArray(vedicChartData.planets) 
        ? vedicChartData.planets.find((p: any) => p.name === 'Sun' || p.name === 'sun')
        : vedicChartData.planets.Sun || vedicChartData.planets.sun
      if (sun?.sign) return sun.sign
      if (sun?.signName) return sun.signName
    }
    return 'Unknown'
  }, [vedicChartData])

  // Calculate Vedic numerology
  const numerologyProfile = useMemo<VedicNumerologyProfile | null>(() => {
    if (!birthDate || !fullName) return null
    return calculateVedicNumerologyProfile(fullName, birthDate)
  }, [birthDate, fullName])

  const rulingPlanet = numerologyProfile ? getRulingPlanet(numerologyProfile.lifePathNumber) : null
  
  // State for comprehensive analysis
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

  // Fetch comprehensive analysis
  useEffect(() => {
    if (isLoadingReport || cachedReport || comprehensiveAnalysis) return
    
    if (!userId || !birthDate || !fullName || !numerologyProfile || moonSign === 'Unknown') return

    const fetchAnalysis = async () => {
      setIsLoadingAnalysis(true)
      setAnalysisError(null)

      try {
        const response = await fetch('/api/vedic-astro-numerology/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            birthDate,
            fullName,
            moonSign,
            lagnaSign,
            sunSign,
            numerologyProfile
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to generate analysis (${response.status})`)
        }

        const result = await response.json()
        if (result.success && result.data?.comprehensiveAnalysis) {
          setComprehensiveAnalysis(result.data.comprehensiveAnalysis)
        } else {
          throw new Error(result.error || 'Failed to generate analysis')
        }
      } catch (error: any) {
        console.error('Error fetching Vedic Astro-Numerology analysis:', error)
        setAnalysisError(error?.message || 'Failed to generate analysis')
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchAnalysis()
  }, [userId, birthDate, fullName, numerologyProfile, moonSign, lagnaSign, sunSign, cachedReport, isLoadingReport, comprehensiveAnalysis])

  if (!birthDate || !fullName || !numerologyProfile) {
    return (
      <DevotionistStyleCard
        icon={<Star className="w-5 h-5" />}
        title="Profile Information Needed"
        summary="Please complete your profile with birth date and full name to unlock your Vedic Astro-Numerology reading."
        colorScheme="amber"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-amber-200 mb-4">🌟 Vedic Astro-Numerology Profile</h2>
        <p className="text-slate-200 leading-relaxed">
          Combining Vedic Astrology (Sidereal Zodiac) with Vedic Numerology (Navagraha System)
        </p>
        <p className="text-slate-300 text-sm mt-2">
          Integrated system using planetary influences, Kundli insights, and karmic numerology
        </p>
      </motion.div>

      {/* Combined Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Moon Sign (Most Important in Vedic) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DevotionistStyleCard
            icon={<Moon className="w-8 h-8" />}
            title={moonSign}
            subtitle="Moon Sign"
            summary="Vedic (Sidereal)"
            colorScheme="purple"
            variant="callout"
          />
        </motion.div>

        {/* Life Path Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DevotionistStyleCard
            icon={<Hash className="w-8 h-8" />}
            title={numerologyProfile.lifePathNumber.toString()}
            subtitle="Life Path"
            summary={`Ruled by ${rulingPlanet?.planet}`}
            colorScheme="amber"
            variant="callout"
          />
        </motion.div>

        {/* Ruling Planet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <DevotionistStyleCard
            icon={<Star className="w-8 h-8" />}
            title={rulingPlanet?.planet || 'Unknown'}
            subtitle="Ruling Planet"
            summary={rulingPlanet?.sanskrit || ''}
            colorScheme="blue"
            variant="callout"
          />
        </motion.div>

        {/* Lagna (Ascendant) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DevotionistStyleCard
            icon={<Sun className="w-8 h-8" />}
            title={lagnaSign}
            subtitle="Ascendant"
            summary="Lagna"
            colorScheme="green"
            variant="callout"
          />
        </motion.div>
      </div>

      {/* Planetary Influences Grid */}
      <DevotionistStyleCard
        icon={<Star className="w-5 h-5" />}
        title="Planetary Influences & Gemstone Recommendations"
        summary="Your numerology numbers and their corresponding planetary influences"
        colorScheme="amber"
        variant="callout"
      />
      <div className="bg-white/80 border-2 border-amber-300 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(numerologyProfile.planetaryInfluences).map(([key, value]) => (
              <Card key={key} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-1">{key}</div>
                  <div className="text-lg font-bold text-amber-300 mb-2">
                    {value.number} - {value.planet}
                  </div>
                  <div className="text-xs text-slate-300 mb-3">{value.significance}</div>
                  {value.gemstone && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                        <Gem className="w-3 h-3 mr-1" />
                        {value.gemstone}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
      </div>

      {/* Comprehensive Analysis */}
      {(isLoadingAnalysis || isLoadingReport) && !comprehensiveAnalysis ? (
        <DevotionistStyleCard
          icon={<Loader2 className="w-5 h-5 animate-spin" />}
          title="Generating Your Comprehensive Report"
          summary="Analyzing your Vedic Astro-Numerology profile with AI insights..."
          colorScheme="amber"
        />
      ) : analysisError ? (
        <DevotionistStyleCard
          icon={<AlertCircle className="w-5 h-5" />}
          title="Error Generating Report"
          summary={analysisError}
          items={[
            { text: 'Click the button below to try again', type: 'neutral' as const }
          ]}
          colorScheme="orange"
        >
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </DevotionistStyleCard>
      ) : comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <DevotionistStyleCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Comprehensive Vedic Astro-Numerology Analysis"
            summary="Detailed insights combining Vedic Astrology and Numerology"
            colorScheme="amber"
            variant="callout"
          />
          <div className="bg-white/80 border-2 border-amber-300 rounded-xl p-6">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Personality Synthesis */}
                <AccordionItem value="personality" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      <span className="font-semibold">Personality Synthesis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.personalitySynthesis || 'Analysis available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Karmic Insights */}
                <AccordionItem value="karma" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">Karmic Insights & Dasha Connections</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.karmicInsights || 'Karmic analysis available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Remedial Measures */}
                <AccordionItem value="remedies" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5" />
                      <span className="font-semibold">Remedial Measures</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.remedies || 'Remedial guidance available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Career Guidance */}
                <AccordionItem value="career" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      <span className="font-semibold">Career & Life Path Guidance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.careerGuidance || 'Career guidance available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Relationship Insights */}
                <AccordionItem value="relationships" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      <span className="font-semibold">Relationship Dynamics</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.relationshipInsights || 'Relationship insights available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Life Purpose */}
                <AccordionItem value="purpose" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">Life Purpose & Dharma</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.lifePurpose || 'Life purpose analysis available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Personal Growth */}
                <AccordionItem value="growth" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Personal Growth Roadmap</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.personalGrowth || 'Personal growth guidance available soon.'}
                  </AccordionContent>
                </AccordionItem>

                {/* Challenges & Opportunities */}
                <AccordionItem value="challenges" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Challenges & Opportunities</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 space-y-4">
                    <div>
                      <h4 className="text-amber-300 font-semibold mb-2">Challenges:</h4>
                      <ul className="text-slate-300 space-y-2 list-disc list-inside">
                        {(comprehensiveAnalysis.challenges && Array.isArray(comprehensiveAnalysis.challenges) && comprehensiveAnalysis.challenges.length > 0) ? (
                          comprehensiveAnalysis.challenges.map((challenge: string, index: number) => (
                            <li key={index}>{challenge}</li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Challenges analysis available soon.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-green-300 font-semibold mb-2">Opportunities:</h4>
                      <ul className="text-slate-300 space-y-2 list-disc list-inside">
                        {(comprehensiveAnalysis.opportunities && Array.isArray(comprehensiveAnalysis.opportunities) && comprehensiveAnalysis.opportunities.length > 0) ? (
                          comprehensiveAnalysis.opportunities.map((opportunity: string, index: number) => (
                            <li key={index}>{opportunity}</li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Opportunities analysis available soon.</li>
                        )}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Yearly Forecast */}
                <AccordionItem value="forecast" className="border-b border-amber-500/20 bg-slate-800/30 rounded-lg px-4">
                  <AccordionTrigger className="text-amber-200 hover:text-amber-300 [&[data-state=open]]:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Yearly Forecast</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300 pt-4 pb-4 leading-relaxed">
                    {comprehensiveAnalysis.yearlyForecast || 'Yearly forecast available soon.'}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}

