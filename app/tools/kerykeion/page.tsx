"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { enhancedUniversalInterpretationEngine } from '@/lib/enhancedToolIntegration'
import { 
  BarChart3, 
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
  User,
  Eye,
  Shield,
  Target,
  Activity,
  Timer,
  TrendingUp,
  Users,
  Sparkles,
  Moon,
  Sun,
  Star,
  Book,
  Scroll,
  TreePine,
  Wand2,
  Heart,
  Briefcase
} from 'lucide-react'

export default function KerykeionPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'aspects' | 'synastry' | 'transits'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Kerykeion Analysis
  const loadKerykeionAnalysis = async () => {
    if (!hasCompleteDetails || !user || !userProfile) return

    try {
      setIsLoading(true)
      setError(null)

      const birthData = {
        date: userProfile.birthDate,
        time: userProfile.birthTime,
        place: userProfile.birthPlace,
        latitude: userProfile.birthLatitude ?? 0,
        longitude: userProfile.birthLongitude ?? 0
      }

      const result = await enhancedUniversalInterpretationEngine.generateComprehensiveReading(
        user.uid,
        'kerykeion',
        birthData,
        userProfile
      )

      setAnalysis(result)
    } catch (err) {
      devLog.error('Kerykeion analysis error:', err, 'page')
      setError(err instanceof Error ? err.message : 'Failed to generate Kerykeion analysis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasCompleteDetails) {
      loadKerykeionAnalysis()
    } else {
      setIsLoading(false)
    }
  }, [hasCompleteDetails])

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Complete Birth Details Required</h2>
              <p className="text-gray-300 mb-6">
                Kerykeion requires your complete birth information to generate accurate data-driven astrology readings.
                Please update your profile with your birth date, time, and place.
              </p>
              <Button 
                onClick={() => window.location.href = '/profile'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Generating Kerykeion Analysis</h2>
          <p className="text-gray-300">Using data-driven astrology and Swiss Ephemeris calculations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen starfield-ultra-sharp">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-slate-800/50 border-red-500/30">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Analysis Error</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button 
                onClick={loadKerykeionAnalysis}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold gold-glow mb-4 flex items-center justify-center gap-3">
                <BarChart3 className="h-10 w-10 text-blue-500" />
                Kerykeion Data-Driven Astrology
                <BarChart3 className="h-10 w-10 text-blue-500" />
              </h1>
              <p className="text-soft text-xl leading-relaxed">
                Advanced astrology powered by Swiss Ephemeris and structured data analysis
              </p>
            </motion.div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-blue-500/30 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="chart" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Birth Chart
              </TabsTrigger>
              <TabsTrigger value="aspects" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Aspects
              </TabsTrigger>
              <TabsTrigger value="synastry" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Synastry
              </TabsTrigger>
              <TabsTrigger value="transits" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                Transits
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Birth Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-300">Date:</span>
                      <span className="text-white">{userProfile.birthDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-300">Time:</span>
                      <span className="text-white">{userProfile.birthTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-300">Place:</span>
                      <span className="text-white">{userProfile.birthPlace}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" />
                      Data Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      Kerykeion provides structured astrological data using Swiss Ephemeris calculations.
                      This analysis includes planetary positions, aspects, and advanced chart interpretations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Birth Chart Tab */}
            <TabsContent value="chart" className="space-y-6">
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Planetary Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis?.birthChart?.planets ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analysis.birthChart.planets.map((planet: any, index: number) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">{planet.name}</h3>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                              {planet.sign}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>Longitude: {planet.longitude?.toFixed(2)}°</p>
                            <p>Latitude: {planet.latitude?.toFixed(2)}°</p>
                            <p>House: {planet.house}</p>
                            <p>Degree: {planet.degree?.toFixed(2)}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Chart data not available</p>
                  )}
                </CardContent>
              </Card>

              {/* SVG Chart Display */}
              {analysis?.svgChart && (
                <Card className="bg-slate-800/50 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      Visual Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <div dangerouslySetInnerHTML={{ __html: analysis.svgChart }} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Aspects Tab */}
            <TabsContent value="aspects" className="space-y-6">
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Planetary Aspects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis?.birthChart?.aspects ? (
                    <div className="space-y-4">
                      {analysis.birthChart.aspects.map((aspect: any, index: number) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {aspect.planet1} - {aspect.planet2}
                            </h3>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                              {aspect.aspect}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-300">
                            <p>Orb: {aspect.orb?.toFixed(2)}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Aspects data not available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Synastry Tab */}
            <TabsContent value="synastry" className="space-y-6">
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue-500" />
                    Synastry Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis?.synastry ? (
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="font-semibold text-white mb-2">Compatibility Score</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${analysis.synastry.compatibility * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-semibold">
                            {Math.round(analysis.synastry.compatibility * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {analysis.synastry.aspects && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white">Synastry Aspects</h3>
                          {analysis.synastry.aspects.map((aspect: any, index: number) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-white">
                                  {aspect.planet1} - {aspect.planet2}
                                </span>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                                  {aspect.aspect}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">Synastry analysis not available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transits Tab */}
            <TabsContent value="transits" className="space-y-6">
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Current Transits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis?.transits ? (
                    <div className="space-y-4">
                      {analysis.transits.map((transit: any, index: number) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {transit.planet} {transit.aspect} {transit.targetPlanet}
                            </h3>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                              {transit.date}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-300">
                            <p>Orb: {transit.orb?.toFixed(2)}°</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Transits data not available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Refresh Button */}
          <div className="text-center mt-8">
            <Button 
              onClick={loadKerykeionAnalysis}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
