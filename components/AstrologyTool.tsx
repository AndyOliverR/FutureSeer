"use client"

import { useAstroData } from '@/hooks/useAstroData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Star, 
  Heart, 
  Target, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Lightbulb,
  Zap,
  Crown,
  Shield,
  Sparkles,
  RefreshCw
} from 'lucide-react'

export function AstrologyTool() {
  const { astroData, loading, error, refresh, isStale } = useAstroData()

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Calculating your astrological profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Star className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!astroData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Astrological Profile Required</h3>
          <p className="text-slate-400 mb-4">
            Please complete your profile with birth details to access astrological insights.
          </p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          Astrological Profile
          {isStale && <Badge variant="secondary" className="ml-2">Stale</Badge>}
        </CardTitle>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="planets" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Planets
            </TabsTrigger>
            <TabsTrigger value="houses" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Houses
            </TabsTrigger>
            <TabsTrigger value="aspects" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Aspects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">☀️</div>
                <div className="text-sm text-slate-400">Sun Sign</div>
                <div className="text-lg font-semibold text-white">{astroData.sunSign}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">🌙</div>
                <div className="text-sm text-slate-400">Moon Sign</div>
                <div className="text-lg font-semibold text-white">{astroData.moonSign}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm text-slate-400">Rising Sign</div>
                <div className="text-lg font-semibold text-white">{astroData.risingSign}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Personality Traits
              </h4>
              <div className="flex flex-wrap gap-2">
                {astroData.personalityTraits?.map((trait: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-red-500/50 text-red-400">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Life Path
              </h4>
              <p className="text-slate-300 leading-relaxed">{astroData.lifePath}</p>
            </div>
          </TabsContent>

          <TabsContent value="planets" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {astroData.planets?.map((planet: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{planet.symbol || '🪐'}</div>
                      <div>
                        <div className="font-semibold text-white">{planet.name}</div>
                        <div className="text-sm text-slate-400">{planet.sign} • House {planet.house}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">{planet.degree}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="houses" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {astroData.houses?.map((house: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">House {house.number}</div>
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        {house.sign}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400">{house.degree}°</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="aspects" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {astroData.aspects?.map((aspect: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{aspect.planet1} {aspect.aspect} {aspect.planet2}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">{aspect.orb}° orb</div>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                        {aspect.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 