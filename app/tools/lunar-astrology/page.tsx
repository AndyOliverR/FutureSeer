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
  Moon, 
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
  Star,
  Sun,
  ArrowUp
} from 'lucide-react'

export default function LunarAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'mansions' | 'cycles' | 'transits'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Lunar Astrology Analysis
  const loadLunarAnalysis = async () => {
    if (!hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🌙 FutureSeer: Loading Lunar Astrology analysis...')
      
      const birthData: BirthData = {
        birthDate: userProfile?.birthDate || '',
        birthTime: userProfile?.birthTime || '',
        birthPlace: userProfile?.birthPlace || '',
        latitude: userProfile?.latitude || 40.7128,
        longitude: userProfile?.longitude || -74.0060
      }
      
      // Load comprehensive analysis from Universal Occult API
      const lunarData = await universalOccultService.calculateLunarChart(birthData, {
        includePhases: true,
        includeMansions: true,
        includeCycles: true
      })
      
      setAnalysis(lunarData)
      
      console.log('✅ FutureSeer: Lunar Astrology analysis loaded successfully:', lunarData)
    } catch (error) {
      console.error('❌ FutureSeer: Failed to load Lunar Astrology analysis:', error)
      setError('Failed to load Lunar Astrology analysis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasCompleteDetails) {
      loadLunarAnalysis()
    }
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Moon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Lunar Astrology</h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your lunar astrology chart</p>
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
            <Moon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Lunar Astrology</h1>
            <p className="text-slate-300 text-lg">Moon-based astrological systems and lunar cycles</p>
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
              value="phases" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Phases
            </TabsTrigger>
            <TabsTrigger 
              value="mansions" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Mansions
            </TabsTrigger>
            <TabsTrigger 
              value="cycles" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Cycles
            </TabsTrigger>
            <TabsTrigger 
              value="transits" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Transits
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-slate-300">🌙 FutureSeer is analyzing your lunar astrology chart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={loadLunarAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Try Again
                </Button>
              </div>
            ) : analysis?.data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lunar Phase Summary */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Moon className="w-5 h-5" />
                      Current Lunar Phase
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-300 mb-2">
                          {analysis.data.lunarPhase?.phase || 'Full Moon'}
                        </div>
                        <div className="text-sm text-slate-400">
                          Illumination: {analysis.data.lunarPhase?.illumination || '100'}%
                        </div>
                        <div className="text-sm text-slate-400">
                          Age: {analysis.data.lunarPhase?.age || '15'} days
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Moon Sign */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Star className="w-5 h-5" />
                      Moon Sign
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-300 mb-2">
                          {analysis.data.moonSign || 'Cancer'}
                        </div>
                        <div className="text-sm text-slate-400">
                          Emotional nature and inner self
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lunar Mansions */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Gem className="w-5 h-5" />
                      Lunar Mansions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.lunarMansions?.slice(0, 3).map((mansion: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{mansion.name || `Mansion ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{mansion.description || 'Lunar mansion influence'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lunar Cycles */}
                <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-300">
                      <Activity className="w-5 h-5" />
                      Lunar Cycles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.data.lunarCycles?.slice(0, 3).map((cycle: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/10 rounded-lg">
                          <div className="font-medium text-amber-300">{cycle.name || `Cycle ${index + 1}`}</div>
                          <div className="text-sm text-slate-400">{cycle.description || 'Lunar cycle influence'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No lunar astrology data available. Please complete your profile.</p>
                <Button onClick={loadLunarAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Generate Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-6 mt-6">
            {analysis?.data?.lunarPhase ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'].map((phase, index) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Moon className="w-5 h-5" />
                        {phase}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-2">
                            {phase === analysis.data.lunarPhase.phase ? 'Current' : 'Upcoming'}
                          </div>
                          <div className="text-amber-300 font-medium">
                            {phase === 'New Moon' ? 'New beginnings' :
                             phase === 'First Quarter' ? 'Action time' :
                             phase === 'Full Moon' ? 'Peak energy' :
                             'Release time'}
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
                <p className="text-slate-400">No lunar phase data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Mansions Tab */}
          <TabsContent value="mansions" className="space-y-6 mt-6">
            {analysis?.data?.lunarMansions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.lunarMansions.map((mansion: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Gem className="w-5 h-5" />
                        {mansion.name || `Mansion ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-400">
                          {mansion.description || 'Lunar mansion influence on personality and destiny'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Degrees: {mansion.degrees || '0° - 30°'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No lunar mansion data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Cycles Tab */}
          <TabsContent value="cycles" className="space-y-6 mt-6">
            {analysis?.data?.lunarCycles ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.lunarCycles.map((cycle: any, index: number) => (
                  <Card key={index} className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50 shadow-xl rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-300">
                        <Activity className="w-5 h-5" />
                        {cycle.name || `Cycle ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-400">
                          {cycle.description || 'Lunar cycle influence on life patterns'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Duration: {cycle.duration || '29.5 days'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No lunar cycle data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Transits Tab */}
          <TabsContent value="transits" className="space-y-6 mt-6">
            <div className="text-center py-8">
              <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Lunar transit analysis coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
