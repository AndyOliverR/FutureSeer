"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SortilegeReading } from "@/lib/sortilegeIntelligence"
import { 
  BookOpen, 
  Sparkles, 
  Lightbulb, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react"

interface SortilegeReportProps {
  reading: SortilegeReading
  activeTab?: string
}

export function SortilegeReport({ reading, activeTab = 'overview' }: SortilegeReportProps) {
  // Validate reading data
  if (!reading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-red-200 rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-amber-900 font-semibold mb-2">No Reading Data</h3>
          <p className="text-slate-700">Reading data is missing. Please generate a new reading.</p>
        </CardContent>
      </Card>
    )
  }

  const { comprehensiveReport, castResult, question, method } = reading

  // Validate required data
  if (!comprehensiveReport || !castResult) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-yellow-200 rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-amber-900 font-semibold mb-2">Incomplete Reading Data</h3>
          <p className="text-slate-700">Some reading data is missing. Please try generating a new reading.</p>
        </CardContent>
      </Card>
    )
  }

  // Provide fallbacks for missing data
  const safeOverview = comprehensiveReport.overview || 'The sortilege cast reveals guidance for your question.'
  const safeInterpretation = comprehensiveReport.interpretation || castResult.interpretation.detailed || 'The cast results provide insight into your situation.'
  const safeInsights = comprehensiveReport.personalizedInsights || 'The symbols and patterns in your cast offer personal guidance.'
  const safeGuidance = comprehensiveReport.guidance || ['Trust your intuition', 'Take aligned action', 'Stay open to guidance']
  const safeRemedies = comprehensiveReport.remedies || ['Meditate on the symbols', 'Journal about the meaning', 'Take time for reflection']
  const safeHistory = comprehensiveReport.historicalContext || castResult.historicalContext || 'Sortilege has been practiced for thousands of years across many cultures.'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'interpretation', label: 'Interpretation', icon: Sparkles },
    { id: 'insights', label: 'Personalized Insights', icon: Lightbulb },
    { id: 'guidance', label: 'Guidance', icon: TrendingUp },
    { id: 'remedies', label: 'Remedies', icon: Shield },
    { id: 'history', label: 'History', icon: Clock }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  Reading Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Your Question</h3>
                  <p className="text-amber-900 text-lg italic">"{question}"</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Method Used</h3>
                  <Badge className="bg-amber-200 text-amber-900 border-amber-300 capitalize">
                    {method}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Cast Result</h3>
                  <p className="text-amber-800 font-medium">{castResult.interpretation.primary}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Overview</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {safeOverview}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'interpretation':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-700" />
                  Detailed Interpretation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Primary Meaning</h3>
                  <p className="text-purple-800 font-medium text-lg mb-4">
                    {castResult.interpretation.primary}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Detailed Analysis</h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {safeInterpretation}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Symbol Meanings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {castResult.interpretation.symbols.map((symbol, index) => (
                      <div
                        key={index}
                        className="bg-white border border-amber-200 rounded-xl p-3"
                      >
                        <div className="font-semibold text-sm text-amber-900 mb-1">
                          {symbol.name}
                        </div>
                        <div className="text-xs text-slate-700 mb-1">
                          {symbol.meaning}
                        </div>
                        <div className="text-xs text-slate-600 italic">
                          {symbol.significance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'insights':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-700" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {safeInsights}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'guidance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                  Guidance & Action Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeGuidance.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-white border border-amber-200 rounded-xl p-4"
                    >
                      <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-900 flex-1">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'remedies':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-700" />
                  Remedies & Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeRemedies.map((remedy, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-white border border-amber-200 rounded-xl p-4"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-900 flex-1">{remedy}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'history':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-700" />
                  Historical Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {safeHistory}
                </p>
                {castResult.historicalContext && (
                  <div className="mt-4 pt-4 border-t border-amber-300">
                    <p className="text-slate-600 text-sm italic">
                      {castResult.historicalContext}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {renderTabContent()}
    </div>
  )
}

