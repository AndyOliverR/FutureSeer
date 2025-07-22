import { useAngelNumbersData } from '@/hooks/use-angel-numbers-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Sparkles, 
  Heart, 
  Star, 
  Shield, 
  Crown, 
  Calendar,
  BookOpen,
  Lightbulb,
  Zap,
  Feather,
  Eye,
  RefreshCw
} from 'lucide-react'

export function AngelNumbersTool() {
  const { angelNumbersData, loading, error, refresh, isStale } = useAngelNumbersData()

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-slate-300">Receiving angelic messages...</span>
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
          <h3 className="text-lg font-semibold text-white mb-2">Profile Required</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!angelNumbersData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Angel Numbers Data</h3>
          <p className="text-slate-400">Unable to receive angelic messages.</p>
        </CardContent>
      </Card>
    )
  }

  const getAngelNumberColor = (number: number) => {
    if (number >= 1111) return 'text-purple-400'
    if (number >= 111) return 'text-blue-400'
    if (number >= 11) return 'text-green-400'
    return 'text-yellow-400'
  }

  const getAngelNumberIcon = (number: number) => {
    if (number >= 1111) return <Crown className="w-4 h-4" />
    if (number >= 111) return <Star className="w-4 h-4" />
    if (number >= 11) return <Shield className="w-4 h-4" />
    return <Sparkles className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Angel Numbers
              </CardTitle>
              <p className="text-sm text-slate-400">
                Discover the divine messages and spiritual guidance encoded in your personal angel numbers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isStale && (
                <Badge variant="outline" className="border-orange-500 text-orange-400">
                  Messages may be outdated
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

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-600">
          <TabsTrigger value="personal" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Personal Angels
          </TabsTrigger>
          <TabsTrigger value="current" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Current Messages
          </TabsTrigger>
          <TabsTrigger value="guidance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Angelic Guidance
          </TabsTrigger>
          <TabsTrigger value="synchronicities" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Synchronicities
          </TabsTrigger>
        </TabsList>

        {/* Personal Angel Numbers Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Life Path Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  Life Path Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getAngelNumberColor(angelNumbersData.lifePathAngel)}`}>
                    {angelNumbersData.lifePathAngel}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Your spiritual purpose and divine mission
                  </p>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    Divine Purpose
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Destiny Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-400" />
                  Destiny Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getAngelNumberColor(angelNumbersData.destinyAngel)}`}>
                    {angelNumbersData.destinyAngel}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Your spiritual gifts and divine talents
                  </p>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Divine Gifts
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Soul Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Soul Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getAngelNumberColor(angelNumbersData.soulAngel)}`}>
                    {angelNumbersData.soulAngel}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    Your spiritual protection and inner guidance
                  </p>
                  <Badge variant="outline" className="border-pink-500 text-pink-400">
                    Divine Protection
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Personality Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  Personality Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getAngelNumberColor(angelNumbersData.personalityAngel)}`}>
                    {angelNumbersData.personalityAngel}
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    How you express your spiritual nature
                  </p>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Spiritual Expression
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Current Messages Tab */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Date Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Today's Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold text-purple-400 mb-2`}>
                    {angelNumbersData.currentDateAngel}
                  </div>
                  <p className="text-sm text-slate-300">
                    Today's divine message
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Year Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Year Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold text-blue-400 mb-2`}>
                    {angelNumbersData.personalYearAngel}
                  </div>
                  <p className="text-sm text-slate-300">
                    This year's spiritual focus
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Month Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Month Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold text-green-400 mb-2`}>
                    {angelNumbersData.personalMonthAngel}
                  </div>
                  <p className="text-sm text-slate-300">
                    This month's spiritual focus
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Day Angel */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  Day Angel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold text-yellow-400 mb-2`}>
                    {angelNumbersData.personalDayAngel}
                  </div>
                  <p className="text-sm text-slate-300">
                    Today's spiritual focus
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Master Numbers */}
          {angelNumbersData.masterNumbers.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Master Angel Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {angelNumbersData.masterNumbers.map((master, index) => (
                    <div key={index} className="text-center p-4 bg-slate-700/30 rounded">
                      <div className={`text-2xl font-bold ${getAngelNumberColor(master.number)}`}>
                        {master.number}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {master.primaryMeaning}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  Master numbers indicate advanced spiritual gifts and divine messages
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Angelic Guidance Tab */}
        <TabsContent value="guidance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Message */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Primary Angelic Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  {angelNumbersData.angelicGuidance.primaryMessage}
                </p>
                <div className="space-y-2">
                  {angelNumbersData.angelicGuidance.secondaryMessages.map((message, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Steps */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Angelic Action Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.angelicGuidance.actionSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Affirmations */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Angelic Affirmations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.angelicGuidance.affirmations.map((affirmation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300 italic">"{affirmation}"</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Repeating Patterns */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Repeating Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.repeatingPatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Synchronicities Tab */}
        <TabsContent value="synchronicities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number Sequences */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Number Sequences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.synchronicities.numberSequences.map((sequence, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{sequence}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Time Patterns */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Time Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.synchronicities.timePatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Date Significance */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Date Significance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.synchronicities.dateSignificance.map((significance, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{significance}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Meaningful Coincidences */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Feather className="w-5 h-5 text-green-400" />
                  Meaningful Coincidences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {angelNumbersData.synchronicities.meaningfulCoincidences.map((coincidence, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-300">{coincidence}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 