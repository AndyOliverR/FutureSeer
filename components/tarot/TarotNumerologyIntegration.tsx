"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TarotCard } from '@/lib/tarotIntelligence'
import { ProfileCardsData, NumerologyData, CombinedSystemData } from '@/types/tarot'
import { ArrowRight, Hash, Sparkles } from 'lucide-react'

export interface TarotNumerologyIntegrationProps {
  profileCards: ProfileCardsData | null
  numerologyData?: NumerologyData
  combinedSystemData?: CombinedSystemData | null
}

// Map card to its numerological value
function getCardNumber(card: TarotCard): number {
  if (card.number !== undefined) return card.number
  // For court cards without numbers
  if (card.name.includes('Page')) return 11
  if (card.name.includes('Knight')) return 12
  if (card.name.includes('Queen')) return 13
  if (card.name.includes('King')) return 14
  return 0
}

export function TarotNumerologyIntegration({ 
  profileCards, 
  numerologyData,
  combinedSystemData 
}: TarotNumerologyIntegrationProps) {
  // Use cross-references from combined system if available
  const tarotNumerologyLinks = combinedSystemData?.crossReferences?.tarotNumerologyLinks || []
  const timingInsights = combinedSystemData?.crossReferences?.timingInsights

  if (!profileCards || !numerologyData) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-slate-600">Complete your profile to see Tarot & Numerology connections</p>
      </div>
    )
  }

  // Build connections
  const connections = [
    {
      card: profileCards.lifePathCard,
      number: numerologyData.lifePathNumber,
      label: 'Life Path',
      description: tarotNumerologyLinks.find((l: any) => l.tarotCard === profileCards.lifePathCard?.name)?.connection || 
        `Your Life Path Number ${numerologyData.lifePathNumber} aligns with ${profileCards.lifePathCard?.name}, showing your core spiritual journey.`,
      color: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-900' }
    },
    {
      card: profileCards.soulCard,
      number: numerologyData.soulNumber,
      label: 'Soul',
      description: tarotNumerologyLinks.find((l: any) => l.tarotCard === profileCards.soulCard?.name)?.connection || 
        `Your Soul Number ${numerologyData.soulNumber} resonates with ${profileCards.soulCard?.name}, revealing your inner desires.`,
      color: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900' }
    },
    {
      card: profileCards.personalityCard,
      number: numerologyData.personalityNumber,
      label: 'Personality',
      description: tarotNumerologyLinks.find((l: any) => l.tarotCard === profileCards.personalityCard?.name)?.connection || 
        `Your Personality Number ${numerologyData.personalityNumber} connects with ${profileCards.personalityCard?.name}, showing how you express yourself.`,
      color: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' }
    }
  ].filter(c => c.card && c.number)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Tarot & Numerology Synergy</h3>
        <p className="text-slate-600 text-sm">
          Discover how your numbers and cards work together
        </p>
      </div>

      {/* Connection Cards */}
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`${connection.color.bg} border-2 ${connection.color.border} shadow-lg rounded-3xl overflow-hidden`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Tarot Card Side */}
                  <div className="flex-1 p-6 text-center md:text-left">
                    <Badge className={`${connection.color.bg} ${connection.color.text} mb-3`}>
                      Tarot Card
                    </Badge>
                    <h4 className={`font-bold ${connection.color.text} text-xl mb-2`}>
                      {connection.card?.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {connection.label} Card
                    </p>
                    {connection.card && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {connection.card.upright.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  {/* Connection Arrow */}
                  <div className="flex-shrink-0 p-4">
                    <div className={`${connection.color.bg} rounded-full p-3 border-2 ${connection.color.border}`}>
                      <ArrowRight className={`w-6 h-6 ${connection.color.text} hidden md:block`} />
                      <Sparkles className={`w-6 h-6 ${connection.color.text} md:hidden`} />
                    </div>
                  </div>

                  {/* Numerology Side */}
                  <div className="flex-1 p-6 text-center md:text-right">
                    <Badge className={`${connection.color.bg} ${connection.color.text} mb-3`}>
                      Numerology
                    </Badge>
                    <h4 className={`font-bold ${connection.color.text} text-xl mb-2`}>
                      Number {connection.number}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {connection.label} Number
                    </p>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${connection.color.bg} border-2 ${connection.color.border}`}>
                      <span className={`text-3xl font-bold ${connection.color.text}`}>
                        {connection.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connection Description */}
                <div className="px-6 pb-6">
                  <Card className="bg-white/60 border border-slate-200 rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {connection.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Personal Year Integration */}
      {numerologyData.personalYearNumber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-200/60 rounded-full p-4">
                  <Hash className="w-8 h-8 text-amber-700" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-amber-900 mb-2">
                    Personal Year {numerologyData.personalYearNumber}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {timingInsights || `Your Personal Year ${numerologyData.personalYearNumber} brings specific themes and opportunities that align with your Tarot profile cards.`}
                  </p>
                  <Badge className="bg-amber-200 text-amber-900">
                    Current Year Theme
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Integration Guidance */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl">
        <CardContent className="p-6">
          <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Using Both Systems Together
          </h4>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="bg-white/60 rounded-lg p-3">
              <strong className="text-purple-800">Daily Practice:</strong> Draw a Tarot card each day and note how it relates to your Personal Year number's energy.
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <strong className="text-purple-800">Decision Making:</strong> Consult both your Life Path Number and Life Path Card when facing major life choices for comprehensive guidance.
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <strong className="text-purple-800">Self-Discovery:</strong> Study how the meanings of your numerology numbers complement the symbolism of your corresponding Tarot cards.
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <strong className="text-purple-800">Timing:</strong> Use numerology cycles (Personal Year, Month, Day) to understand when specific Tarot card energies are most active in your life.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
