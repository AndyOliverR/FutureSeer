import { useState } from 'react'
import { usePalmistryData } from '@/hooks/use-palmistry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  Hand, 
  Heart, 
  Star, 
  Shield, 
  Crown, 
  Calendar,
  Lightbulb,
  Zap,
  Feather,
  Eye,
  RefreshCw,
  Sparkles,
  Brain,
  Target,
  Activity,
  Palette,
  Clock,
  Compass
} from 'lucide-react'

export function PalmistryTool() {
  const { palmistryData, loading, error, refresh, analyzePalm } = usePalmistryData()
  const [hand, setHand] = useState<'left' | 'right' | 'both'>('right')
  const [dominantHand, setDominantHand] = useState<'left' | 'right'>('right')
  const [age, setAge] = useState(25)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      await analyzePalm(hand, dominantHand, age, gender)
    } catch (error) {
      console.error('Error analyzing palm:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            <span className="ml-3 text-slate-300">Reading your palm lines...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Hand className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!palmistryData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Hand className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Palmistry Data</h3>
          <p className="text-slate-400">Complete your profile to generate your palm reading</p>
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
          <Hand className="w-5 h-5 text-green-400" />
          Palm Reading Analysis
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-green-500 text-green-400 hover:bg-green-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Hand to Analyze</label>
              <select
                value={hand}
                onChange={(e) => setHand(e.target.value as any)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="left">Left Hand (Past & Potential)</option>
                <option value="right">Right Hand (Present & Active)</option>
                <option value="both">Both Hands (Complete Analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Dominant Hand</label>
              <select
                value={dominantHand}
                onChange={(e) => setDominantHand(e.target.value as any)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                min="1"
                max="120"
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing your palm...
              </>
            ) : (
              <>
                <Hand className="w-4 h-4 mr-2" />
                Analyze My Palm
              </>
            )}
          </Button>
        </div>

        {/* Current Analysis */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="lines" className="text-xs">Lines</TabsTrigger>
            <TabsTrigger value="mounts" className="text-xs">Mounts</TabsTrigger>
            <TabsTrigger value="fingers" className="text-xs">Fingers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Palm Shape and Energy Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-slate-300">Palm Shape</span>
                  </div>
                  <p className="text-white font-semibold">{palmistryData.palmShape}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-slate-300">Energy Score</span>
                  </div>
                  <p className={`text-2xl font-bold ${getEnergyColor(palmistryData.energyScore)}`}>
                    {palmistryData.energyScore}/100
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Elements */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Elemental Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Primary:</span>
                      <span className={`font-medium ${getElementColor(palmistryData.elements.primary)}`}>
                        {palmistryData.elements.primary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Secondary:</span>
                      <span className={`font-medium ${getElementColor(palmistryData.elements.secondary)}`}>
                        {palmistryData.elements.secondary}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-slate-300">Conflict:</span>
                      <span className={`font-medium ${getElementColor(palmistryData.elements.conflict)}`}>
                        {palmistryData.elements.conflict}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-300">Harmony:</span>
                      <span className={`font-medium ${getElementColor(palmistryData.elements.harmony)}`}>
                        {palmistryData.elements.harmony}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Life Path */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-300">Life Path</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{palmistryData.lifePath}</p>
              </CardContent>
            </Card>

            {/* Timing */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Timing Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">Current Phase:</span>
                    <span className="text-white font-medium">{palmistryData.timing.currentPhase}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-300">Favorable Periods:</span>
                    <div className="mt-1 space-y-1">
                      {palmistryData.timing.favorablePeriods.map((period, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">{period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lines" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {palmistryData.lines.map((line, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{line.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getElementColor(line.element)}`}>
                          {line.element}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-slate-300">Length:</span> <span className="text-white">{line.length}</span></div>
                        <div><span className="font-medium text-slate-300">Depth:</span> <span className="text-white">{line.depth}</span></div>
                        <div><span className="font-medium text-slate-300">Quality:</span> <span className="text-white">{line.quality}</span></div>
                        <div><span className="font-medium text-slate-300">Energy:</span> <span className={`font-medium ${getEnergyColor(line.energy * 10)}`}>{line.energy}/10</span></div>
                      </div>
                      <p className="text-slate-300 mt-3 text-sm">{line.interpretation}</p>
                      <p className="text-slate-400 mt-2 text-xs">{line.timing}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mounts" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {palmistryData.mounts.map((mount, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{mount.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getElementColor(mount.element)}`}>
                          {mount.element}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-slate-300">Prominence:</span> <span className="text-white">{mount.prominence}</span></div>
                        <div><span className="font-medium text-slate-300">Energy:</span> <span className={`font-medium ${getEnergyColor(mount.energy * 10)}`}>{mount.energy}/10</span></div>
                      </div>
                      <p className="text-slate-300 mt-3 text-sm">{mount.interpretation}</p>
                      <p className="text-slate-400 mt-2 text-xs">{mount.influence}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fingers" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(palmistryData.fingers).map(([finger, details]) => (
                  <Card key={finger} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white capitalize">{finger} Finger</h4>
                        <Badge variant="outline" className={`text-xs ${getElementColor(details.element)}`}>
                          {details.element}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-slate-300">Length:</span> <span className="text-white">{details.length}</span></div>
                        <div><span className="font-medium text-slate-300">Flexibility:</span> <span className="text-white">{details.flexibility}</span></div>
                        <div><span className="font-medium text-slate-300">Energy:</span> <span className={`font-medium ${getEnergyColor(details.energy * 10)}`}>{details.energy}/10</span></div>
                      </div>
                      <p className="text-slate-300 mt-3 text-sm">{details.interpretation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 