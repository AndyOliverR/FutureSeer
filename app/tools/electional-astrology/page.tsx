"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import { 
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
  Star,
  ArrowUp
} from 'lucide-react'

export default function ElectionalAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'timing' | 'events' | 'guidance' | 'calendar'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Electional Astrology Analysis
  const loadElectionalAnalysis = async () => {
    if (!hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📅 FutureSeer: Loading Electional Astrology analysis...')
      
      const birthData: BirthData = {
        birthDate: userProfile?.birthDate || '',
        birthTime: userProfile?.birthTime || '',
        birthPlace: userProfile?.birthPlace || '',
        latitude: userProfile?.latitude || 40.7128,
        longitude: userProfile?.longitude || -74.0060
      }
      
      // Load comprehensive analysis from Universal Occult API
      const electionalData = await universalOccultService.calculateElectionalChart(birthData, {
        includeTiming: true,
        includeEvents: true,
        includeGuidance: true,
        includeCalendar: true
      })
      
      setAnalysis(electionalData)
      
      console.log('✅ FutureSeer: Electional Astrology analysis loaded successfully:', electionalData)
    } catch (error) {
      console.error('❌ FutureSeer: Failed to load Electional Astrology analysis:', error)
      setError('Failed to load Electional Astrology analysis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasCompleteDetails) {
      loadElectionalAnalysis()
    }
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Electional Astrology</h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your electional astrology insights</p>
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
            <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Electional Astrology</h1>
            <p className="text-slate-300 text-lg">Optimal timing for important life events</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="timing" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Timing
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="guidance" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Guidance
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-slate-300">📅 FutureSeer is analyzing your electional astrology chart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={loadElectionalAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Try Again
                </Button>
              </div>
            ) : analysis?.data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimal Timing */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Timer className="w-5 h-5" />
                      Optimal Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.optimalTiming?.slice(0, 3).map((timing: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-amber-300">{timing.event || `Event ${index + 1}`}</div>
                              <div className="text-sm text-slate-400">{timing.description || 'Optimal timing'}</div>
                            </div>
                            <Badge variant="outline" className="text-amber-400 border-amber-400">
                              {timing.quality || 'Good'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lunar Phases */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Moon className="w-5 h-5" />
                      Lunar Phases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.lunarPhases?.slice(0, 3).map((phase: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{phase.name || `Phase ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{phase.electionalInfluence || 'Electional influence'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Planetary Aspects */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Zap className="w-5 h-5" />
                      Planetary Aspects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.aspects?.slice(0, 3).map((aspect: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{aspect.planets || `Aspect ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{aspect.electionalInfluence || 'Electional influence'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Guidance */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Target className="w-5 h-5" />
                      Event Guidance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.guidance?.slice(0, 3).map((guidance: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{guidance.event || `Event ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{guidance.advice || 'Electional advice'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No electional astrology data available. Please complete your profile.</p>
                <Button onClick={loadElectionalAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Generate Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6 mt-6">
            {analysis?.data?.optimalTiming ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.optimalTiming.map((timing: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Timer className="w-5 h-5" />
                        {timing.event || `Event ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-400">
                          {timing.description || 'Optimal timing description'}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Quality:</span>
                          <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                            {timing.quality || 'Good'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          Best Time: {timing.bestTime || 'Unknown'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No timing data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6 mt-6">
            {analysis?.data?.events ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.events.map((event: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Calendar className="w-5 h-5" />
                        {event.name || `Event ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-400">
                          {event.description || 'Event description'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Optimal Date: {event.optimalDate || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Quality: {event.quality || 'Good'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No event data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance" className="space-y-6 mt-6">
            {analysis?.data?.guidance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.guidance.map((guidance: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Target className="w-5 h-5" />
                        {guidance.event || `Event ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-400">
                          {guidance.advice || 'Electional advice'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Priority: {guidance.priority || 'Medium'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Timing: {guidance.timing || 'Flexible'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No guidance data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6 mt-6">
            <div className="text-center py-8">
              <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Electional calendar coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
