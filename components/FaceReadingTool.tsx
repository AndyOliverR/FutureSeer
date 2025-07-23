import { useFaceReadingData } from '@/hooks/use-face-reading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Eye, 
  Heart, 
  Star, 
  Shield, 
  Crown, 
  Calendar,
  BookOpen,
  Lightbulb,
  Zap,
  Feather,
  RefreshCw,
  Sparkles,
  Brain,
  Target,
  Activity,
  Palette
} from 'lucide-react'

export function FaceReadingTool() {
  const { faceReadingData, loading, error, refresh, isStale } = useFaceReadingData()

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            <span className="ml-3 text-slate-300">Analyzing your facial features...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!faceReadingData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Face Reading Data</h3>
          <p className="text-slate-400 mb-4">Complete your profile to generate your facial analysis</p>
        </CardContent>
      </Card>
    )
  }

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-red-400'
      case 'earth': return 'text-yellow-400'
      case 'air': return 'text-blue-400'
      case 'water': return 'text-cyan-400'
      default: return 'text-slate-400'
    }
  }

  const getEnergyColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-orange-400" />
          Facial Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          {isStale && (
            <Badge variant="secondary" className="text-xs">
              Stale Data
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Face Shape and Energy Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-slate-300">Face Shape</span>
                  </div>
                  <p className="text-white font-semibold">{faceReadingData.faceShape}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-slate-300">Energy Score</span>
                  </div>
                  <p className={`text-2xl font-bold ${getEnergyColor(faceReadingData.energyScore)}`}>
                    {faceReadingData.energyScore}/100
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dominant Features */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-slate-300">Dominant Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {faceReadingData.dominantFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personality Traits */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-slate-300">Personality Traits</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {faceReadingData.personalityTraits.map((trait, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-orange-400" />
                      <span className="text-sm text-slate-300">{trait}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faceReadingData.features.map((feature, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{feature.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getElementColor(feature.element)}`}>
                          {feature.element}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{feature.description}</p>
                      <p className="text-sm text-slate-300 mb-2">{feature.interpretation}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Energy:</span>
                        <div className="flex-1 bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full" 
                            style={{ width: `${feature.energy * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{feature.energy}/10</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Element Balance</h4>
                <div className="space-y-3">
                  {Object.entries(faceReadingData.elementBalance).map(([element, percentage]) => (
                    <div key={element} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium capitalize ${getElementColor(element)}`}>
                          {element}
                        </span>
                        <span className="text-sm text-slate-400">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            element === 'fire' ? 'bg-red-400' :
                            element === 'earth' ? 'bg-yellow-400' :
                            element === 'air' ? 'bg-blue-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Life Path */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-slate-300">Life Path</span>
                    </div>
                    <p className="text-sm text-slate-300">{faceReadingData.lifePath}</p>
                  </CardContent>
                </Card>

                {/* Compatibility */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-slate-300">Compatibility</span>
                    </div>
                    <p className="text-sm text-slate-300">{faceReadingData.compatibility}</p>
                  </CardContent>
                </Card>

                {/* Health Indicators */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-slate-300">Health Indicators</span>
                    </div>
                    <div className="space-y-1">
                      {faceReadingData.healthIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Career Guidance */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-slate-300">Career Guidance</span>
                    </div>
                    <p className="text-sm text-slate-300">{faceReadingData.careerGuidance}</p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 