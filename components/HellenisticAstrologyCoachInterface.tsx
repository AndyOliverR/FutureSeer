"use client"

import { motion } from "framer-motion"
import { HellenisticAnalysis, BirthData } from "@/hooks/useHellenisticAstrology"

interface HellenisticAstrologyCoachInterfaceProps {
  analysis: HellenisticAnalysis
  activeTab: string
  birthData: BirthData
}

export function HellenisticAstrologyCoachInterface({ 
  analysis, 
  activeTab, 
  birthData 
}: HellenisticAstrologyCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Chart Summary */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🏛️ Hellenistic Chart Summary</h3>
        <p className="text-soft leading-relaxed mb-4">{analysis.overview.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-soft font-semibold mb-2">Temperament</h4>
            <p className="text-soft/80 text-sm">{analysis.overview.temperament}</p>
          </div>
          <div>
            <h4 className="text-soft font-semibold mb-2">Elemental Balance</h4>
            <p className="text-soft/80 text-sm">{analysis.overview.elementalBalance}</p>
          </div>
        </div>
      </div>

      {/* Key Strengths & Challenges */}
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
            Growth Areas
          </h3>
          <ul className="space-y-2">
            {analysis.overview.challenges.map((challenge, index) => (
              <li key={index} className="text-soft flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  const renderPlanets = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🪐 Planetary Analysis</h3>
        <p className="text-soft mb-6">
          Traditional Hellenistic planetary positions and their dignities in your chart.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysis.planets).map(([planet, data]) => (
            <motion.div
              key={planet}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-xl border ${
                data.dignity.strength >= 4
                  ? 'border-green-500/30 bg-green-500/5'
                  : data.dignity.strength <= 1
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">{this.getPlanetSymbol(planet)}</div>
                <h4 className="font-semibold text-soft capitalize">{planet}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-soft/70">Sign:</span>
                  <span className="text-soft">{data.sign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft/70">House:</span>
                  <span className="text-soft">{data.house}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft/70">Dignity:</span>
                  <span className="text-soft capitalize">{data.dignity.dignity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft/70">Strength:</span>
                  <span className="text-soft">{data.dignity.strength}/5</span>
                </div>
              </div>
              <p className="text-soft/80 text-xs mt-3">{data.interpretation}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAspects = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🔗 Classical Aspects</h3>
        <p className="text-soft mb-6">
          Traditional Hellenistic aspect interpretations and their significance.
        </p>
        
        <div className="space-y-4">
          {analysis.aspects.map((aspect, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                aspect.strength === 'strong'
                  ? 'border-green-500/30 bg-green-500/5'
                  : aspect.strength === 'moderate'
                  ? 'border-blue-500/30 bg-blue-500/5'
                  : 'border-orange-500/30 bg-orange-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-soft font-semibold capitalize">{aspect.planet1}</span>
                  <span className="text-2xl">{this.getAspectSymbol(aspect.aspect)}</span>
                  <span className="text-soft font-semibold capitalize">{aspect.planet2}</span>
                </div>
                <div className="text-sm text-soft/70">
                  {aspect.orb.toFixed(1)}° orb
                </div>
              </div>
              <p className="text-soft/80 text-sm">{aspect.interpretation}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  aspect.strength === 'strong'
                    ? 'bg-green-500/20 text-green-400'
                    : aspect.strength === 'moderate'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {aspect.strength} aspect
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHouses = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🏠 Traditional Houses</h3>
        <p className="text-soft mb-6">
          Hellenistic house system analysis with traditional rulers and interpretations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.houses.map((house, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-soft">House {house.house}</h4>
                <div className="text-sm text-soft/70">{house.sign}</div>
              </div>
              <p className="text-soft/80 text-sm mb-2">{house.interpretation}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-soft/70">Ruler: {house.traditionalRuler}</span>
                {house.planets.length > 0 && (
                  <span className="text-soft/70">Planets: {house.planets.join(', ')}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDignities = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">👑 Planetary Dignities</h3>
        <p className="text-soft mb-6">
          Traditional Hellenistic planetary dignities and their impact on your chart.
        </p>
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2">Overall Assessment</h4>
          <p className="text-soft/80">{analysis.dignities.overallAssessment}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Strong Planets
            </h4>
            <div className="space-y-3">
              {analysis.dignities.strongPlanets.map((planet, index) => (
                <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-soft capitalize">{planet.planet}</span>
                    <span className="text-sm text-green-400 capitalize">{planet.dignity}</span>
                  </div>
                  <p className="text-soft/80 text-sm">{planet.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Challenging Planets
            </h4>
            <div className="space-y-3">
              {analysis.dignities.weakPlanets.map((planet, index) => (
                <div key={index} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-soft capitalize">{planet.planet}</span>
                    <span className="text-sm text-orange-400 capitalize">{planet.dignity}</span>
                  </div>
                  <p className="text-soft/80 text-sm">{planet.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTiming = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">⏰ Hellenistic Timing</h3>
        <p className="text-soft mb-6">
          Traditional timing techniques and life period analysis.
        </p>
        
        <div className="mb-6">
          <h4 className="text-lg text-soft font-semibold mb-4">Life Periods</h4>
          <div className="space-y-2">
            {analysis.timing.lifePeriods.map((period, index) => (
              <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-soft text-sm">{period}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">✅</span>
              Favorable Transits
            </h4>
            <ul className="space-y-2">
              {analysis.timing.favorableTransits.map((transit, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <p className="text-sm">{transit}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Challenging Transits
            </h4>
            <ul className="space-y-2">
              {analysis.timing.challengingTransits.map((transit, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  <p className="text-sm">{transit}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              Timing Techniques
            </h4>
            <ul className="space-y-2">
              {analysis.timing.timingTechniques.map((technique, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <p className="text-sm">{technique}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdvice = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💡 Hellenistic Guidance</h3>
        <p className="text-soft mb-6">
          Traditional Hellenistic advice based on your chart analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Personality Development
            </h4>
            <ul className="space-y-2">
              {analysis.advice.personality.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💼</span>
              Career Guidance
            </h4>
            <ul className="space-y-2">
              {analysis.advice.career.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💕</span>
              Relationships
            </h4>
            <ul className="space-y-2">
              {analysis.advice.relationships.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌿</span>
              Health & Wellness
            </h4>
            <ul className="space-y-2">
              {analysis.advice.health.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌟</span>
              Spiritual Development
            </h4>
            <ul className="space-y-2">
              {analysis.advice.spirituality.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const getPlanetSymbol = (planet: string): string => {
    const symbols: Record<string, string> = {
      sun: '☀️',
      moon: '🌙',
      mercury: '☿',
      venus: '♀️',
      mars: '♂️',
      jupiter: '♃',
      saturn: '♄'
    }
    return symbols[planet.toLowerCase()] || '🪐'
  }

  const getAspectSymbol = (aspect: string): string => {
    const symbols: Record<string, string> = {
      conjunction: '☌',
      sextile: '⚹',
      square: '□',
      trine: '△',
      opposition: '☍'
    }
    return symbols[aspect] || '🔗'
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "planets":
        return renderPlanets()
      case "aspects":
        return renderAspects()
      case "houses":
        return renderHouses()
      case "dignities":
        return renderDignities()
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