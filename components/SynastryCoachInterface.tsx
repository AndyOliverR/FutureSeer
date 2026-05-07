"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { SynastryCompatibility, PersonData } from "@/hooks/useSynastry"

interface SynastryCoachInterfaceProps {
  compatibility: SynastryCompatibility
  activeTab: string
  chartType?: string
  person1Data: PersonData
  person2Data: PersonData
}

export function SynastryCoachInterface({ 
  compatibility, 
  activeTab, 
  person1Data, 
  person2Data 
}: SynastryCoachInterfaceProps) {
  
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
              strokeDasharray={`${compatibility.overview.overallScore * 3.52} 352`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800">{compatibility.overview.overallScore}%</div>
              <div className="text-sm text-slate-800 font-medium">Compatibility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">💕 Relationship Summary</h3>
          <p className="text-slate-800 leading-relaxed">{compatibility.overview.summary}</p>
        </CardContent>
      </Card>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card elevation={2} className="bg-gradient-to-br from-green-50/90 to-teal-50/90 border-2 border-green-300 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {compatibility.overview.strengths.map((strength, index) => (
                <li key={index} className="text-slate-800 flex items-start">
                  <span className="text-green-700 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              Growth Areas
            </h3>
            <ul className="space-y-2">
              {compatibility.overview.challenges.map((challenge, index) => (
                <li key={index} className="text-slate-800 flex items-start">
                  <span className="text-amber-700 mr-2">•</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card elevation={2} className="bg-gradient-to-br from-blue-50/90 to-cyan-50/90 border-2 border-blue-300 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compatibility.overview.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-700 mr-2 mt-1">💎</span>
                <p className="text-slate-800 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPlanets = () => (
    <div className="space-y-6">
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">⭐ Planetary Interactions</h3>
        <p className="text-slate-800 mb-6">
          How your planets interact with each other reveals the deeper dynamics of your relationship.
        </p>
        
        <div className="space-y-4">
          {compatibility.aspects.slice(0, 10).map((aspect, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                aspect.influence === 'harmonious' 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : aspect.influence === 'challenging'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-3">
                    {aspect.influence === 'harmonious' ? '💚' : aspect.influence === 'challenging' ? '🔥' : '⚡'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {aspect.planet1} {aspect.aspect} {aspect.planet2}
                  </span>
                </div>
                <span className="text-sm text-slate-700 font-medium">Orb: {aspect.orb.toFixed(1)}°</span>
              </div>
              <p className="text-slate-800 text-sm">{aspect.description}</p>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHouses = () => (
    <div className="space-y-6">
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">🏠 House Overlays</h3>
        <p className="text-slate-800 mb-6">
          How your planets activate each other's life areas and experiences.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compatibility.houseOverlays.slice(0, 12).map((overlay, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60"
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🏠</span>
                <span className="font-semibold text-slate-800">
                  {overlay.planet} in House {overlay.house}
                </span>
                <span className="ml-auto text-xs text-slate-700 font-medium">
                  {overlay.person === 'person1' ? person1Data.name || 'Person 1' : person2Data.name || 'Person 2'}
                </span>
              </div>
              <p className="text-slate-800 text-sm">{overlay.description}</p>
            </motion.div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAspects = () => (
    <div className="space-y-6">
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">🔗 Aspect Analysis</h3>
        <p className="text-slate-800 mb-6">
          Detailed breakdown of all planetary aspects and their relationship impact.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-amber-200/80">
                <th className="text-left p-2 sm:p-3 text-slate-800 font-semibold">Planets</th>
                <th className="text-left p-2 sm:p-3 text-slate-800 font-semibold">Aspect</th>
                <th className="text-left p-2 sm:p-3 text-slate-800 font-semibold">Orb</th>
                <th className="text-left p-2 sm:p-3 text-slate-800 font-semibold">Influence</th>
                <th className="text-left p-2 sm:p-3 text-slate-800 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {compatibility.aspects.map((aspect, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-amber-100"
                >
                  <td className="p-2 sm:p-3 text-slate-800 font-medium">
                    {aspect.planet1} - {aspect.planet2}
                  </td>
                  <td className="p-2 sm:p-3 text-slate-800">{aspect.aspect}</td>
                  <td className="p-2 sm:p-3 text-slate-800">{aspect.orb.toFixed(1)}°</td>
                  <td className="p-2 sm:p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aspect.influence === 'harmonious' 
                        ? 'bg-green-500/25 text-green-800' 
                        : aspect.influence === 'challenging'
                        ? 'bg-amber-500/25 text-amber-800'
                        : 'bg-blue-500/25 text-blue-800'
                    }`}>
                      {aspect.influence}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 text-slate-800 text-sm max-w-xs">{aspect.description}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderComposite = () => (
    <div className="space-y-6">
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">🌟 Composite Chart</h3>
        <p className="text-slate-800 mb-6">
          The composite chart represents the essence of your relationship as a third entity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-3xl mb-2">☀️</div>
            <div className="text-slate-800 font-semibold">Sun Sign</div>
            <div className="text-amber-800 font-bold">{compatibility.composite.sunSign}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-3xl mb-2">🌙</div>
            <div className="text-slate-800 font-semibold">Moon Sign</div>
            <div className="text-amber-800 font-bold">{compatibility.composite.moonSign}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-3xl mb-2">🌅</div>
            <div className="text-slate-800 font-semibold">Ascendant</div>
            <div className="text-amber-800 font-bold">{compatibility.composite.ascendant}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <p className="text-slate-800 leading-relaxed">{compatibility.composite.description}</p>
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTiming = () => (
    <div className="space-y-6">
      <Card elevation={2} className="bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-2 border-amber-200 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-heading font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 mb-4">⏰ Timing Insights</h3>
        <p className="text-slate-800 mb-6">
          Cosmic timing for your relationship development and important periods.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-slate-800 font-semibold mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Current Transits
            </h4>
            <ul className="space-y-3">
              {compatibility.timing.currentTransits.map((transit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">⭐</span>
                  <p className="text-slate-800 text-sm">{transit}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-slate-800 font-semibold mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              Future Highlights
            </h4>
            <ul className="space-y-3">
              {compatibility.timing.futureHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-600 mr-2 mt-1">✨</span>
                  <p className="text-slate-800 text-sm">{highlight}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300">
          <h4 className="text-lg text-slate-800 font-semibold mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Timing Advice
          </h4>
          <p className="text-slate-800">{compatibility.timing.advice}</p>
        </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "aspects":
        return renderAspects()
      case "compatibility":
        // Show overview with compatibility focus
        return renderOverview()
      case "dynamics":
        return renderHouses() // House overlays show relationship dynamics
      case "growth":
        return renderPlanets() // Planetary interactions show growth opportunities
      case "advice":
        return renderTiming() // Timing insights provide relationship advice
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