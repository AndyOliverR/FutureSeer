"use client"

import { useState, useEffect, useMemo } from 'react'
import { devLog } from '@/lib/devLogger';
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import { 
  AlertTriangle,
  Info,
  Zap,
  Shield,
  Gem,
  BarChart3,
  Activity,
  Calendar,
  Moon
} from 'lucide-react'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { BodyZodiacProjection } from '@/components/medical/BodyZodiacProjection'
import { RemedyTabs } from '@/components/medical/RemedyTabs'
import { FertilityCalendar } from '@/components/medical/FertilityCalendar'
import { MedicalSeerChat } from '@/components/medical/MedicalSeerChat'
import { medicalDatabaseService } from '@/lib/medical/medicalDatabaseService'
import { getFormulaRecommendations } from '@/lib/medical/astrologicalFormulas'
import { getCurrentLunarPhase, getNextHealingPhases, isMercuryRetrograde } from '@/lib/medical/lunarPhases'

export default function MedicalAstrologyPage() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'body-parts' | 'remedies' | 'timing' | 'ask-seer'>('overview')
  const [healthInsights, setHealthInsights] = useState<any>(null)
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('medicalAstrology')
  const analysis = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    return (r.data ?? r) as any
  }, [pipelineReport])

  const hasCompleteDetails = !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)

  // Planetary strength calculator
  function calculatePlanetaryStrengths(chart: any) {
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    const strengths: { [key: string]: number } = {}
    
    // House categories for strength calculation
    const angularHouses = [1, 4, 7, 10]
    const succedentHouses = [2, 5, 8, 11]
    const cadentHouses = [3, 6, 9, 12]
    
    planets.forEach(planet => {
      const planetData = chart.planets?.[planet]
      if (!planetData) return
      
      let strength = 50 // Base strength
      
      // House strength: Angular (strongest), Succedent (moderate), Cadent (weakest)
      if (angularHouses.includes(planetData.house)) strength += 20
      else if (succedentHouses.includes(planetData.house)) strength += 10
      else if (cadentHouses.includes(planetData.house)) strength -= 10
      
      // Health houses (6th, 8th, 12th) reduce planetary strength
      if ([6, 8, 12].includes(planetData.house)) strength -= 15
      
      // Ensure strength stays within 0-100
      strengths[planet] = Math.max(0, Math.min(100, strength))
    })
    
    return strengths
  }

  // Calculate health insights from medical databases
  useEffect(() => {
    if (analysis?.data?.chart) {
      try {
        // 1. Analyze 6th house (health), 8th house (chronic disease), 12th house (hospitalization)
        const healthHouses = [6, 8, 12]
        const afflictedPlanets: Array<{ planet: string; sign: string; house: number }> = []
        
        // 2. Check planetary afflictions
        Object.entries(analysis.data.chart.planets || {}).forEach(([planet, data]: [string, any]) => {
          if (healthHouses.includes(data.house)) {
            afflictedPlanets.push({ planet, sign: data.sign, house: data.house })
          }
        })
        
        // 3. Apply medical astrology formulas (Zoller, Ptolemy)
        const formulas = getFormulaRecommendations({
          planets: Object.entries(analysis.data.chart.planets || {}).reduce((acc, [planet, data]: [string, any]) => {
            acc[planet] = { sign: data.sign, house: data.house }
            return acc
          }, {} as any),
          houses: [],
          aspects: []
        })
        
        // 4. Cross-reference with ICD10 database
        const healthConcerns = afflictedPlanets.flatMap(({ planet, sign, house }) => {
          return medicalDatabaseService.searchICD10({
            planets: [planet],
            zodiacSigns: [sign],
            houses: [house]
          })
        })
        
        // 5. Get targeted remedies from all three databases (BROADER SEARCH)
        const bodyPartsAffected = healthConcerns.map(c => c.bodyPart).filter(Boolean)
        const zodiacSigns = healthConcerns.map(c => c.zodiacSign).filter(Boolean)
        
        // Get Sun sign for constitutional remedies
        const sunSign = analysis.data.chart.planets?.Sun?.sign || analysis.data.chart.planets?.sun?.sign
        const moonSign = analysis.data.chart.planets?.Moon?.sign || analysis.data.chart.planets?.moon?.sign
        
        // BROADER REMEDY SEARCH: 
        // 1. Constitutional remedies (always show for Sun/Moon signs)
        const constitutionalRemedies = {
          homeopathic: medicalDatabaseService.searchHomeopathy({ 
            planets: ['Sun', 'Moon'],
            zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
          }),
          herbal: medicalDatabaseService.searchHerbal({ 
            zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
          }),
          acupuncture: medicalDatabaseService.searchAcupuncture({ 
            zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
          })
        }
        
        // 2. Affliction-based remedies (from planets in health houses OR weak positions)
        const afflictionRemedies = {
          homeopathic: medicalDatabaseService.searchHomeopathy({ 
            bodyParts: bodyPartsAffected,
            planets: afflictedPlanets.map(p => p.planet),
            zodiacSigns: afflictedPlanets.map(p => p.sign)
          }),
          herbal: medicalDatabaseService.searchHerbal({ 
            bodyParts: bodyPartsAffected,
            zodiacSigns: afflictedPlanets.map(p => p.sign)
          }),
          acupuncture: medicalDatabaseService.searchAcupuncture({ 
            zodiacSigns: afflictedPlanets.map(p => p.sign)
          })
        }
        
        // 3. Check ALL planets for any signs of weakness (detriment, fall, retrograde)
        const weakPlanets: string[] = []
        Object.entries(analysis.data.chart.planets || {}).forEach(([planet, data]: [string, any]) => {
          // Check for weakness indicators
          if (data.speed < 0) weakPlanets.push(planet) // retrograde
        })
        
        const weakRemedies = {
          homeopathic: medicalDatabaseService.searchHomeopathy({ planets: weakPlanets }),
          herbal: [],
          acupuncture: []
        }
        
        // 4. Combine all (deduplicate by keeping unique remedies)
        const remedies = {
          homeopathic: [...new Map([...constitutionalRemedies.homeopathic, ...afflictionRemedies.homeopathic, ...weakRemedies.homeopathic].map(r => [r.name, r])).values()].slice(0, 20),
          herbal: [...new Map([...constitutionalRemedies.herbal, ...afflictionRemedies.herbal].map(r => [r.name, r])).values()].slice(0, 20),
          acupuncture: [...new Map([...constitutionalRemedies.acupuncture, ...afflictionRemedies.acupuncture].map((r: any) => [r.name || r.formula || `${r}`, r])).values()].slice(0, 20)
        }
        
        // 6. Calculate planetary strengths
        const planetaryStrengths = calculatePlanetaryStrengths(analysis.data.chart)
        
        setHealthInsights({ 
          formulas, 
          healthConcerns, 
          remedies,
          afflictedPlanets,
          planetaryStrengths
        })
      } catch (error) {
        devLog.error('Error calculating health insights:', error, 'page')
      }
    }
  }, [analysis])

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 pb-8">
          <div className="text-center py-16">
            <span className="text-6xl block mx-auto mb-4" aria-hidden>⚕️</span>
            <h1 className="text-3xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-3">Medical Astrology</h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your health astrology insights</p>
            <Button 
              onClick={() => window.location.href = '/profile-setup'}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="medical astrology">
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 pb-8">
        {/* Medical Disclaimer */}
        <div className="mb-6 p-4 bg-amber-50/90 border-2 border-amber-300 rounded-xl">
          <p className="text-sm text-slate-800 text-center">
            <strong className="text-amber-900">Disclaimer:</strong> All FutureSeer medical astrology services, tools, and databases are provided for private study and entertainment only and are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-6xl block mx-auto mb-4" aria-hidden>⚕️</span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-3">Medical Astrology</h1>
            <p className="text-slate-300 text-lg">Health-focused astrological analysis and healing guidance</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger 
              value="overview" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="body-parts" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Body Parts
            </TabsTrigger>
            <TabsTrigger 
              value="remedies" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Remedies
            </TabsTrigger>
            <TabsTrigger 
              value="timing" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Health Timing
            </TabsTrigger>
            <TabsTrigger 
              value="ask-seer" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-slate-300">⚕️ FutureSeer is analyzing your medical astrology chart...</p>
                </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/profile">
                    Generate your mystical profile
                  </Link>
                </Button>
              </div>
            ) : (analysis?.data || healthInsights) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Medical Crisis Indicators (Zoller formulas) */}
                {healthInsights?.formulas && healthInsights.formulas.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Medical Crisis Indicators"
                  >
                    <div className="space-y-3">
                      {healthInsights.formulas.slice(0, 3).map((formula: any, index: number) => (
                        <div key={index} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="font-medium text-amber-900">{formula.name}</div>
                          <div className="text-sm text-slate-700">{formula.medicalImplications}</div>
                          <div className="text-xs text-slate-600 mt-2">Tradition: {formula.tradition}</div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Health Concerns */}
                {healthInsights?.healthConcerns && healthInsights.healthConcerns.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<Shield className="w-5 h-5" />}
                    title="Health Concerns"
                  >
                    <div className="space-y-3">
                      {healthInsights.healthConcerns.slice(0, 3).map((condition: any, index: number) => (
                        <div key={index} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-amber-900">{condition.name}</div>
                              <div className="text-xs text-slate-600">Code: {condition.code}</div>
                            </div>
                            <Badge className="text-xs bg-amber-200 text-amber-900 border border-amber-300">
                              {condition.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 mt-2">
                            {condition.bodyPart} • {condition.zodiacSign}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Planetary Health Influences */}
                {healthInsights?.afflictedPlanets && healthInsights.afflictedPlanets.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<Zap className="w-5 h-5" />}
                    title="Planetary Health Influences"
                  >
                    <div className="space-y-3">
                      {healthInsights.afflictedPlanets.slice(0, 3).map((planet: any, index: number) => (
                        <div key={index} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="font-medium text-amber-900">{planet.planet}</div>
                          <div className="text-sm text-slate-700">House {planet.house} • {planet.sign}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            {planet.house === 6 ? 'Health indicators' : planet.house === 8 ? 'Chronic disease' : 'Hospitalization'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Immediate Remedies */}
                {(healthInsights?.remedies?.homeopathic?.length > 0 || healthInsights?.remedies?.herbal?.length > 0 || healthInsights?.remedies?.acupuncture?.length > 0) && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<Gem className="w-5 h-5" />}
                    title="Immediate Remedies"
                  >
                    <div className="space-y-3">
                      {healthInsights.remedies.homeopathic?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`h-${index}`} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="font-medium text-amber-900">{remedy.name} (Homeopathic)</div>
                          <div className="text-sm text-slate-700">
                            {Array.isArray(remedy.keynotes) 
                              ? remedy.keynotes.slice(0, 2).join(', ').substring(0, 60) 
                              : (remedy.keynotes || '').substring(0, 60)}...
                          </div>
                        </div>
                      ))}
                      {healthInsights.remedies.herbal?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`e-${index}`} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="font-medium text-amber-900">{remedy.name} (Herbal)</div>
                          <div className="text-sm text-slate-700">
                            {Array.isArray(remedy.virtues) 
                              ? remedy.virtues.slice(0, 2).join(', ').substring(0, 60) 
                              : (remedy.virtues || '').substring(0, 60)}...
                          </div>
                        </div>
                      ))}
                      {healthInsights.remedies.acupuncture?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`a-${index}`} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <div className="font-medium text-amber-900">{remedy.formula || 'Formula'} (Acupuncture)</div>
                          <div className="text-sm text-slate-700">Meridians: {remedy.meridians?.join(', ') || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Planetary Strengths */}
                {healthInsights?.planetaryStrengths && Object.keys(healthInsights.planetaryStrengths).length > 0 && (
                  <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-lg m3-elevation-1 hover:border-amber-400 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="rounded-lg bg-amber-200/60 p-2">
                        <BarChart3 className="w-5 h-5 text-amber-700" />
                      </div>
                      <h4 className="font-semibold text-lg text-amber-900">Planetary Strengths</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(healthInsights.planetaryStrengths).map(([planet, strength]: [string, any]) => (
                        <div key={planet} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-700">{planet}</span>
                            <span className={`font-medium ${strength < 30 ? 'text-red-700' : strength < 50 ? 'text-amber-700' : 'text-green-700'}`}>
                              {strength}%
                            </span>
                          </div>
                          <div className="w-full bg-amber-200/60 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${strength < 30 ? 'bg-red-500' : strength < 50 ? 'bg-amber-500' : 'bg-green-600'}`}
                              style={{ width: `${strength}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback: Show general health overview if no specific data */}
                {(!healthInsights?.formulas || healthInsights.formulas.length === 0) && 
                 (!healthInsights?.healthConcerns || healthInsights.healthConcerns.length === 0) &&
                 (!healthInsights?.afflictedPlanets || healthInsights.afflictedPlanets.length === 0) &&
                 analysis?.data && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<span className="text-2xl" aria-hidden>⚕️</span>}
                    title="General Health Overview"
                  >
                    <p className="text-slate-700 mb-4">
                      Your chart shows balanced health indicators. Here&apos;s what your Medical Astrology analysis reveals:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700">
                        ✓ Your planetary positions have been analyzed for health correlations
                      </p>
                      <p className="text-sm text-slate-700">
                        ✓ Check the <strong className="text-amber-900">Health</strong> tab for detailed planetary influences
                      </p>
                      <p className="text-sm text-slate-700">
                        ✓ Explore <strong className="text-amber-900">Body Parts</strong> tab for zodiacal correspondences
                      </p>
                    </div>
                    {analysis?.metadata && (
                      <div className="mt-4 pt-4 border-t border-amber-300">
                        <p className="text-xs text-slate-600">
                          Analysis generated: {new Date(analysis.metadata.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </DevotionistStyleCard>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-200 mb-4">No medical astrology data available. Please complete your profile.</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/profile">
                    Generate your mystical profile
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Indicators */}
              {analysis?.data?.healthIndicators && analysis.data.healthIndicators.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="amber"
                  icon={<Activity className="w-5 h-5" />}
                  title="Health Indicators"
                >
                  <div className="space-y-3">
                    {analysis.data.healthIndicators.map((indicator: any, index: number) => (
                      <div key={index} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-amber-900">{indicator.name}</h4>
                          <Badge className={`text-xs border ${indicator.status === 'strong' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-200 text-amber-900 border-amber-300'}`}>
                            {indicator.status || 'Moderate'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{indicator.description}</p>
                        <div className="flex gap-4 text-xs text-slate-600">
                          {indicator.dignity && <span>Dignity: {indicator.dignity}</span>}
                          {indicator.essentialStrength && <span>Essential: {indicator.essentialStrength}</span>}
                          {indicator.accidentalStrength && <span>Accidental: {indicator.accidentalStrength}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Body Systems with Hybrid Vedic + Western */}
              {analysis?.data?.bodySystems && analysis.data.bodySystems.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="amber"
                  icon={<Activity className="w-5 h-5" />}
                  title="Body Systems Analysis (Hybrid)"
                >
                  <div className="space-y-2">
                    {analysis.data.bodySystems.map((system: any, index: number) => (
                      <div key={index} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{system.system}</span>
                          <Badge className={`text-xs border ${
                            system.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                            system.riskLevel === 'moderate' ? 'bg-amber-200 text-amber-900 border-amber-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }`}>
                            {system.riskLevel}
                          </Badge>
                        </div>
                        <div className="w-full bg-amber-200/60 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              system.strength < 30 ? 'bg-red-500' : system.strength < 50 ? 'bg-amber-500' : 'bg-green-600'
                            }`}
                            style={{ width: `${system.strength}%` }}
                          />
                        </div>
                        
                        {/* Hybrid Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {system.vedicAnalysis && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                              <p className="text-blue-800 font-medium mb-1">Vedic (Dosha)</p>
                              <p className="text-slate-700">{system.vedicAnalysis.dosha} Constitution</p>
                              <p className="text-slate-600 mt-1">{system.vedicAnalysis.recommendation}</p>
                            </div>
                          )}
                          {system.westernAnalysis && (
                            <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
                              <p className="text-amber-900 font-medium mb-1">Western (Transits)</p>
                              <p className="text-slate-700">{system.westernAnalysis.currentTransit}</p>
                              <p className="text-slate-600 mt-1">{system.westernAnalysis.impact}</p>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-600 mt-2">{system.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Planetary Aspects */}
              {analysis?.data?.planetaryAspects && analysis.data.planetaryAspects.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="amber"
                  icon={<Zap className="w-5 h-5" />}
                  title="Health-Relevant Aspects"
                >
                  <div className="space-y-2">
                    {analysis.data.planetaryAspects.slice(0, 8).map((aspect: any, index: number) => (
                      <div key={index} className="p-2 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                        <span className="text-amber-900 font-medium">{aspect.planets}</span> — {aspect.aspect} ({aspect.orb}°)
                        <p className="text-slate-600 mt-1">{aspect.healthInfluence}</p>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Planetary Strengths Table */}
              {healthInsights?.planetaryStrengths && Object.keys(healthInsights.planetaryStrengths).length > 0 && (
                <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-lg m3-elevation-1 hover:border-amber-400 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg bg-amber-200/60 p-2">
                      <BarChart3 className="w-5 h-5 text-amber-700" />
                    </div>
                    <h4 className="font-semibold text-lg text-amber-900">Planetary Strengths (Health Context)</h4>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(healthInsights.planetaryStrengths).map(([planet, strength]: [string, any]) => (
                      <div key={planet} className="flex items-center justify-between p-2 bg-amber-50/60 border border-amber-200 rounded-lg">
                        <span className="text-sm text-slate-700">{planet}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-amber-200/60 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                strength < 30 ? 'bg-red-500' : strength < 50 ? 'bg-amber-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${strength}%` }}
                            />
                          </div>
                          <span className={`text-xs w-12 text-right font-medium ${
                            strength < 30 ? 'text-red-700' : strength < 50 ? 'text-amber-700' : 'text-green-700'
                          }`}>
                            {strength}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fallback message if no data */}
            {(!analysis?.data?.healthIndicators || analysis.data.healthIndicators.length === 0) &&
             (!analysis?.data?.bodySystems || analysis.data.bodySystems.length === 0) &&
             (!analysis?.data?.planetaryAspects || analysis.data.planetaryAspects.length === 0) && (
              <DevotionistStyleCard
                variant="callout"
                colorScheme="amber"
                icon={<span className="text-2xl" aria-hidden>⚕️</span>}
                title="Health Analysis"
              >
                <p className="text-slate-700">
                  Your chart is being analyzed for health correlations. Planetary positions and aspects are being evaluated.
                </p>
                {analysis?.data?.chart && (
                  <div className="mt-4 pt-4 border-t border-amber-300">
                    <p className="text-sm text-slate-600 mb-2">Chart calculated:</p>
                    <p className="text-xs text-slate-600">
                      {analysis.metadata?.generatedAt ? new Date(analysis.metadata.generatedAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                )}
              </DevotionistStyleCard>
            )}
          </TabsContent>

          {/* Body Parts Tab */}
          <TabsContent value="body-parts" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <BodyZodiacProjection 
              userChart={analysis?.data?.chart} 
              gender={userProfile?.gender === 'male' ? 'male' : 'female'} 
            />
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <RemedyTabs 
              selectedCondition={analysis?.data?.healthIndicators?.[0]?.name}
              bodyPart={analysis?.data?.bodyParts?.[0]?.bodyPart}
              zodiacSign={analysis?.data?.chart?.planets?.Sun?.sign}
              precomputedRemedies={healthInsights?.remedies}
            />
          </TabsContent>

          {/* Health Timing Tab */}
          <TabsContent value="timing" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {userProfile?.gender === 'female' && userProfile?.birthDate ? (
              <FertilityCalendar natalDate={userProfile.birthDate} />
            ) : (
              <div className="space-y-6">
                {/* Current Lunar Phase */}
                {(() => {
                  const currentPhase = getCurrentLunarPhase()
                  const nextPhases = getNextHealingPhases()
                  const mercuryRx = isMercuryRetrograde()
                  
                  return (
                    <>
                      <DevotionistStyleCard
                        variant="callout"
                        colorScheme="amber"
                        icon={<Moon className="w-5 h-5" />}
                        title="Current Lunar Phase"
                      >
                        <div className="space-y-4">
                          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-amber-900 mb-2">{currentPhase.name}</h3>
                            <p className="text-slate-700 mb-3">{currentPhase.description}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-700 font-medium">Optimal for:</p>
                              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                {currentPhase.optimalFor.map((activity, idx) => (
                                  <li key={idx}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">
                            Phase until: {currentPhase.endDate.toLocaleDateString()}
                          </div>
                        </div>
                      </DevotionistStyleCard>

                      {/* Upcoming Healing Phases */}
                      <DevotionistStyleCard
                        variant="callout"
                        colorScheme="amber"
                        icon={<Calendar className="w-5 h-5" />}
                        title="Upcoming Optimal Healing Windows"
                      >
                        <div className="space-y-3">
                          {nextPhases.map((phase, idx) => (
                            <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-amber-900">{phase.name}</h4>
                                <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-300">
                                  {phase.startDate.toLocaleDateString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">{phase.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {phase.optimalFor.map((item, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-amber-200/60 text-amber-900 rounded-lg">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DevotionistStyleCard>

                      {/* Mercury Retrograde Warning */}
                      {mercuryRx && (
                        <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-amber-50 p-4 shadow-lg m3-elevation-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg bg-red-200/60 p-2">
                              <AlertTriangle className="w-5 h-5 text-red-800" />
                            </div>
                            <h4 className="font-semibold text-lg text-red-900">Mercury Retrograde Warning</h4>
                          </div>
                          <p className="text-sm text-slate-700">
                            Mercury is currently retrograde. Consider avoiding:
                          </p>
                          <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-slate-600">
                            <li>Elective surgeries when possible</li>
                            <li>Starting new major health treatments</li>
                            <li>Making irreversible health decisions</li>
                          </ul>
                          <p className="text-xs text-slate-600 mt-3">
                            Minor procedures are fine, but major interventions should be carefully considered.
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </TabsContent>

          {/* Ask the Seer Tab */}
          <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <MedicalSeerChat userProfile={userProfile} analysis={analysis} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
} 