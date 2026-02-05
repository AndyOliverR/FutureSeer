"use client"

import { motion } from "framer-motion"
import { FinancialAnalysis, UserData, MarketData } from "@/hooks/useFinancialAstrology"

interface FinancialAstrologyCoachInterfaceProps {
  analysis: FinancialAnalysis
  activeTab: string
  userData: UserData
  marketData: MarketData
}

export function FinancialAstrologyCoachInterface({ 
  analysis, 
  activeTab, 
  userData, 
  marketData 
}: FinancialAstrologyCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${analysis.overview.overallScore * 3.52} 352`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold gold-glow">{analysis.overview.overallScore}%</div>
              <div className="text-sm text-soft">Financial Potential</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💰 Financial Summary</h3>
        <p className="text-soft leading-relaxed">{analysis.overview.summary}</p>
      </div>

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.overview.keyStrengths.map((strength: string, index: number) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-green-400 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Potential Risks
          </h3>
          <ul className="space-y-2">
            {analysis.overview.potentialRisks.map((risk: string, index: number) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-red-400 mr-2">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-xl gold-glow mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.overview.recommendations.map((rec: string, index: number) => (
            <div key={index} className="flex items-start">
              <span className="text-blue-400 mr-2 mt-1">💎</span>
              <p className="text-soft text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTiming = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">⏰ Optimal Timing</h3>
        <p className="text-soft mb-6">
          Cosmic timing for your financial decisions and investment opportunities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-soft font-semibold">Optimal Entry</div>
            <div className="text-green-400 font-bold">{analysis.timing.confidence}% Confidence</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-3xl mb-2">📉</div>
            <div className="text-soft font-semibold">Optimal Exit</div>
            <div className="text-yellow-400 font-bold">Strategic</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-3xl mb-2">🚫</div>
            <div className="text-soft font-semibold">Avoid Periods</div>
            <div className="text-red-400 font-bold">High Risk</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">📈</span>
              Best Entry Opportunities
            </h4>
            <div className="space-y-2">
              {analysis.timing.optimalEntry.map((entry, index) => (
                <div key={index} className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-soft text-sm">{entry}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">🚫</span>
              Periods to Avoid
            </h4>
            <div className="space-y-2">
              {analysis.timing.avoidPeriods.map((period, index) => (
                <div key={index} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-soft text-sm">{period}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectors = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">📊 Sector Analysis</h3>
        <p className="text-soft mb-6">
          Industries and sectors that align with your cosmic energy and investment potential.
        </p>
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-soft leading-relaxed">{analysis.sectors.reasoning}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">✅</span>
              Favorable Sectors
            </h4>
            <div className="space-y-2">
              {analysis.sectors.favorable.map((sector, index) => (
                <div key={index} className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-soft text-sm">{sector}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Challenging Sectors
            </h4>
            <div className="space-y-2">
              {analysis.sectors.challenging.map((sector, index) => (
                <div key={index} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <p className="text-soft text-sm">{sector}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">➖</span>
              Neutral Sectors
            </h4>
            <div className="space-y-2">
              {analysis.sectors.neutral.map((sector, index) => (
                <div key={index} className="p-3 rounded-xl bg-gray-500/5 border border-gray-500/20">
                  <p className="text-soft text-sm">{sector}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTransits = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌍 Planetary Transits</h3>
        <p className="text-soft mb-6">
          Current and upcoming planetary movements affecting global markets and your financial potential.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Current Transits
            </h4>
            <ul className="space-y-3">
              {analysis.transits.current.map((transit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-1">⭐</span>
                  <p className="text-soft/80 text-sm">{transit}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              Upcoming Transits
            </h4>
            <ul className="space-y-3">
              {analysis.transits.upcoming.map((transit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✨</span>
                  <p className="text-soft/80 text-sm">{transit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Market Impact
          </h4>
          <p className="text-soft/80">{analysis.transits.impact}</p>
        </div>
      </div>
    </div>
  )

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🔮 Market Predictions</h3>
        <p className="text-soft mb-6">
          Cosmic insights into market trends and economic cycles based on planetary movements.
        </p>
        
        <div className="space-y-6">
          {analysis.predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border ${
                prediction.trend === 'bullish' 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : prediction.trend === 'bearish'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {prediction.trend === 'bullish' ? '📈' : prediction.trend === 'bearish' ? '📉' : '➡️'}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-soft">{prediction.timeframe}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prediction.trend === 'bullish' 
                        ? 'bg-green-500/20 text-green-300' 
                        : prediction.trend === 'bearish'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {prediction.trend.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gold-glow">{prediction.confidence}%</div>
                  <div className="text-sm text-soft">Confidence</div>
                </div>
              </div>
              
              <p className="text-soft/80 mb-4">{prediction.reasoning}</p>
              
              <div>
                <h5 className="text-soft font-semibold mb-2">Key Events:</h5>
                <ul className="space-y-1">
                  {prediction.keyEvents.map((event, eventIndex) => (
                    <li key={eventIndex} className="text-soft/70 text-sm flex items-start">
                      <span className="text-yellow-400 mr-2 mt-1">•</span>
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAdvice = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💡 Strategic Advice</h3>
        <p className="text-soft mb-6">
          Actionable guidance for your financial journey based on cosmic insights.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Immediate Actions
            </h4>
            <ul className="space-y-2">
              {analysis.advice.immediate.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Short Term (1-3 months)
            </h4>
            <ul className="space-y-2">
              {analysis.advice.shortTerm.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Long Term (1-5 years)
            </h4>
            <ul className="space-y-2">
              {analysis.advice.longTerm.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🛡️</span>
              Risk Management
            </h4>
            <ul className="space-y-2">
              {analysis.advice.riskManagement.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "timing":
        return renderTiming()
      case "sectors":
        return renderSectors()
      case "transits":
        return renderTransits()
      case "predictions":
        return renderPredictions()
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