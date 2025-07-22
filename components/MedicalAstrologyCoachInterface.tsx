"use client"

import { motion } from "framer-motion"
import { HealthAnalysis, UserData, HealthData } from "@/hooks/useMedicalAstrology"

interface MedicalAstrologyCoachInterfaceProps {
  analysis: HealthAnalysis
  activeTab: string
  userData: UserData
  healthData: HealthData
}

export function MedicalAstrologyCoachInterface({ 
  analysis, 
  activeTab, 
  userData, 
  healthData 
}: MedicalAstrologyCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Health Score */}
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
              strokeDasharray={`${analysis.overview.overallHealth * 3.52} 352`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold gold-glow">{analysis.overview.overallHealth}%</div>
              <div className="text-sm text-soft">Health Potential</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🏥 Health Summary</h3>
        <p className="text-soft leading-relaxed">{analysis.overview.summary}</p>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.overview.keyStrengths.map((strength, index) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-green-400 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-orange-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Areas of Concern
          </h3>
          <ul className="space-y-2">
            {analysis.overview.areasOfConcern.map((concern, index) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                {concern}
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
          {analysis.overview.recommendations.map((rec, index) => (
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
        <h3 className="text-xl gold-glow mb-4">⏰ Optimal Health Timing</h3>
        <p className="text-soft mb-6">
          Cosmic timing for medical procedures, treatments, and wellness decisions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-soft font-semibold">Optimal Procedures</div>
            <div className="text-green-400 font-bold">{analysis.timing.confidence}% Confidence</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-soft font-semibold">Avoid Periods</div>
            <div className="text-yellow-400 font-bold">High Risk</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-soft font-semibold">Recovery Windows</div>
            <div className="text-blue-400 font-bold">Optimal</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">📈</span>
              Best Procedure Timing
            </h4>
            <div className="space-y-2">
              {analysis.timing.optimalProcedures.map((procedure, index) => (
                <div key={index} className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <p className="text-soft text-sm">{procedure}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
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
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">🔄</span>
              Recovery Windows
            </h4>
            <div className="space-y-2">
              {analysis.timing.recoveryWindows.map((window, index) => (
                <div key={index} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <p className="text-soft text-sm">{window}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBody = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🧬 Body Systems Analysis</h3>
        <p className="text-soft mb-6">
          Understanding of your body systems based on planetary positions and cosmic energy.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.bodySystems.map((system, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                system.status === 'strong' 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : system.status === 'weak'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-soft">{system.system}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  system.status === 'strong' 
                    ? 'bg-green-500/20 text-green-300' 
                    : system.status === 'weak'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {system.status}
                </span>
              </div>
              <p className="text-soft/80 text-sm mb-3">{system.description}</p>
              <div>
                <h5 className="text-soft font-semibold mb-2 text-sm">Recommendations:</h5>
                <ul className="space-y-1">
                  {system.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="text-soft/70 text-xs flex items-start">
                      <span className="text-yellow-400 mr-2 mt-1">•</span>
                      {rec}
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

  const renderRemedies = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌿 Natural Remedies</h3>
        <p className="text-soft mb-6">
          Natural healing methods aligned with your cosmic energy and planetary positions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.remedies.map((remedy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                remedy.type === 'herb' 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : remedy.type === 'crystal'
                  ? 'border-purple-500/30 bg-purple-500/5'
                  : remedy.type === 'color'
                  ? 'border-pink-500/30 bg-pink-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-soft">{remedy.remedy}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  remedy.type === 'herb' 
                    ? 'bg-green-500/20 text-green-300' 
                    : remedy.type === 'crystal'
                    ? 'bg-purple-500/20 text-purple-300'
                    : remedy.type === 'color'
                    ? 'bg-pink-500/20 text-pink-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {remedy.type}
                </span>
              </div>
              <p className="text-soft/80 text-sm mb-3">{remedy.description}</p>
              <div>
                <h5 className="text-soft font-semibold mb-2 text-sm">Usage:</h5>
                <p className="text-soft/70 text-sm">{remedy.usage}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTransits = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌍 Health Transits</h3>
        <p className="text-soft mb-6">
          Current and upcoming planetary movements affecting health and wellness.
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
                  <span className="text-blue-400 mr-2 mt-1">⭐</span>
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
            Health Impact
          </h4>
          <p className="text-soft/80">{analysis.transits.impact}</p>
        </div>
      </div>
    </div>
  )

  const renderAdvice = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💡 Health Advice</h3>
        <p className="text-soft mb-6">
          Actionable guidance for your health journey based on cosmic insights.
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
              Prevention
            </h4>
            <ul className="space-y-2">
              {analysis.advice.prevention.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
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
      case "body":
        return renderBody()
      case "remedies":
        return renderRemedies()
      case "transits":
        return renderTransits()
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