import { useState } from 'react'
import { devLog } from '@/lib/devLogger';
import { useIChingData } from '@/hooks/use-iching'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
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

export function IChingTool() {
  const { ichingData, loading, error, refresh, consultIChing } = useIChingData()
  const [question, setQuestion] = useState('')
  const [method, setMethod] = useState<'coins' | 'yarrow' | 'random'>('coins')
  const [isConsulting, setIsConsulting] = useState(false)

  const handleConsult = async () => {
    if (!question.trim()) return

    setIsConsulting(true)
    try {
      await consultIChing(question, method)
    } catch (error) {
      devLog.error('Error consulting I Ching:', error, 'IChingTool')
    } finally {
      setIsConsulting(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <span className="ml-3 text-slate-300">Consulting the ancient wisdom...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!ichingData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No I Ching Data</h3>
          <p className="text-slate-400">Complete your profile to generate your I Ching analysis</p>
        </CardContent>
      </Card>
    )
  }

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Metal': return 'text-gray-400'
      case 'Earth': return 'text-yellow-400'
      case 'Water': return 'text-blue-400'
      case 'Wood': return 'text-green-400'
      case 'Fire': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'coins': return 'text-yellow-400'
      case 'yarrow': return 'text-green-400'
      case 'random': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-yellow-400" />
          I Ching Consultation
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consultation Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Your Question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here... (e.g., 'What should I focus on in my career?')"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Consultation Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'coins', label: 'Three Coins', desc: 'Traditional coin tossing method' },
                { id: 'yarrow', label: 'Yarrow Stalks', desc: 'Ancient yarrow stalk method' },
                { id: 'random', label: 'Random', desc: 'Computer-generated hexagram' }
              ].map((methodOption) => (
                <button
                  key={methodOption.id}
                  onClick={() => setMethod(methodOption.id as any)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    method === methodOption.id
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="font-medium text-white">{methodOption.label}</div>
                  <div className="text-sm text-slate-400">{methodOption.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleConsult}
            disabled={isConsulting || !question.trim()}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isConsulting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Consulting the I Ching...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Consult the I Ching
              </>
            )}
          </Button>
        </div>

        {/* Current Analysis */}
        <Tabs defaultValue="hexagram" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="hexagram" className="text-xs">Hexagram</TabsTrigger>
            <TabsTrigger value="interpretation" className="text-xs">Interpretation</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
          </TabsList>

          <TabsContent value="hexagram" className="space-y-4">
            {/* Hexagram Details */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Hexagram {ichingData.hexagram.number}: {ichingData.hexagram.name}
                  </h3>
                  <Badge variant="outline" className={getElementColor(ichingData.hexagram.element)}>
                    {ichingData.hexagram.element}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-slate-300">Chinese:</span> <span className="text-white">{ichingData.hexagram.chinese} ({ichingData.hexagram.pinyin})</span></div>
                  <div><span className="font-medium text-slate-300">Trigram:</span> <span className="text-white">{ichingData.hexagram.trigram}</span></div>
                  <div><span className="font-medium text-slate-300">Meaning:</span> <span className="text-white">{ichingData.hexagram.meaning}</span></div>
                </div>
                <p className="text-slate-300 mt-3 text-sm">{ichingData.hexagram.description}</p>
              </CardContent>
            </Card>

            {/* Lines */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-3">The Six Lines</h4>
                <div className="space-y-3">
                  {ichingData.hexagram.lines.map((line, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        line.changing
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-slate-600 bg-slate-600/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">Line {line.position}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getElementColor(line.element)}>
                            {line.element}
                          </Badge>
                          {line.changing && (
                            <Badge variant="outline" className="text-orange-400 border-orange-400">
                              Changing
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-300 mb-2 text-sm">{line.text}</p>
                      <p className="text-sm text-slate-400">{line.meaning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Changing Lines */}
            {ichingData.changingLines.count > 0 && (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-white mb-3">Transformation</h4>
                  <p className="text-slate-300 text-sm mb-2">{ichingData.changingLines.significance}</p>
                  <p className="text-slate-300 text-sm">{ichingData.changingLines.transformation}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interpretation" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Overall Interpretation */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-300">Overall Interpretation</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{ichingData.interpretation.overall}</p>
                  </CardContent>
                </Card>

                {/* Advice */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">Advice</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{ichingData.interpretation.advice}</p>
                  </CardContent>
                </Card>

                {/* Warning */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-slate-300">Warning</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{ichingData.interpretation.warning}</p>
                  </CardContent>
                </Card>

                {/* Opportunity */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-slate-300">Opportunity</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{ichingData.interpretation.opportunity}</p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Timing Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Season:</span>
                      <span className="text-white font-medium">{ichingData.timing.season}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Element:</span>
                      <span className={`font-medium ${getElementColor(ichingData.timing.element)}`}>
                        {ichingData.timing.element}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Direction:</span>
                      <span className="text-white font-medium">{ichingData.timing.direction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Time of Day:</span>
                      <span className="text-white font-medium">{ichingData.timing.timeOfDay}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Favorable:</span>
                      <Badge variant={ichingData.timing.favorable ? "default" : "destructive"}>
                        {ichingData.timing.favorable ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Elemental Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Primary:</span>
                      <span className={`font-medium ${getElementColor(ichingData.elements.primary)}`}>
                        {ichingData.elements.primary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Secondary:</span>
                      <span className={`font-medium ${getElementColor(ichingData.elements.secondary)}`}>
                        {ichingData.elements.secondary}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-slate-300">Conflict:</span>
                      <span className={`font-medium ${getElementColor(ichingData.elements.conflict)}`}>
                        {ichingData.elements.conflict}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-300">Harmony:</span>
                      <span className={`font-medium ${getElementColor(ichingData.elements.harmony)}`}>
                        {ichingData.elements.harmony}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trigram Analysis */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-4">Trigram Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">Combination:</span>
                    <span className="text-white font-medium">{ichingData.trigramAnalysis.combination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">Relationship:</span>
                    <span className="text-white font-medium">{ichingData.trigramAnalysis.relationship}</span>
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