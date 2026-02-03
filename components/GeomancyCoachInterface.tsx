"use client"

import { motion } from "framer-motion"
import { GeomanticAnalysis } from "@/hooks/useGeomancy"
import { Card, CardContent } from "@/components/ui/card"

interface GeomancyCoachInterfaceProps {
  analysis: GeomanticAnalysis
  activeTab: string
  question: string
}

export function GeomancyCoachInterface({ 
  analysis, 
  activeTab, 
  question
}: GeomancyCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Answer */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className={`text-6xl mb-4 ${
            analysis.overview.overallAnswer === 'yes' ? 'text-green-400' :
            analysis.overview.overallAnswer === 'no' ? 'text-red-400' :
            analysis.overview.overallAnswer === 'delayed' ? 'text-yellow-400' :
            'text-blue-400'
          }`}>
            {analysis.overview.overallAnswer === 'yes' ? '✅' :
             analysis.overview.overallAnswer === 'no' ? '❌' :
             analysis.overview.overallAnswer === 'delayed' ? '⏳' :
             '❓'}
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-2">
            {analysis.overview.overallAnswer.toUpperCase()}
          </div>
          <div className="text-sm text-slate-600">{analysis.overview.confidence}% Confidence</div>
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">🌍 Geomantic Summary</h3>
          <p className="text-slate-700 leading-relaxed">{analysis.overview.summary}</p>
        </CardContent>
      </Card>

      {/* Key Insights & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 shadow-lg rounded-2xl m3-elevation-2">
          <CardContent className="p-6">
            <h3 className="text-xl text-green-900 mb-4 flex items-center font-bold">
              <span className="mr-2">✨</span>
              Key Insights
            </h3>
            <ul className="space-y-2">
              {analysis.overview.keyInsights.map((insight, index) => (
                <li key={index} className="text-slate-700 flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg rounded-2xl m3-elevation-2">
          <CardContent className="p-6">
            <h3 className="text-xl text-orange-900 mb-4 flex items-center font-bold">
              <span className="mr-2">⚠️</span>
              Warnings
            </h3>
            <ul className="space-y-2">
              {analysis.overview.warnings.length > 0 ? (
                analysis.overview.warnings.map((warning, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    {warning}
                  </li>
                ))
              ) : (
                <li className="text-slate-700 flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  No significant warnings at this time
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderFigures = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">🔮 Geomantic Figures</h3>
          <p className="text-slate-700 mb-6">
            The sixteen geomantic figures that emerged from your question, revealing the earth's wisdom.
          </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysis.figures.map((figure, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border-2 ${
                ['Fortuna Major', 'Fortuna Minor', 'Acquisitio', 'Laetitia', 'Conjunctio', 'Caput Draconis'].includes(figure.name)
                  ? 'border-green-300 bg-green-50'
                  : ['Amissio', 'Tristitia', 'Carcer', 'Cauda Draconis'].includes(figure.name)
                  ? 'border-red-300 bg-red-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{figure.symbol}</div>
                <h4 className="font-semibold text-slate-800">{figure.name}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Element:</span>
                  <span className="text-slate-700 font-medium">{figure.element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Planet:</span>
                  <span className="text-slate-700 font-medium">{figure.planet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Zodiac:</span>
                  <span className="text-slate-700 font-medium">{figure.zodiac}</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs mt-3">{figure.meaning}</p>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHouses = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">🏠 House Analysis</h3>
          <p className="text-slate-700 mb-6">
            How the geomantic figures influence different areas of your life through the twelve houses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.houses.map((house, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white border-2 border-amber-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-amber-900">House {house.house}</h4>
                  <div className="text-2xl">{house.figure.symbol}</div>
                </div>
                <p className="text-slate-700 text-sm mb-2">{house.meaning}</p>
                <p className="text-slate-600 text-xs">{house.relevance}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInterpretation = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">🔍 Detailed Interpretation</h3>
          <p className="text-slate-700 mb-6">
            Comprehensive analysis of your geomantic reading and its implications.
          </p>
          
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300">
            <h4 className="text-lg text-amber-900 font-semibold mb-2">Main Answer</h4>
            <p className="text-slate-700 leading-relaxed">{analysis.interpretation.mainAnswer}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg text-amber-900 font-semibold mb-3">Detailed Explanation</h4>
            <p className="text-slate-700 leading-relaxed">{analysis.interpretation.detailedExplanation}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-3 flex items-center">
                <span className="mr-2">✅</span>
                Supporting Factors
              </h4>
              <ul className="space-y-2">
                {analysis.interpretation.supportingFactors.map((factor, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <p className="text-sm">{factor}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                Challenging Factors
              </h4>
              <ul className="space-y-2">
                {analysis.interpretation.challengingFactors.map((factor, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <p className="text-sm">{factor}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTiming = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">⏰ Timing Insights</h3>
          <p className="text-slate-700 mb-6">
            When events are likely to occur and optimal timing for your actions.
          </p>
          
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300">
            <h4 className="text-lg text-amber-900 font-semibold mb-2">Overall Timeframe</h4>
            <p className="text-slate-700">{analysis.timing.timeframe}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">✅</span>
                Optimal Periods
              </h4>
              <ul className="space-y-2">
                {analysis.timing.optimalPeriods.map((period, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <p className="text-sm">{period}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">⚠️</span>
                Avoid Periods
              </h4>
              <ul className="space-y-2">
                {analysis.timing.avoidPeriods.map((period, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    <p className="text-sm">{period}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Key Dates
              </h4>
              <ul className="space-y-2">
                {analysis.timing.keyDates.map((date, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <p className="text-sm">{date}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAdvice = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl text-amber-900 mb-4 font-bold">💡 Actionable Advice</h3>
          <p className="text-slate-700 mb-6">
            Practical guidance based on your geomantic reading to help you navigate your situation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Immediate Actions
              </h4>
              <ul className="space-y-2">
                {analysis.advice.immediate.map((advice, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <p className="text-sm">{advice}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Short Term (1-3 months)
              </h4>
              <ul className="space-y-2">
                {analysis.advice.shortTerm.map((advice, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <p className="text-sm">{advice}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Long Term (3+ months)
              </h4>
              <ul className="space-y-2">
                {analysis.advice.longTerm.map((advice, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <p className="text-sm">{advice}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-amber-900 font-semibold mb-4 flex items-center">
                <span className="mr-2">🌿</span>
                Spiritual Guidance
              </h4>
              <ul className="space-y-2">
                {analysis.advice.spiritual.map((advice, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <p className="text-sm">{advice}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "figures":
        return renderFigures()
      case "houses":
        return renderHouses()
      case "interpretation":
        return renderInterpretation()
      case "timing":
        return renderTiming()
      case "advice":
        return renderAdvice()
      default:
        return renderOverview()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderContent()}
    </motion.div>
  )
} 