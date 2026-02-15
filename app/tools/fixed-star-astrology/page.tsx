"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import { 
  Star, 
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Brain,
  Home,
  Gem,
  MessageCircle,
  BarChart3,
  User,
  Eye,
  Heart,
  Shield,
  Target,
  Activity,
  Timer,
  TrendingUp,
  Users,
  Sparkles,
  Moon,
  Sun,
  ArrowUp
} from 'lucide-react'

export default function FixedStarAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'rising' | 'culminating' | 'setting' | 'aspects'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Fixed Star Astrology Analysis
  const loadFixedStarAnalysis = async () => {
    if (!hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      devLog.debug('⭐ FutureSeer: Loading Fixed Star Astrology analysis...')
      
      const birthData: BirthData = {
        birthDate: userProfile?.birthDate || '',
        birthTime: userProfile?.birthTime || '',
        birthPlace: userProfile?.birthPlace || '',
        latitude: userProfile?.latitude || 40.7128,
        longitude: userProfile?.longitude || -74.0060
      }
      
      // Load comprehensive analysis from Universal Occult API
      const fixedStarData = await universalOccultService.calculateFixedStarChart(birthData, {
        includeRising: true,
        includeCulminating: true,
        includeSetting: true,
        includeAspects: true
      })
      
      setAnalysis(fixedStarData)
      
      devLog.debug('✅ FutureSeer: Fixed Star Astrology analysis loaded successfully:', fixedStarData)
    } catch (error) {
      devLog.error('❌ FutureSeer: Failed to load Fixed Star Astrology analysis:', error, 'page')
      setError('Failed to load Fixed Star Astrology analysis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasCompleteDetails) {
      loadFixedStarAnalysis()
    }
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Fixed Star Astrology</h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your fixed star influences</p>
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
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Star className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">Fixed Star Astrology</h1>
            <p className="text-slate-300 text-lg">Fixed star influences and aspects</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="rising" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Rising
            </TabsTrigger>
            <TabsTrigger 
              value="culminating" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Culminating
            </TabsTrigger>
            <TabsTrigger 
              value="setting" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Setting
            </TabsTrigger>
            <TabsTrigger 
              value="aspects" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Aspects
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-slate-300">⭐ FutureSeer is analyzing your fixed star influences...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={loadFixedStarAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Try Again
                </Button>
              </div>
            ) : analysis?.data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Fixed Stars */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Star className="w-5 h-5" />
                      Key Fixed Stars
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.risingStars?.slice(0, 3).map((star: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-amber-300">{star.name || `Star ${index + 1}`}</div>
                              <div className="text-sm text-slate-400">{star.constellation || 'Constellation'}</div>
                            </div>
                            <Badge variant="outline" className="text-amber-400 border-amber-400">
                              Rising
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Star Influences */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Zap className="w-5 h-5" />
                      Star Influences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.influences?.slice(0, 3).map((influence: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{influence.type || `Influence ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{influence.description || 'Fixed star influence on personality'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parans */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Activity className="w-5 h-5" />
                      Parans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.parans?.slice(0, 3).map((paran: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{paran.name || `Paran ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{paran.description || 'Paran influence on destiny'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Star Aspects */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <BarChart3 className="w-5 h-5" />
                      Star Aspects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.starAspects?.slice(0, 3).map((aspect: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{aspect.planet || `Planet ${index + 1}`} - {aspect.star || `Star ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{aspect.type || 'Conjunction'} - {aspect.orb?.toFixed(2) || '0.00'}°</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No fixed star data available. Please complete your profile.</p>
                <Button onClick={loadFixedStarAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Generate Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Rising Stars Tab */}
          <TabsContent value="rising" className="space-y-6 mt-6">
            {analysis?.data?.risingStars ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.risingStars.map((star: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Star className="w-5 h-5" />
                        {star.name || `Star ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Constellation:</span>
                            <div className="text-amber-300 font-medium">{star.constellation || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Magnitude:</span>
                            <div className="text-amber-300 font-medium">{star.magnitude?.toFixed(1) || '0.0'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Longitude:</span>
                            <div className="text-amber-300 font-medium">{star.longitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Latitude:</span>
                            <div className="text-amber-300 font-medium">{star.latitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-400 border-amber-400 w-full">
                          Rising
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No rising star data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Culminating Stars Tab */}
          <TabsContent value="culminating" className="space-y-6 mt-6">
            {analysis?.data?.culminatingStars ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.culminatingStars.map((star: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Star className="w-5 h-5" />
                        {star.name || `Star ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Constellation:</span>
                            <div className="text-amber-300 font-medium">{star.constellation || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Magnitude:</span>
                            <div className="text-amber-300 font-medium">{star.magnitude?.toFixed(1) || '0.0'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Longitude:</span>
                            <div className="text-amber-300 font-medium">{star.longitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Latitude:</span>
                            <div className="text-amber-300 font-medium">{star.latitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-400 border-amber-400 w-full">
                          Culminating
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No culminating star data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Setting Stars Tab */}
          <TabsContent value="setting" className="space-y-6 mt-6">
            {analysis?.data?.settingStars ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.settingStars.map((star: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Star className="w-5 h-5" />
                        {star.name || `Star ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Constellation:</span>
                            <div className="text-amber-300 font-medium">{star.constellation || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Magnitude:</span>
                            <div className="text-amber-300 font-medium">{star.magnitude?.toFixed(1) || '0.0'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Longitude:</span>
                            <div className="text-amber-300 font-medium">{star.longitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Latitude:</span>
                            <div className="text-amber-300 font-medium">{star.latitude?.toFixed(2) || '0.00'}°</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-400 border-amber-400 w-full">
                          Setting
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No setting star data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Aspects Tab */}
          <TabsContent value="aspects" className="space-y-6 mt-6">
            {analysis?.data?.starAspects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.starAspects.map((aspect: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Zap className="w-5 h-5" />
                        {aspect.planet || `Planet ${index + 1}`} - {aspect.star || `Star ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Type:</span>
                            <div className="text-amber-300 font-medium capitalize">{aspect.type || 'Conjunction'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Orb:</span>
                            <div className="text-amber-300 font-medium">{aspect.orb?.toFixed(2) || '0.00'}°</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Strength:</span>
                            <div className="text-amber-300 font-medium">{(aspect.strength * 100)?.toFixed(0) || '0'}%</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Exact:</span>
                            <div className="text-amber-300 font-medium">{aspect.exact ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No star aspect data available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
