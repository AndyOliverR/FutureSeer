"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle,
  Zap,
  Eye,
  Heart,
  Gem,
  Activity,
  Loader2
} from 'lucide-react'
import { energyHealingIntelligence } from '@/lib/energyHealing/energyHealingIntelligence'
import {
  ChakraAnalysis,
  AuraReading,
  ReikiAnalysis,
  CrystalRecommendation,
  EnergyBalanceAnalysis
} from '@/lib/energyHealing/energyHealingImageAnalyzer'
import { ChakraVisualization } from '@/components/energy-healing/ChakraVisualization'
import { AuraVisualization } from '@/components/energy-healing/AuraVisualization'
import { CrystalRecommendations } from '@/components/energy-healing/CrystalRecommendations'
import { EnergyHealingCoach } from '@/components/energy-healing/EnergyHealingCoach'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import {
  storeEnergyHealingAnalysis,
  getEnergyHealingAnalysis,
  createProfileHash,
  isAnalysisValid
} from '@/lib/energyHealing/energyHealingStorage'

interface AllAnalyses {
  chakra: ChakraAnalysis | null
  aura: AuraReading | null
  reiki: ReikiAnalysis | null
  crystal: CrystalRecommendation | null
  energy: EnergyBalanceAnalysis | null
}

export default function EnergyHealingPage() {
  const { user, userProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [allAnalyses, setAllAnalyses] = useState<AllAnalyses>({
    chakra: null,
    aura: null,
    reiki: null,
    crystal: null,
    energy: null
  })
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    chakra: false,
    aura: false,
    reiki: false,
    crystal: false,
    energy: false
  })
  const [activeTab, setActiveTab] = useState<'introduction' | 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy' | 'ask-the-seer'>('introduction')

  // Auto-generate all analyses on mount and profile change
  useEffect(() => {
    if (!user || !userProfile) {
      return
    }

    const generateAllAnalyses = async () => {
      if (!user?.uid || !userProfile) return
      const methods = ['chakra', 'aura', 'reiki', 'crystal', 'energy'] as const
      const currentProfileHash = createProfileHash(userProfile)

      // Check cache first
      const cached = await Promise.all(
        methods.map(m => getEnergyHealingAnalysis(user.uid, m))
      )

      // Generate missing or stale analyses
      const promises = methods.map(async (method, index) => {
        const cachedAnalysis = cached[index]
        
        if (cachedAnalysis && isAnalysisValid(cachedAnalysis, currentProfileHash)) {
          // Use cached analysis
          setAllAnalyses(prev => ({
            ...prev,
            [method]: cachedAnalysis.analysis
          }))
          return
        }

        // Generate new analysis
        setLoadingStates(prev => ({ ...prev, [method]: true }))
        try {
          const result = await energyHealingIntelligence.performHealingAnalysis(
            method,
            userProfile,
            userProfile?.facePhotoUrl
          )

          // Extract the specific analysis from the result
          let analysis: any = null
          if (method === 'chakra' && result.chakraAnalysis) {
            analysis = result.chakraAnalysis
          } else if (method === 'aura' && result.auraReading) {
            analysis = result.auraReading
          } else if (method === 'reiki' && result.reikiAnalysis) {
            analysis = result.reikiAnalysis
          } else if (method === 'crystal' && result.crystalRecommendation) {
            analysis = result.crystalRecommendation
          } else if (method === 'energy' && result.energyBalance) {
            analysis = result.energyBalance
          }

          if (analysis) {
            setAllAnalyses(prev => ({ ...prev, [method]: analysis }))
            await storeEnergyHealingAnalysis(user.uid, method, analysis, currentProfileHash)
          }
        } catch (err) {
          console.error(`Failed to generate ${method} analysis:`, err)
          setError(`Failed to generate ${method} analysis. Please try again.`)
        } finally {
          setLoadingStates(prev => ({ ...prev, [method]: false }))
        }
      })

      await Promise.all(promises)
    }

    generateAllAnalyses()
  }, [user, userProfile])

  const healingMethods = [
    { 
      value: 'chakra' as const, 
      label: 'Chakra Analysis', 
      icon: <Zap className="h-5 w-5" />,
      description: 'Assess and balance your seven energy centers'
    },
    { 
      value: 'aura' as const, 
      label: 'Aura Reading', 
      icon: <Eye className="h-5 w-5" />,
      description: 'Read your energy field and spiritual vibrations'
    },
    { 
      value: 'reiki' as const, 
      label: 'Reiki', 
      icon: <Heart className="h-5 w-5" />,
      description: 'Universal life force energy healing'
    },
    { 
      value: 'crystal' as const, 
      label: 'Crystal Healing', 
      icon: <Gem className="h-5 w-5" />,
      description: 'Crystal and gemstone therapy'
    },
    { 
      value: 'energy' as const, 
      label: 'Energy Healing', 
      icon: <Activity className="h-5 w-5" />,
      description: 'General energy balancing and healing'
    }
  ]

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-serif font-semibold mb-6">
                <span className="text-yellow-400">✨</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Energy & Healing</span>
              </h1>
              <p className="text-slate-200 leading-relaxed text-xl font-light">
                Holistic energy work: Chakra Analysis, Aura Reading, Reiki, Crystal Healing, and Energy Balancing
              </p>
            </motion.div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md mb-8">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-amber-900">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results - Tabs always visible */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-transparent p-0 gap-2">
                <TabsTrigger 
                  value="introduction" 
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                >
                  Introduction
                </TabsTrigger>
                {healingMethods.map((method) => (
                  <TabsTrigger 
                    key={method.value}
                    value={method.value} 
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                  >
                    {method.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="ask-the-seer" 
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all"
                >
                  Ask the Seer
                </TabsTrigger>
              </TabsList>

              {/* Introduction Tab */}
              <TabsContent value="introduction" className="space-y-6">
                <ToolIntroductionTab toolSlug="energy-healing" />
              </TabsContent>

              {/* Chakra Analysis Tab */}
              <TabsContent value="chakra" className="space-y-6">
                {loadingStates.chakra ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
                      <p className="text-amber-900">Generating your chakra analysis...</p>
                    </CardContent>
                  </Card>
                ) : allAnalyses.chakra ? (
                  <ChakraVisualization analysis={allAnalyses.chakra} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Zap className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900">Chakra analysis will be available shortly</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Aura Reading Tab */}
              <TabsContent value="aura" className="space-y-6">
                {loadingStates.aura ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
                      <p className="text-amber-900">Generating your aura reading...</p>
                    </CardContent>
                  </Card>
                ) : allAnalyses.aura ? (
                  <AuraVisualization reading={allAnalyses.aura} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Eye className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900">Aura reading will be available shortly</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reiki Tab */}
              <TabsContent value="reiki" className="space-y-6">
                {loadingStates.reiki ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
                      <p className="text-amber-900">Generating your Reiki analysis...</p>
                    </CardContent>
                  </Card>
                ) : allAnalyses.reiki ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-900 gold-glow flex items-center gap-2">
                        <Heart className="w-5 h-5 text-amber-600" />
                        Reiki Energy Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-800 text-sm mb-1">Energy Level</p>
                          <p className="text-amber-900 font-semibold capitalize">{allAnalyses.reiki.energyLevel}</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-800 text-sm mb-1">Blockages</p>
                          <p className="text-amber-900 font-semibold">{allAnalyses.reiki.blockages.length}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-900 font-semibold mb-2">Recommended Symbols</h3>
                        <div className="flex flex-wrap gap-2">
                          {allAnalyses.reiki.recommendedSymbols.map((symbol, index) => (
                            <Badge key={index} variant="outline" className="border-amber-500 text-amber-900 bg-amber-50">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-900 font-semibold mb-2">Treatment Areas</h3>
                        <div className="flex flex-wrap gap-2">
                          {allAnalyses.reiki.treatmentAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="border-amber-400 text-amber-800 bg-amber-50">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-900 font-semibold mb-2">Interpretation</h3>
                        <p className="text-amber-800">{allAnalyses.reiki.interpretation}</p>
                      </div>
                      {allAnalyses.reiki.recommendations && allAnalyses.reiki.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-amber-900 font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-2">
                            {allAnalyses.reiki.recommendations.map((rec, index) => (
                              <li key={index} className="text-amber-800 flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900">Reiki analysis will be available shortly</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Crystal Healing Tab */}
              <TabsContent value="crystal" className="space-y-6">
                {loadingStates.crystal ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
                      <p className="text-amber-900">Generating your crystal recommendations...</p>
                    </CardContent>
                  </Card>
                ) : allAnalyses.crystal ? (
                  <CrystalRecommendations recommendation={allAnalyses.crystal} />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Gem className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900">Crystal recommendations will be available shortly</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Energy Balance Tab */}
              <TabsContent value="energy" className="space-y-6">
                {loadingStates.energy ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-spin" />
                      <p className="text-amber-900">Generating your energy balance analysis...</p>
                    </CardContent>
                  </Card>
                ) : allAnalyses.energy ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-900 gold-glow flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-600" />
                        Energy Balance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-800 text-sm mb-1">Overall Balance</p>
                          <p className="text-2xl font-bold text-amber-900">{allAnalyses.energy.overallBalance}%</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-800 text-sm mb-1">Chakra Balance</p>
                          <p className="text-2xl font-bold text-amber-900">{allAnalyses.energy.chakraBalance}%</p>
                        </div>
                        <div className="p-4 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                          <p className="text-amber-800 text-sm mb-1">Aura Health</p>
                          <p className="text-2xl font-bold text-amber-900">{allAnalyses.energy.auraHealth}%</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-amber-900 font-semibold mb-2">Energy Flow</h3>
                        <Badge variant="outline" className="border-amber-500 text-amber-900 bg-amber-50 capitalize">
                          {allAnalyses.energy.energyFlow.replace('_', ' ')}
                        </Badge>
                      </div>
                      {allAnalyses.energy.blockages && allAnalyses.energy.blockages.length > 0 && (
                        <div>
                          <h3 className="text-amber-900 font-semibold mb-2">Energy Blockages</h3>
                          <div className="flex flex-wrap gap-2">
                            {allAnalyses.energy.blockages.map((blockage, index) => (
                              <Badge key={index} variant="outline" className="border-amber-500 text-amber-900 bg-amber-50">
                                {blockage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {allAnalyses.energy.techniques && allAnalyses.energy.techniques.length > 0 && (
                        <div>
                          <h3 className="text-amber-900 font-semibold mb-2">Recommended Techniques</h3>
                          <ul className="space-y-2">
                            {allAnalyses.energy.techniques.map((technique, index) => (
                              <li key={index} className="text-amber-800 flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{technique}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {allAnalyses.energy.recommendations && allAnalyses.energy.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-amber-900 font-semibold mb-2">Recommendations</h3>
                          <ul className="space-y-2">
                            {allAnalyses.energy.recommendations.map((rec, index) => (
                              <li key={index} className="text-amber-800 flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                    <CardContent className="p-8 text-center">
                      <Activity className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-amber-900">Energy balance analysis will be available shortly</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Ask the Seer Tab */}
              <TabsContent value="ask-the-seer" className="space-y-6">
                <EnergyHealingCoach 
                  analysis={{
                    method: 'chakra',
                    timestamp: new Date(),
                    chakraAnalysis: allAnalyses.chakra || undefined,
                    auraReading: allAnalyses.aura || undefined,
                    reikiAnalysis: allAnalyses.reiki || undefined,
                    crystalRecommendation: allAnalyses.crystal || undefined,
                    energyBalance: allAnalyses.energy || undefined,
                    overallInsights: [],
                    recommendations: []
                  }} 
                />
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  )
}