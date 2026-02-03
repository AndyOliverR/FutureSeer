"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, HelpCircle, ArrowRightLeft, RotateCw } from "lucide-react"
import { PendulumAnalysis } from "@/hooks/use-pendulum"

interface PendulumCoachInterfaceProps {
  analysis: PendulumAnalysis
  activeTab: string
  question?: string
  pendulumType?: string
}

export function PendulumCoachInterface({ analysis, activeTab, question, pendulumType }: PendulumCoachInterfaceProps) {
  const getAnswerIcon = () => {
    switch (analysis.answer) {
      case 'yes':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'no':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'maybe':
        return <HelpCircle className="w-16 h-16 text-amber-600" />
      default:
        return <HelpCircle className="w-16 h-16 text-slate-500" />
    }
  }

  const getAnswerColor = () => {
    switch (analysis.answer) {
      case 'yes':
        return 'text-green-600'
      case 'no':
        return 'text-red-600'
      case 'maybe':
        return 'text-amber-600'
      default:
        return 'text-slate-600'
    }
  }

  const getSwingIcon = () => {
    switch (analysis.swingDirection) {
      case 'front-back':
        return <ArrowRightLeft className="w-6 h-6 text-amber-700" />
      case 'side-side':
        return <ArrowRightLeft className="w-6 h-6 rotate-90 text-amber-700" />
      case 'clockwise':
      case 'counterclockwise':
        return <RotateCw className="w-6 h-6 text-amber-700" />
      default:
        return <ArrowRightLeft className="w-6 h-6 text-amber-700" />
    }
  }

  const getSwingText = () => {
    switch (analysis.swingDirection) {
      case 'front-back':
        return 'Forward-Back (Like a head nod)'
      case 'side-side':
        return 'Side-to-Side (Like a head shake)'
      case 'clockwise':
        return 'Clockwise Circle'
      case 'counterclockwise':
        return 'Counterclockwise Circle'
      default:
        return analysis.swingDirection
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Answer Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: analysis.swingDirection === 'clockwise' ? [0, 360] : 
                           analysis.swingDirection === 'counterclockwise' ? [0, -360] : 
                           analysis.swingDirection === 'side-side' ? [0, 5, -5, 0] :
                           [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex justify-center"
                >
                  {getAnswerIcon()}
                </motion.div>
                <div>
                  <h2 className={`text-4xl font-bold mb-2 ${getAnswerColor()}`}>
                    {analysis.answer.toUpperCase()}
                  </h2>
                  <p className="text-slate-600 text-sm">Confidence: {analysis.confidence}%</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  {getSwingIcon()}
                  <span className="text-sm text-slate-700">{getSwingText()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Display */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 italic">"{question || analysis.question}"</p>
              {pendulumType && (
                <p className="text-slate-600 text-sm mt-2">Pendulum Type: {pendulumType}</p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Answer Tab */}
      {activeTab === 'answer' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Pendulum Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Answer:</span>
                <span className={`text-xl font-bold ${getAnswerColor()}`}>
                  {analysis.answer.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Confidence:</span>
                <span className="text-amber-700 font-semibold">{analysis.confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Swing Direction:</span>
                <div className="flex items-center gap-2 text-amber-700">
                  {getSwingIcon()}
                  <span className="text-slate-700">{getSwingText()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{analysis.interpretation}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Interpretation Tab */}
      {activeTab === 'interpretation' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Full Interpretation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-amber-800 font-semibold mb-2">The Pendulum's Message</h3>
                <p className="text-slate-700 leading-relaxed">{analysis.interpretation}</p>
              </div>
              <div>
                <h3 className="text-amber-800 font-semibold mb-2">What This Means</h3>
                <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.advice.map((adviceItem, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{adviceItem}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Guidance Tab */}
      {activeTab === 'guidance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {analysis.guidance?.programming && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">Programming Your Pendulum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{analysis.guidance.programming}</p>
              </CardContent>
            </Card>
          )}

          {analysis.guidance?.usage && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">How to Use Your Pendulum</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.guidance.usage.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.guidance?.cleansing && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">Pendulum Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{analysis.guidance.cleansing}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Always clear your mind and focus before asking questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Hold the pendulum steady with your arm supported on a surface</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Remain neutral about the outcome for accurate readings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Clear the pendulum between questions by touching it to your palm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Call upon your higher self before each session for truthful answers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
} 