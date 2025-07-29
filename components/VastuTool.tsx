'use client';

import { useVastu } from '@/hooks/use-vastu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Home, 
  Compass, 
  Target, 
  Star, 
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

export function VastuTool() {
  const { propertyData, analysis, loading, error, performVastuAnalysis, resetData } = useVastu()

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Analyzing your space harmony...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Home className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Property Details Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Details
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!propertyData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Home className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Vastu Analysis Required</h3>
          <p className="text-slate-400 mb-4">
            Please provide your property details to access Vastu Shastra analysis.
          </p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Details
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-400" />
          Vastu Analysis
        </CardTitle>
        <Button
          onClick={resetData}
          variant="outline"
          size="sm"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="directions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Directions
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="remedies" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Remedies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm text-slate-400">Property Type</div>
                <div className="text-lg font-semibold text-white">{propertyData.type}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm text-slate-400">Construction Year</div>
                <div className="text-lg font-semibold text-white">{propertyData.constructionYear}</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-slate-400">Analysis Focus</div>
                <div className="text-lg font-semibold text-white">{propertyData.analysisFocus}</div>
              </div>
            </div>
            
            {analysis && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-green-400" />
                  Vastu Score
                </h4>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-green-400">{analysis.vastuScore || 85}%</div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                        style={{ width: `${analysis.vastuScore || 85}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{analysis.overview}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="directions" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysis?.directions?.map((direction: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{direction.name}</div>
                      <Badge variant="outline" className={`${
                        direction.status === 'good' ? 'border-green-500 text-green-400' :
                        direction.status === 'moderate' ? 'border-yellow-500 text-yellow-400' :
                        'border-red-500 text-red-400'
                      }`}>
                        {direction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">{direction.description}</p>
                    {direction.recommendations && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">Recommendations:</p>
                        <ul className="text-xs text-slate-400">
                          {direction.recommendations.map((rec: string, i: number) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {analysis?.rooms?.map((room: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{room.icon}</div>
                      <div>
                        <div className="font-semibold text-white">{room.name}</div>
                        <div className="text-sm text-slate-400">{room.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`${
                        room.vastuScore >= 80 ? 'border-green-500 text-green-400' :
                        room.vastuScore >= 60 ? 'border-yellow-500 text-yellow-400' :
                        'border-red-500 text-red-400'
                      }`}>
                        {room.vastuScore}%
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">{room.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="remedies" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {analysis?.remedies?.map((remedy: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{remedy.title}</h4>
                      <Badge variant="outline" className={`${
                        remedy.priority === 'high' ? 'border-red-500 text-red-400' :
                        remedy.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        'border-green-500 text-green-400'
                      }`}>
                        {remedy.priority}
                      </Badge>
                    </div>
                    <p className="text-slate-300 mb-2">{remedy.description}</p>
                    <div className="text-sm text-slate-400">
                      <strong>Implementation:</strong> {remedy.implementation}
                    </div>
                    {remedy.benefits && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500">Benefits:</p>
                        <ul className="text-xs text-slate-400">
                          {remedy.benefits.map((benefit: string, i: number) => (
                            <li key={i}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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