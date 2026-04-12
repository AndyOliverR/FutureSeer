"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileCardsData } from '@/types/tarot'
import { Sparkles, User, Target, Heart, Star } from 'lucide-react'
import { applyTarotImageOnError, resolveTarotCardImageSrc } from '@/lib/tarotImageUrl'

export interface TarotProfileDiagramProps {
  profileCards: ProfileCardsData | null
}

export function TarotProfileDiagram({ profileCards }: TarotProfileDiagramProps) {
  if (!profileCards) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-slate-600">Complete your profile to see your Tarot cards</p>
      </div>
    )
  }

  const { birthCard, lifePathCard, soulCard, personalityCard } = profileCards

  // Define card configurations
  const cards = [
    {
      card: birthCard,
      label: 'Birth Card',
      role: 'Foundation',
      icon: <User className="w-5 h-5" />,
      colors: {
        bg: 'from-purple-50 to-pink-50',
        border: 'border-purple-300',
        text: 'text-purple-700',
        headerBg: 'bg-purple-100/60'
      }
    },
    {
      card: lifePathCard,
      label: 'Life Path Card',
      role: 'Journey',
      icon: <Target className="w-5 h-5" />,
      colors: {
        bg: 'from-cyan-50 to-blue-50',
        border: 'border-cyan-300',
        text: 'text-cyan-700',
        headerBg: 'bg-cyan-100/60'
      }
    },
    {
      card: soulCard,
      label: 'Soul Card',
      role: 'Inner Self',
      icon: <Heart className="w-5 h-5" />,
      colors: {
        bg: 'from-pink-50 to-rose-50',
        border: 'border-pink-300',
        text: 'text-pink-700',
        headerBg: 'bg-pink-100/60'
      }
    },
    {
      card: personalityCard,
      label: 'Personality Card',
      role: 'Expression',
      icon: <Star className="w-5 h-5" />,
      colors: {
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        headerBg: 'bg-blue-100/60'
      }
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
      {cards.map((item, index) => {
        if (!item.card) return null
        const card = item.card

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${item.colors.bg} border-2 ${item.colors.border} shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6">
                {/* Header */}
                <div className={`${item.colors.headerBg} rounded-xl px-4 py-3 mb-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={item.colors.text}>
                      {item.icon}
                    </div>
                    <div>
                      <div className={`font-bold ${item.colors.text} text-sm uppercase tracking-wide`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-600">
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Image */}
                <div className="mb-4 flex justify-center">
                  <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-white shadow-md bg-white">
                    <img
                      src={resolveTarotCardImageSrc(card)}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        applyTarotImageOnError(e.currentTarget, card)
                      }}
                    />
                  </div>
                </div>

                {/* Card Details */}
                <div className="text-center space-y-2">
                  <h3 className={`font-bold ${item.colors.text} text-lg`}>
                    {card.name}
                  </h3>
                  
                  {card.arcana && (
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      {card.arcana === 'major' ? 'Major Arcana' : `${card.suit || ''} - Minor Arcana`}
                    </div>
                  )}

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {card.upright}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
