// Streamlined Western Astrology page that directly uses comprehensive profile data
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolData } from '@/hooks/useToolData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

export default function WesternAstrologyPage() {
  const { user, userProfile } = useAuth()
  const { data: westernData, isLoading, error, refetch } = useToolData('Western Astrology')
  const [activeTab, setActiveTab] = useState<'overview' | 'planets' | 'charts' | 'analysis' | 'aspects' | 'coaching'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  if (isLoading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading your Western astrology data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-300 font-semibold mb-2 text-xl">Error Loading Western Astrology Data</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasCompleteDetails) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 text-center">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-300 font-semibold mb-2 text-xl">Complete Your Profile</h3>
            <p className="text-slate-400 mb-4">
              Please complete your birth date, time, and place in your profile to generate Western astrology insights.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!westernData) {
    return (
      <div className="min-h-screen starfield-ultra-sharp text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 text-center">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-300 font-semibold mb-2 text-xl">No Western Astrology Data Available</h3>
            <p className="text-slate-400 mb-4">
              Your comprehensive mystical profile hasn't been generated yet. Please generate it first.
            </p>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen starfield-ultra-sharp text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-blue-300 mb-4 flex items-center justify-center gap-3">
            <Sun className="w-8 h-8 text-blue-400" />
            Western Astrology
            <Moon className="w-8 h-8 text-blue-400" />
          </h1>
          <p className="text-slate-300 text-lg">
            Traditional Western zodiac system with tropical calculations
          </p>
          
          {/* Data Source Indicators */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              COMPREHENSIVE DATA
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-300">
              <Zap className="w-3 h-3 mr-1" />
              FUTURESEER AI
            </Badge>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-blue-500/30 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="planets" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Planets
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Charts
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="aspects" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Aspects
            </TabsTrigger>
            <TabsTrigger value="coaching" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
              Coaching
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Info */}
              <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <User className="w-5 h-5" />
                    Birth Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{userProfile?.birthDate || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{userProfile?.birthTime || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{userProfile?.birthPlace || 'Not set'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Planetary Summary */}
              <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <Star className="w-5 h-5" />
                    Planetary Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {westernData.planetary_positions ? (
                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm">
                        {westernData.planetary_positions.length} planets analyzed
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {westernData.planetary_positions.slice(0, 6).map((planet: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-slate-400">{planet.planet}:</span>
                            <span className="text-blue-300">{planet.sign}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No planetary data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Charts Available */}
              <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <BarChart3 className="w-5 h-5" />
                    Available Charts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {westernData.charts ? (
                    <div className="space-y-2">
                      {Object.entries(westernData.charts).map(([chartName, chartUrl]: [string, any]) => (
                        <div key={chartName} className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm capitalize">
                            {chartName.replace('_', ' ')}:
                          </span>
                          {chartUrl ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No chart data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Planets Tab */}
          <TabsContent value="planets" className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Star className="w-5 h-5" />
                  Planetary Positions & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {westernData.planetary_positions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {westernData.planetary_positions.map((planet: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-serif text-blue-300">{planet.planet}</h3>
                          <Badge variant="outline" className="text-xs">
                            {planet.sign}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">House:</span>
                            <span className="text-slate-300">{planet.house}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Degree:</span>
                            <span className="text-slate-300">{planet.degree?.toFixed(2)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Element:</span>
                            <span className="text-slate-300">{planet.element || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Quality:</span>
                            <span className="text-slate-300">{planet.quality || 'N/A'}</span>
                          </div>
                          {planet.retrograde && (
                            <Badge variant="destructive" className="text-xs">
                              Retrograde
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No planetary data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <BarChart3 className="w-5 h-5" />
                  Western Astrology Charts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {westernData.charts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(westernData.charts).map(([chartName, chartUrl]: [string, any]) => (
                      <div key={chartName} className="space-y-3">
                        <h3 className="font-serif text-blue-300 capitalize">
                          {chartName.replace('_', ' ')} Chart
                        </h3>
                        {chartUrl ? (
                          <div className="relative">
                            <img 
                              src={chartUrl} 
                              alt={`${chartName} chart`}
                              className="w-full h-auto rounded-lg border border-slate-600/30"
                              style={{ borderRadius: '200px' }} // High border radius to obscure watermark
                            />
                            <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                          </div>
                        ) : (
                          <div className="h-64 bg-slate-700/30 rounded-lg border border-slate-600/30 flex items-center justify-center">
                            <p className="text-slate-400">Chart not available</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No chart data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* House Analysis */}
              <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <Home className="w-5 h-5" />
                    House Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {westernData.house_analysis ? (
                    <div className="space-y-3">
                      {westernData.house_analysis.slice(0, 6).map((house: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-serif text-blue-300">House {house.house}</h4>
                            <Badge variant="outline" className="text-xs">
                              {house.sign}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm">{house.focus}</p>
                          <p className="text-slate-400 text-xs mt-1">{house.remarks}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No house analysis available</p>
                  )}
                </CardContent>
              </Card>

              {/* Personality Analysis */}
              <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <Brain className="w-5 h-5" />
                    Personality Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {westernData.personality_analysis ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-serif text-blue-300 mb-2">Life Purpose</h4>
                        <p className="text-slate-300 text-sm">
                          {westernData.personality_analysis.life_purpose}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-serif text-blue-300 mb-2">Career Guidance</h4>
                        <p className="text-slate-300 text-sm">
                          {westernData.personality_analysis.career_guidance}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-serif text-blue-300 mb-2">Spiritual Path</h4>
                        <p className="text-slate-300 text-sm">
                          {westernData.personality_analysis.spiritual_path}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No personality analysis available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aspects Tab */}
          <TabsContent value="aspects" className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Sparkles className="w-5 h-5" />
                  Planetary Aspects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {westernData.aspects ? (
                  <div className="space-y-3">
                    {westernData.aspects.map((aspect: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif text-blue-300">
                            {aspect.planet1} {aspect.aspect} {aspect.planet2}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {aspect.orb?.toFixed(1)}°
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm">{aspect.interpretation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No aspects data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <Card className="backdrop-blur-md bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <MessageCircle className="w-5 h-5" />
                  AI Western Astrology Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif text-blue-300">Ask the Seer</h3>
                  <p className="text-slate-300">
                    Get personalized Western astrology insights and guidance based on your comprehensive astrological profile.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/ask-the-seer'}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-serif font-semibold"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask the Seer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
