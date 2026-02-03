import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, MessageCircle, Brain, Star } from 'lucide-react'
import { ContextualHelp } from '@/components/ContextualHelp'

interface AskTheSeerInterfaceProps {
  user?: any
  userProfile?: any
  chartData?: {
    sunSign?: string
    moonSign?: string
    risingSign?: string
    planets?: any[]
    houses?: any[]
    aspects?: any[]
    birthData?: {
      birthDate: string
      birthTime: string
      birthPlace: string
      latitude: number
      longitude: number
    }
  }
}

export default function AskTheSeerInterface({ 
  user, 
  userProfile, 
  chartData 
}: AskTheSeerInterfaceProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-6 h-6" />
            Ask the Seer
            <ContextualHelp
              title="How to Ask Effective Questions"
              content="Ask specific questions about your future, relationships, career, health, or life path. The more specific your question, the more precise the insights. Examples: 'When is the best time for my career breakthrough?' or 'Will my relationship issues resolve soon?'"
              placement="right"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">
                Specialized AI Astrologer
              </h3>
              <p className="text-slate-300 text-sm">
                Your personal Western Astrology specialist is being prepared to provide 
                expert insights and guidance tailored to your unique chart.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-300">
            <Star className="w-5 h-5" />
            Coming Soon Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-200 font-medium">Personalized Questions</h4>
                  <p className="text-slate-400 text-sm">Ask specific questions about your chart</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-200 font-medium">Expert Analysis</h4>
                  <p className="text-slate-400 text-sm">Deep insights into your planetary positions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-200 font-medium">Life Guidance</h4>
                  <p className="text-slate-400 text-sm">Practical advice based on your chart</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Star className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-amber-200 font-medium">Transit Insights</h4>
                  <p className="text-slate-400 text-sm">Current and upcoming planetary influences</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-amber-300">
              Specialist in Training
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              This AI specialist is being trained specifically on Western Astrology 
              principles and will be available soon to answer your questions about 
              your unique birth chart.
            </p>
            <div className="flex justify-center">
              <Button 
                disabled 
                className="bg-slate-700 text-slate-400 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
