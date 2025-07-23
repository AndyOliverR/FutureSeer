import { useState } from 'react'
import { usePalmistry } from "@/hooks/use-palmistry"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Target, 
  Heart, 
  Zap,
  Hand,
  Brain,
  Activity,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Shield
} from 'lucide-react'

export function PalmistryCoachInterface() {
  const { palmistryData, coaching, getCoaching, loading } = usePalmistry()
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<string | null>(null)

  const handleAskQuestion = async () => {
    if (!question.trim() || !palmistryData) return

    setIsAsking(true)
    setCurrentResponse(null)

    try {
      const response = await getCoaching(question)
      if (response) {
        setCurrentResponse(response.response)
      }
    } catch (error) {
      console.error('Error getting coaching:', error)
    } finally {
      setIsAsking(false)
    }
  }

  if (!palmistryData) {
    return (
      <Card className="bg-slate-800/50 border-slate-600">
        <CardContent className="p-6 text-center">
          <Hand className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Palmistry Data</h3>
          <p className="text-slate-400">Complete your profile to access palm reading coaching</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-400" />
          Palm Reading Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="coaching" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="coaching" className="text-xs">Ask Coach</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          </TabsList>

          <TabsContent value="coaching" className="space-y-4">
            {/* Question Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Ask your palm reading coach about your lines, mounts, fingers, or life guidance..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                rows={3}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!question.trim() || isAsking || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isAsking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reading your palm wisdom...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Coach
                  </>
                )}
              </Button>
            </div>

            {/* Current Response */}
            {currentResponse && (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-slate-300">Coach's Response</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentResponse}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Questions */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Questions</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "How should I interpret the changing lines in my palm?",
                    "What does my palm shape reveal about my personality?",
                    "How can I work with the timing shown in my palm lines?",
                    "What guidance do my finger lengths offer for my career?"
                  ].map((quickQuestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(quickQuestion)}
                      className="justify-start text-left h-auto p-3 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{quickQuestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Strengths */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-slate-300">Your Strengths</span>
                    </div>
                    <div className="space-y-2">
                      {palmistryData.coaching.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-300">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Challenges */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-300">Growth Challenges</span>
                    </div>
                    <div className="space-y-2">
                      {palmistryData.coaching.challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-300">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Areas */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">Growth Areas</span>
                    </div>
                    <div className="space-y-2">
                      {palmistryData.coaching.growthAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-slate-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Affirmations */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-sm font-medium text-slate-300">Daily Affirmations</span>
                    </div>
                    <div className="space-y-3">
                      {palmistryData.coaching.affirmations.map((affirmation, index) => (
                        <div key={index} className="bg-slate-600/50 rounded-lg p-3">
                          <p className="text-sm text-slate-300 italic">"{affirmation}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Palm Summary */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-slate-300">Current Palm Reading</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Hand:</span>
                        <span className="text-white font-medium">{palmistryData.hand}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Shape:</span>
                        <span className="text-white font-medium">{palmistryData.palmShape}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Primary Element:</span>
                        <span className="text-white font-medium">{palmistryData.elements.primary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Energy Score:</span>
                        <span className="text-white font-medium">{palmistryData.energyScore}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-96">
              {coaching.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No coaching history yet</p>
                  <p className="text-sm text-slate-500">Ask your first question to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coaching.map((session) => (
                    <Card key={session.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-400">
                              {new Date(session.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-1">Question:</h4>
                            <p className="text-sm text-slate-400">{session.question}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-1">Response:</h4>
                            <p className="text-sm text-slate-300">{session.response}</p>
                          </div>
                          {session.insights.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-300 mb-1">Insights:</h4>
                              <div className="space-y-1">
                                {session.insights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-xs text-slate-400">{insight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 