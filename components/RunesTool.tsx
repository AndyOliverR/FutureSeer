import { useState } from 'react'
import { devLog } from '@/lib/devLogger';
import { useRunes } from '@/hooks/use-runes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sparkles, 
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
  Target,
  Brain,
  Activity,
  Palette,
  Clock,
  Compass
} from 'lucide-react'

export function RunesTool() {
  const { 
    question, 
    setQuestion, 
    spreadType, 
    setSpreadType, 
    reading, 
    isLoading, 
    error, 
    performRuneReading, 
    resetData 
  } = useRunes()
  const [isCasting, setIsCasting] = useState(false)
  
  // Use reading data for display
  const runesData = reading ? {
    spreadName: reading.spreadName,
    energyScore: reading.energyScore,
    overallReading: reading.overallReading,
    recommendations: reading.recommendations,
    runes: reading.runes,
    elementalBalance: reading.elementalBalance,
    timing: reading.timing,
  } : null

  const runeSpreads = [
    {
      key: "single",
      name: "Single Rune",
      description: "A single rune for quick guidance and insight.",
      positions: ["Message"]
    },
    {
      key: "three",
      name: "Three Runes",
      description: "Past, Present, and Future insight.",
      positions: ["Past", "Present", "Future"]
    },
    {
      key: "five",
      name: "Five Runes",
      description: "Situation, Challenge, Advice, Outcome, and Hidden Influence.",
      positions: ["Situation", "Challenge", "Advice", "Outcome", "Hidden"]
    },
    {
      key: "nine",
      name: "Nine Runes",
      description: "Comprehensive reading covering all aspects of life.",
      positions: ["Self", "Environment", "Past", "Future", "Hopes", "Fears", "Advice", "Outcome", "Hidden"]
    }
  ]

  const handleCastRunes = async () => {
    setIsCasting(true)
    try {
      await performRuneReading()
    } catch (error) {
      devLog.error('Error casting runes:', error, 'RunesTool')
    } finally {
      setIsCasting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
            <span className="ml-3 text-amber-300">Casting the ancient runes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">Error</h3>
          <p className="text-amber-200 mb-4">{error}</p>
          <Button 
            variant="outline" 
            className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
            onClick={resetData}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!runesData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">No Rune Data</h3>
          <p className="text-amber-200">Ask a question and cast the runes to begin</p>
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

  const selectedSpread = runeSpreads.find(s => s.key === spreadType) || runeSpreads[1]

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Rune Casting
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCastRunes}
            className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
            disabled={isCasting || isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Casting Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-amber-300">Your Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the runes for guidance..."
              className="bg-slate-700/50 border-slate-600 text-amber-200 placeholder:text-amber-400/50"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-amber-300">Rune Spread</label>
            <select
              value={spreadType}
              onChange={(e) => setSpreadType(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {runeSpreads.map(spread => (
                <option key={spread.key} value={spread.key}>
                  {spread.name} - {spread.description}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleCastRunes}
            disabled={isCasting || isLoading || !question.trim() || !spreadType}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isCasting || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Casting the runes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Cast {selectedSpread.positions.length} Rune{selectedSpread.positions.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Current Reading */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="runes" className="text-xs">Runes</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Spread and Energy Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">Spread</span>
                  </div>
                  <p className="text-amber-200 font-semibold">{runesData.spreadName}</p>
                  <p className="text-sm text-amber-300/80">{selectedSpread.description}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">Energy Score</span>
                  </div>
                  <p className={`text-2xl font-bold ${getEnergyColor(runesData.energyScore)}`}>
                    {runesData.energyScore}/100
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Overall Reading */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Runic Wisdom</span>
                </div>
                <p className="text-amber-200 text-sm leading-relaxed">{runesData.overallReading}</p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">Runic Recommendations</h4>
                <div className="space-y-2">
                  {runesData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-amber-200">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runes" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {runesData.runes.map((rune, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{rune.symbol}</span>
                          <div>
                            <h4 className="font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">{rune.name}</h4>
                            <p className="text-xs text-amber-300">{rune.position}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className={`text-xs ${getElementColor(rune.element)}`}>
                            {rune.element}
                          </Badge>
                          <Badge variant={rune.isReversed ? "destructive" : "default"} className="text-xs">
                            {rune.isReversed ? 'Reversed' : 'Upright'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-amber-300">Meaning:</span> <span className="text-amber-200">{rune.meaning}</span></div>
                        <div><span className="font-medium text-amber-300">Energy:</span> <span className={`font-medium ${getEnergyColor(rune.energy * 10)}`}>{rune.energy}/10</span></div>
                        <div><span className="font-medium text-amber-300">Deity:</span> <span className="text-amber-200">{rune.deity}</span></div>
                      </div>
                      <p className="text-amber-200 mt-3 text-sm">
                        {rune.isReversed ? rune.reversed : rune.upright}
                      </p>
                      <p className="text-amber-300/70 mt-2 text-xs">{rune.timing}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">Elemental Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('fire')}`}>{runesData.elementalBalance.fire}</div>
                    <div className="text-sm text-amber-300">Fire</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('earth')}`}>{runesData.elementalBalance.earth}</div>
                    <div className="text-sm text-amber-300">Earth</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('air')}`}>{runesData.elementalBalance.air}</div>
                    <div className="text-sm text-amber-300">Air</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('water')}`}>{runesData.elementalBalance.water}</div>
                    <div className="text-sm text-amber-300">Water</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-amber-300">Primary:</span>
                      <span className={`font-medium ${getElementColor(runesData.elementalBalance.primary)}`}>
                        {runesData.elementalBalance.primary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-amber-300">Secondary:</span>
                      <span className={`font-medium ${getElementColor(runesData.elementalBalance.secondary)}`}>
                        {runesData.elementalBalance.secondary}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-amber-300">Conflict:</span>
                      <span className={`font-medium ${getElementColor(runesData.elementalBalance.conflict)}`}>
                        {runesData.elementalBalance.conflict}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-amber-300">Harmony:</span>
                      <span className={`font-medium ${getElementColor(runesData.elementalBalance.harmony)}`}>
                        {runesData.elementalBalance.harmony}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">Timing Analysis</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-300">Current Phase:</span>
                    <span className="text-amber-200 font-medium">{runesData.timing.currentPhase}</span>
                  </div>
                  <div>
                    <span className="text-sm text-amber-300">Favorable Periods:</span>
                    <div className="mt-1 space-y-1">
                      {runesData.timing.favorablePeriods.map((period, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-amber-200">{period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-amber-300">Challenges:</span>
                    <div className="mt-1 space-y-1">
                      {runesData.timing.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm text-amber-200">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-amber-300">Opportunities:</span>
                    <div className="mt-1 space-y-1">
                      {runesData.timing.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-amber-200">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 