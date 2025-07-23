"use client"

import { motion } from "framer-motion"
import { SynastryCompatibility, PersonData } from "@/hooks/useSynastry"

interface SynastryCoachInterfaceProps {
  compatibility: SynastryCompatibility
  activeTab: string
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
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold gold-glow">{compatibility.overview.overallScore}%</div>
              <div className="text-sm text-soft">Compatibility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💕 Relationship Summary</h3>
        <p className="text-soft leading-relaxed">{compatibility.overview.summary}</p>
      </div>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Strengths
          </h3>
          <ul className="space-y-2">
            {compatibility.overview.strengths.map((strength, index) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-green-400 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-orange-500/20">
          <h3 className="text-xl gold-glow mb-4 flex items-center">
            <span className="mr-2">🌱</span>
            Growth Areas
          </h3>
          <ul className="space-y-2">
            {compatibility.overview.challenges.map((challenge, index) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                {challenge}
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
          {compatibility.overview.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start">
              <span className="text-blue-400 mr-2 mt-1">💎</span>
              <p className="text-soft text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPlanets = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">⭐ Planetary Interactions</h3>
        <p className="text-soft mb-6">
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
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-3">
                    {aspect.influence === 'harmonious' ? '💚' : aspect.influence === 'challenging' ? '🔥' : '⚡'}
                  </span>
                  <span className="font-semibold text-soft">
                    {aspect.planet1} {aspect.aspect} {aspect.planet2}
                  </span>
                </div>
                <span className="text-sm text-soft/70">Orb: {aspect.orb.toFixed(1)}°</span>
              </div>
              <p className="text-soft/80 text-sm">{aspect.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHouses = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🏠 House Overlays</h3>
        <p className="text-soft mb-6">
          How your planets activate each other's life areas and experiences.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compatibility.houseOverlays.slice(0, 12).map((overlay, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🏠</span>
                <span className="font-semibold text-soft">
                  {overlay.planet} in House {overlay.house}
                </span>
                <span className="ml-auto text-xs text-soft/50">
                  {overlay.person === 'person1' ? person1Data.name || 'Person 1' : person2Data.name || 'Person 2'}
                </span>
              </div>
              <p className="text-soft/80 text-sm">{overlay.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAspects = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🔗 Aspect Analysis</h3>
        <p className="text-soft mb-6">
          Detailed breakdown of all planetary aspects and their relationship impact.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-soft font-semibold">Planets</th>
                <th className="text-left p-3 text-soft font-semibold">Aspect</th>
                <th className="text-left p-3 text-soft font-semibold">Orb</th>
                <th className="text-left p-3 text-soft font-semibold">Influence</th>
                <th className="text-left p-3 text-soft font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {compatibility.aspects.map((aspect, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5"
                >
                  <td className="p-3 text-soft font-medium">
                    {aspect.planet1} - {aspect.planet2}
                  </td>
                  <td className="p-3 text-soft">{aspect.aspect}</td>
                  <td className="p-3 text-soft">{aspect.orb.toFixed(1)}°</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aspect.influence === 'harmonious' 
                        ? 'bg-green-500/20 text-green-300' 
                        : aspect.influence === 'challenging'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {aspect.influence}
                    </span>
                  </td>
                  <td className="p-3 text-soft/80 text-sm max-w-xs">{aspect.description}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderComposite = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌟 Composite Chart</h3>
        <p className="text-soft mb-6">
          The composite chart represents the essence of your relationship as a third entity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-3xl mb-2">☀️</div>
            <div className="text-soft font-semibold">Sun Sign</div>
            <div className="text-yellow-400 font-bold">{compatibility.composite.sunSign}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-3xl mb-2">🌙</div>
            <div className="text-soft font-semibold">Moon Sign</div>
            <div className="text-blue-400 font-bold">{compatibility.composite.moonSign}</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="text-3xl mb-2">🌅</div>
            <div className="text-soft font-semibold">Ascendant</div>
            <div className="text-purple-400 font-bold">{compatibility.composite.ascendant}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <p className="text-soft leading-relaxed">{compatibility.composite.description}</p>
        </div>
      </div>
    </div>
  )

  const renderTiming = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">⏰ Timing Insights</h3>
        <p className="text-soft mb-6">
          Cosmic timing for your relationship development and important periods.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Current Transits
            </h4>
            <ul className="space-y-3">
              {compatibility.timing.currentTransits.map((transit, index) => (
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
              Future Highlights
            </h4>
            <ul className="space-y-3">
              {compatibility.timing.futureHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-1">✨</span>
                  <p className="text-soft/80 text-sm">{highlight}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Timing Advice
          </h4>
          <p className="text-soft/80">{compatibility.timing.advice}</p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "planets":
        return renderPlanets()
      case "houses":
        return renderHouses()
      case "aspects":
        return renderAspects()
      case "composite":
        return renderComposite()
      case "timing":
        return renderTiming()
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