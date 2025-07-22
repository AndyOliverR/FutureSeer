"use client"

import { motion } from "framer-motion"
import { ThirteenSignsAnalysis, BirthData } from "@/hooks/useThirteenSignsZodiac"

interface ThirteenSignsZodiacCoachInterfaceProps {
  analysis: ThirteenSignsAnalysis
  activeTab: string
  birthData: BirthData
}

export function ThirteenSignsZodiacCoachInterface({ 
  analysis, 
  activeTab, 
  birthData 
}: ThirteenSignsZodiacCoachInterfaceProps) {
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Primary Sign Display */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{analysis.overview.primarySign.symbol}</div>
          <h3 className="text-3xl gold-glow mb-2">{analysis.overview.primarySign.name}</h3>
          <p className="text-soft/80">{analysis.overview.primarySign.dates}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-soft font-semibold">Element</div>
            <div className="text-soft/80">{analysis.overview.primarySign.element}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-soft font-semibold">Quality</div>
            <div className="text-soft/80">{analysis.overview.primarySign.quality}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-soft font-semibold">Ruler</div>
            <div className="text-soft/80">{analysis.overview.primarySign.ruler}</div>
          </div>
        </div>
        
        <p className="text-soft leading-relaxed mb-4">{analysis.overview.primarySign.description}</p>
        
        <div className="mb-4">
          <h4 className="text-soft font-semibold mb-2">Key Traits</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.overview.primarySign.traits.map((trait, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🐍 13 Signs Summary</h3>
        <p className="text-soft leading-relaxed mb-4">{analysis.overview.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">✨</span>
              Key Traits
            </h4>
            <ul className="space-y-2">
              {analysis.overview.keyTraits.map((trait, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-soft font-semibold mb-3 flex items-center">
              <span className="mr-2">🌟</span>
              Unique Characteristics
            </h4>
            <ul className="space-y-2">
              {analysis.overview.uniqueCharacteristics.map((characteristic, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {characteristic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSigns = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🪐 Planetary Signs</h3>
        <p className="text-soft mb-6">
          Your planetary positions in the 13 signs zodiac system, including the unique Ophiuchus influence.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysis.signs).map(([planet, sign]) => (
            <motion.div
              key={planet}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-xl border ${
                sign.name === 'Ophiuchus'
                  ? 'border-purple-500/30 bg-purple-500/5'
                  : 'border-emerald-500/30 bg-emerald-500/5'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <h4 className="font-semibold text-soft capitalize">{planet}</h4>
                <div className="text-lg font-bold text-soft">{sign.name}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-soft/70">Element:</span>
                  <span className="text-soft">{sign.element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft/70">Quality:</span>
                  <span className="text-soft">{sign.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft/70">Ruler:</span>
                  <span className="text-soft">{sign.ruler}</span>
                </div>
              </div>
              <p className="text-soft/80 text-xs mt-3">{sign.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCompatibility = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💕 Compatibility Analysis</h3>
        <p className="text-soft mb-6">
          Your compatibility with all 13 zodiac signs, including the unique Ophiuchus dynamics.
        </p>
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2">Overall Compatibility</h4>
          <p className="text-soft/80">{analysis.compatibility.overallCompatibility}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💚</span>
              Best Matches
            </h4>
            <div className="space-y-3">
              {analysis.compatibility.bestMatches.map((match, index) => (
                <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-soft">{match.sign}</span>
                    <span className="text-sm text-green-400">{match.percentage}%</span>
                  </div>
                  <p className="text-soft/80 text-sm mb-2">{match.description}</p>
                  <div className="text-xs text-green-400">
                    Strengths: {match.strengths.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💙</span>
              Good Matches
            </h4>
            <div className="space-y-3">
              {analysis.compatibility.goodMatches.map((match, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-soft">{match.sign}</span>
                    <span className="text-sm text-blue-400">{match.percentage}%</span>
                  </div>
                  <p className="text-soft/80 text-sm mb-2">{match.description}</p>
                  <div className="text-xs text-blue-400">
                    Strengths: {match.strengths.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Challenging Matches
            </h4>
            <div className="space-y-3">
              {analysis.compatibility.challengingMatches.map((match, index) => (
                <div key={index} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-soft">{match.sign}</span>
                    <span className="text-sm text-orange-400">{match.percentage}%</span>
                  </div>
                  <p className="text-soft/80 text-sm mb-2">{match.description}</p>
                  <div className="text-xs text-orange-400">
                    Challenges: {match.challenges.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPersonality = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">👤 Personality Profile</h3>
        <p className="text-soft mb-6">
          Deep dive into your personality traits, strengths, and areas for growth based on the 13 signs system.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Core Traits
            </h4>
            <ul className="space-y-2">
              {analysis.personality.coreTraits.map((trait, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💪</span>
              Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.personality.strengths.map((strength, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Growth Areas
            </h4>
            <ul className="space-y-2">
              {analysis.personality.weaknesses.map((weakness, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              Development Areas
            </h4>
            <ul className="space-y-2">
              {analysis.personality.growthAreas.map((area, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2">Life Path</h4>
          <p className="text-soft/80">{analysis.personality.lifePath}</p>
        </div>
      </div>
    </div>
  )

  const renderCareer = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">💼 Career Guidance</h3>
        <p className="text-soft mb-6">
          Professional insights and career recommendations based on your 13 signs zodiac profile.
        </p>
        
        <div className="mb-6">
          <h4 className="text-lg text-soft font-semibold mb-4">Ideal Professions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.career.idealProfessions.map((profession, index) => (
              <div key={index} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-soft font-medium">{profession}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <h4 className="text-lg text-soft font-semibold mb-2">Work Style</h4>
          <p className="text-soft/80">{analysis.career.workStyle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">👑</span>
              Leadership Qualities
            </h4>
            <ul className="space-y-2">
              {analysis.career.leadershipQualities.map((quality, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {quality}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Success Factors
            </h4>
            <ul className="space-y-2">
              {analysis.career.successFactors.map((factor, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHealth = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl gold-glow mb-4">🌿 Health & Wellness</h3>
        <p className="text-soft mb-6">
          Health insights and wellness recommendations based on your 13 signs zodiac profile.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💪</span>
              Health Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.health.strengths.map((strength, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Vulnerabilities
            </h4>
            <ul className="space-y-2">
              {analysis.health.vulnerabilities.map((vulnerability, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  {vulnerability}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Wellness Tips
            </h4>
            <ul className="space-y-2">
              {analysis.health.wellnessTips.map((tip, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🏃</span>
              Recommended Activities
            </h4>
            <ul className="space-y-2">
              {analysis.health.recommendedActivities.map((activity, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  {activity}
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
        <h3 className="text-xl gold-glow mb-4">💡 Personalized Advice</h3>
        <p className="text-soft mb-6">
          Tailored guidance for different areas of your life based on your 13 signs zodiac profile.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Personal Development
            </h4>
            <ul className="space-y-2">
              {analysis.advice.personal.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
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
              <span className="mr-2">💼</span>
              Career
            </h4>
            <ul className="space-y-2">
              {analysis.advice.career.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌿</span>
              Health
            </h4>
            <ul className="space-y-2">
              {analysis.advice.health.map((advice, index) => (
                <li key={index} className="text-soft flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <p className="text-sm">{advice}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-lg text-soft font-semibold mb-4 flex items-center">
              <span className="mr-2">🌟</span>
              Spiritual Growth
            </h4>
            <ul className="space-y-2">
              {analysis.advice.spiritual.map((advice, index) => (
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

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "signs":
        return renderSigns()
      case "compatibility":
        return renderCompatibility()
      case "personality":
        return renderPersonality()
      case "career":
        return renderCareer()
      case "health":
        return renderHealth()
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