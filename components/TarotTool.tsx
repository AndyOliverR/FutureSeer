import { useState } from 'react'
import { devLog } from '@/lib/devLogger';
import { useTarotData } from '@/hooks/use-tarot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  Star,
  Shield,
  Heart,
  Lightbulb,
  Zap,
  RefreshCw,
  Activity,
  Palette,
  Clock,
  Target
} from 'lucide-react'
import { MysticalLoadingState } from '@/components/MysticalLoadingState'

export function TarotTool() {
  const { tarotData, loading, error, refresh, drawTarot } = useTarotData()
  const [question, setQuestion] = useState('What guidance does the Tarot offer for my current path?')
  const [spreadType, setSpreadType] = useState('three')
  const [isDrawing, setIsDrawing] = useState(false)

  const tarotSpreads = [
    { key: 'single', name: 'Single Card', description: 'A single card for quick guidance.' },
    { key: 'three', name: 'Three-Card Spread', description: 'Past, Present, and Future insight.' },
    { key: 'celtic', name: 'Celtic Cross', description: 'Classic 10-card spread for deep insight.' },
    { key: 'five', name: 'Five-Card Spread', description: 'Situation, Challenge, Advice, Outcome, Clarifier.' },
    { key: 'relationship', name: 'Relationship Spread', description: 'You, Partner, Relationship, Challenge, Outcome.' }
  ]

  const handleDrawTarot = async () => {
    setIsDrawing(true)
    try {
      await drawTarot(question, spreadType)
    } catch (error) {
      devLog.error('Error drawing tarot:', error, 'TarotTool')
    } finally {
      setIsDrawing(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <MysticalLoadingState
            variant="card"
            message="Shuffling the Tarot deck…"
            subline="The cards align with your saved profile."
          />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!tarotData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Tarot Data</h3>
          <p className="text-slate-400">Complete your profile to generate your Tarot reading</p>
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

  const selectedSpread = tarotSpreads.find(s => s.key === spreadType) || tarotSpreads[1]

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Tarot Reading
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drawing Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Your Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the Tarot for guidance..."
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Tarot Spread</label>
            <select
              value={spreadType}
              onChange={(e) => setSpreadType(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {tarotSpreads.map(spread => (
                <option key={spread.key} value={spread.key}>
                  {spread.name} - {spread.description}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleDrawTarot}
            disabled={isDrawing || !question.trim()}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isDrawing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Drawing your cards...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Draw {selectedSpread.name}
              </>
            )}
          </Button>
        </div>
        {/* Current Reading */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="cards" className="text-xs">Cards</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {/* Spread and Energy Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-300">Spread</span>
                  </div>
                  <p className="text-white font-semibold">{tarotData.spreadName}</p>
                  <p className="text-sm text-slate-400">{selectedSpread.description}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-300">Energy Score</span>
                  </div>
                  <p className={`text-2xl font-bold ${getEnergyColor(tarotData.energyScore)}`}>
                    {tarotData.energyScore}/100
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Overall Reading */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Tarot Wisdom</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{tarotData.overallReading}</p>
              </CardContent>
            </Card>
            {/* Recommendations */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Tarot Recommendations</h4>
                <div className="space-y-2">
                  {tarotData.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cards" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tarotData.cards.map((card: { name: string; image: string; element?: string; isUpright: boolean; position?: string; upright?: string; reversed?: string; suit?: string; numerology?: string | number }, index: number) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-yellow-200/80 to-yellow-500/80 flex items-center justify-center">
                        <img
                          src={`/tarot/${card.image}`}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{card.name}</h4>
                          <Badge variant="outline" className={`text-xs ${getElementColor(card.element || '')}`}>{card.element}</Badge>
                          <Badge variant={card.isUpright ? 'default' : 'destructive'} className="text-xs">
                            {card.isUpright ? 'Upright' : 'Reversed'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 mb-1">{card.position}</div>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium text-slate-300">Meaning:</span> <span className="text-white">{card.isUpright ? card.upright : card.reversed}</span></div>
                          {card.suit && <div><span className="font-medium text-slate-300">Suit:</span> <span className="text-white">{card.suit}</span></div>}
                          {card.numerology && <div><span className="font-medium text-slate-300">Numerology:</span> <span className="text-white">{card.numerology}</span></div>}
                        </div>
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
                <h4 className="font-semibold text-white mb-4">Elemental Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('fire')}`}>{tarotData.elementalBalance.fire}</div>
                    <div className="text-sm text-slate-400">Fire</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('earth')}`}>{tarotData.elementalBalance.earth}</div>
                    <div className="text-sm text-slate-400">Earth</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('air')}`}>{tarotData.elementalBalance.air}</div>
                    <div className="text-sm text-slate-400">Air</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getElementColor('water')}`}>{tarotData.elementalBalance.water}</div>
                    <div className="text-sm text-slate-400">Water</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Primary:</span>
                      <span className={`font-medium ${getElementColor(tarotData.elementalBalance.primary)}`}>
                        {tarotData.elementalBalance.primary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Secondary:</span>
                      <span className={`font-medium ${getElementColor(tarotData.elementalBalance.secondary)}`}>
                        {tarotData.elementalBalance.secondary}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-slate-300">Conflict:</span>
                      <span className={`font-medium ${getElementColor(tarotData.elementalBalance.conflict)}`}>
                        {tarotData.elementalBalance.conflict}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-300">Harmony:</span>
                      <span className={`font-medium ${getElementColor(tarotData.elementalBalance.harmony)}`}>
                        {tarotData.elementalBalance.harmony}
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
                <h4 className="font-semibold text-white mb-4">Timing Analysis</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-300">Current Phase:</span>
                    <span className="text-white font-medium">{tarotData.timing.currentPhase}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-300">Favorable Periods:</span>
                    <div className="mt-1 space-y-1">
                      {tarotData.timing.favorablePeriods.map((period: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">{period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-300">Challenges:</span>
                    <div className="mt-1 space-y-1">
                      {tarotData.timing.challenges.map((challenge: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-300">Opportunities:</span>
                    <div className="mt-1 space-y-1">
                      {tarotData.timing.opportunities.map((opportunity: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-slate-300">{opportunity}</span>
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