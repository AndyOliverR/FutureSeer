"use client"

import { motion } from "framer-motion"
import { MundaneAnalysis, AnalysisData } from "@/hooks/useMundaneAstrology"

interface MundaneAstrologyCoachInterfaceProps {
  analysis: MundaneAnalysis
  activeTab: string
  analysisData: AnalysisData
}

export function MundaneAstrologyCoachInterface({ 
  analysis, 
  activeTab, 
  analysisData 
}: MundaneAstrologyCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Outlook */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${
            analysis.overview.overallOutlook === 'positive' ? 'text-green-400' :
            analysis.overview.overallOutlook === 'challenging' ? 'text-orange-400' :
            'text-blue-400'
          }`}>
            {analysis.overview.overallOutlook === 'positive' ? '📈' :
             analysis.overview.overallOutlook === 'challenging' ? '⚠️' :
             '⚖️'}
          </div>
          <h3 className="text-2xl gold-glow mb-2">
            {analysis.overview.overallOutlook.charAt(0).toUpperCase() + analysis.overview.overallOutlook.slice(1)} Outlook
          </h3>
          <p className="text-soft/80">Global astrological climate assessment</p>
        </div>
        
        <p className="text-soft leading-relaxed mb-6">{analysis.overview.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Key Themes
            </h4>
            <ul className="space-y-2">
              {analysis.overview.keyThemes.map((theme, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  {theme}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">🌟</span>
              Major Influences
            </h4>
            <ul className="space-y-2">
              {analysis.overview.majorInfluences.map((influence, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {influence}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌍 World Events</h3>
        <p className="text-soft mb-6">
          Major world events and their astrological timing and influences.
        </p>
        
        <div className="space-y-4">
          {analysis.events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                event.impact === 'major'
                  ? 'border-red-500/30 bg-red-500/5'
                  : event.impact === 'moderate'
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-soft text-lg">{event.title}</h4>
                <div className={`text-xs px-2 py-1 rounded ${
                  event.impact === 'major'
                    ? 'bg-red-500/20 text-red-400'
                    : event.impact === 'moderate'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {event.impact} impact
                </div>
              </div>
              
              <p className="text-soft/80 mb-3">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-soft font-semibold mb-2">Astrological Factors</h5>
                  <ul className="space-y-1">
                    {event.astrologicalFactors.map((factor, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-soft font-semibold mb-2">Affected Areas</h5>
                  <ul className="space-y-1">
                    {event.affectedAreas.map((area, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-indigo-400 mr-2">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-soft/60">
                Timing: {event.timing}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">📈 Global Trends</h3>
        <p className="text-soft mb-6">
          Emerging global trends and their astrological indicators and duration.
        </p>
        
        <div className="space-y-4">
          {analysis.trends.map((trend, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                trend.intensity === 'strong'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : trend.intensity === 'moderate'
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : 'border-gray-500/30 bg-gray-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-soft text-lg">{trend.name}</h4>
                <div className={`text-xs px-2 py-1 rounded ${
                  trend.intensity === 'strong'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : trend.intensity === 'moderate'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {trend.intensity} intensity
                </div>
              </div>
              
              <p className="text-soft/80 mb-3">{trend.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-soft font-semibold mb-2">Astrological Indicators</h5>
                  <ul className="space-y-1">
                    {trend.astrologicalIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-soft font-semibold mb-2">Affected Sectors</h5>
                  <ul className="space-y-1">
                    {trend.affectedSectors.map((sector, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-indigo-400 mr-2">•</span>
                        {sector}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-soft/60">
                Duration: {trend.duration}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🔮 Predictions</h3>
        <p className="text-soft mb-6">
          Astrological predictions and their confidence levels and potential outcomes.
        </p>
        
        <div className="space-y-4">
          {analysis.predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-soft text-lg">{prediction.timeframe}</h4>
                <div className="text-sm text-purple-400 font-semibold">
                  {prediction.confidence}% confidence
                </div>
              </div>
              
              <p className="text-soft/80 mb-4">{prediction.prediction}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-soft font-semibold mb-2">Astrological Basis</h5>
                  <ul className="space-y-1">
                    {prediction.astrologicalBasis.map((basis, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {basis}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-soft font-semibold mb-2">Potential Outcomes</h5>
                  <ul className="space-y-1">
                    {prediction.potentialOutcomes.map((outcome, idx) => (
                      <li key={idx} className="text-soft/70 text-sm flex items-start">
                        <span className="text-indigo-400 mr-2">•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCycles = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">⏰ Astrological Cycles</h3>
        <p className="text-soft mb-6">
          Major astrological cycles currently influencing world events and their historical context.
        </p>
        
        <div className="space-y-4">
          {analysis.cycles.map((cycle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-soft text-lg">{cycle.name}</h4>
                <div className="text-sm text-blue-400 font-semibold">
                  {cycle.currentPhase}
                </div>
              </div>
              
              <p className="text-soft/80 mb-3">{cycle.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-soft font-semibold mb-2">Current Influence</h5>
                  <p className="text-soft/70 text-sm">{cycle.influence}</p>
                </div>
                
                <div>
                  <h5 className="text-soft font-semibold mb-2">Duration</h5>
                  <p className="text-soft/70 text-sm">{cycle.duration}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <h5 className="text-soft font-semibold mb-2">Historical Context</h5>
                <p className="text-soft/70 text-sm">{cycle.historicalContext}</p>
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
        <h3 className="text-xl gold-glow mb-4">💡 Actionable Advice</h3>
        <p className="text-soft mb-6">
          Practical guidance for navigating the current astrological climate in different areas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Global Perspective
            </h4>
            <ul className="space-y-2">
              {analysis.advice.global.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Economic
            </h4>
            <ul className="space-y-2">
              {analysis.advice.economic.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🏛️</span>
              Political
            </h4>
            <ul className="space-y-2">
              {analysis.advice.political.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">👥</span>
              Social
            </h4>
            <ul className="space-y-2">
              {analysis.advice.social.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌿</span>
              Environmental
            </h4>
            <ul className="space-y-2">
              {analysis.advice.environmental.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
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
      case "events":
        return renderEvents()
      case "trends":
        return renderTrends()
      case "predictions":
        return renderPredictions()
      case "cycles":
        return renderCycles()
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