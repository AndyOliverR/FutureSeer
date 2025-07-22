import { useNumerologyData } from '@/hooks/use-numerology-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Hash, 
  Heart, 
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

export function NumerologyTool() {
  const { numerologyData, loading, error, refresh, isStale } = useNumerologyData()

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Calculating your numerology profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Hash className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!numerologyData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Hash className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Numerology Data</h3>
          <p className="text-slate-400">Unable to generate numerology profile.</p>
        </CardContent>
      </Card>
    )
  }

  const getNumberColor = (number: number) => {
    if (numerologyData.masterNumbers.includes(number)) return 'text-yellow-400'
    if (numerologyData.karmicDebts.includes(number)) return 'text-red-400'
    return 'text-purple-400'
  }

  const getNumberIcon = (number: number) => {
    if (numerologyData.masterNumbers.includes(number)) return <Crown className="w-4 h-4" />
    if (numerologyData.karmicDebts.includes(number)) return <Shield className="w-4 h-4" />
    return <Hash className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Your Numerology Profile
              </CardTitle>
              <p className="text-sm text-slate-400">
                Discover the hidden meanings in your name and birth date through the ancient science of numerology.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isStale && (
                <Badge variant="outline" className="border-orange-500 text-orange-400">
                  Data may be outdated
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-600">
          <TabsTrigger value="core" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Core Numbers
          </TabsTrigger>
          <TabsTrigger value="current" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Current
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Insights
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Core Numbers Tab */}
        <TabsContent value="core" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Life Path Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Life Path Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.lifePathNumber)}`}>
                    {numerologyData.lifePathNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    {numerologyData.insights.lifePurpose}
                  </p>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    Core Purpose
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Destiny Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-400" />
                  Destiny Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.destinyNumber)}`}>
                    {numerologyData.destinyNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Natural talents and abilities
                  </p>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Natural Gifts
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Soul Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Soul Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.soulNumber)}`}>
                    {numerologyData.soulNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Inner desires and motivations
                  </p>
                  <Badge variant="outline" className="border-pink-500 text-pink-400">
                    Inner Self
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Personality Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  Personality Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.personalityNumber)}`}>
                    {numerologyData.personalityNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    How others see you
                  </p>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Outer Self
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Birth Day Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Birth Day Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.birthDayNumber)}`}>
                    {numerologyData.birthDayNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Natural talents and abilities
                  </p>
                  <Badge variant="outline" className="border-orange-500 text-orange-400">
                    Natural Gifts
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Maturity Number */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Maturity Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getNumberColor(numerologyData.maturityNumber)}`}>
                    {numerologyData.maturityNumber}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Life purpose in later years
                  </p>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                    Future Purpose
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Current Numbers Tab */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Year */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Personal Year {numerologyData.personalYearNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {numerologyData.personalYearNumber}
                  </div>
                  <p className="text-sm text-slate-300">
                    This year's energy and focus
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Month */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Personal Month {numerologyData.personalMonthNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {numerologyData.personalMonthNumber}
                  </div>
                  <p className="text-sm text-slate-300">
                    This month's energy and focus
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Day */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Personal Day {numerologyData.personalDayNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {numerologyData.personalDayNumber}
                  </div>
                  <p className="text-sm text-slate-300">
                    Today's energy and focus
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Special Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Master Numbers */}
            {numerologyData.masterNumbers.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Master Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {numerologyData.masterNumbers.map((number, index) => (
                      <Badge key={index} className="bg-yellow-900/30 text-yellow-400 border-yellow-500/30">
                        {number}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-2">
                    Spiritual gifts and higher purpose
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Karmic Debts */}
            {numerologyData.karmicDebts.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Karmic Debts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {numerologyData.karmicDebts.map((number, index) => (
                      <Badge key={index} className="bg-red-900/30 text-red-400 border-red-500/30">
                        {number}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-2">
                    Important life lessons to learn
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {numerologyData.insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  Growth Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {numerologyData.insights.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Career Paths */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Career Paths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {numerologyData.insights.careerPaths.map((career, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{career}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Compatibility */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {numerologyData.insights.compatibility.map((compat, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{compat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pinnacles */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Life Pinnacles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {numerologyData.pinnacles.map((pinnacle, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Pinnacle {index + 1}</span>
                      <Badge className={`${getNumberColor(pinnacle)} bg-slate-700/50`}>
                        {pinnacle}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Life Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {numerologyData.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Challenge {index + 1}</span>
                      <Badge className={`${getNumberColor(challenge)} bg-slate-700/50`}>
                        {challenge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Letter Analysis */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Name Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {Object.entries(numerologyData.letterAnalysis).map(([letter, value]) => (
                    <div key={letter} className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="text-lg font-bold text-purple-400">{letter}</div>
                      <div className="text-xs text-slate-400">{value}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 