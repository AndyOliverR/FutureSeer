import React from 'react'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { Sparkles, Palette, Calendar, Clock, Gem, Heart, Star, Volume2 } from 'lucide-react'
import { getLuckyEssentials } from '@/lib/numerology/lucky'

interface LuckyEssentialsProps {
  driver: number | null
  conductor: number | null
  birthYear?: number
}

export function LuckyEssentials({ driver, conductor, birthYear }: LuckyEssentialsProps) {
  const lucky = getLuckyEssentials(driver, conductor, birthYear)

  const items = [
    { text: `Numbers: ${lucky.numbers.join(', ')}`, icon: <Star className="w-4 h-4" /> },
    { text: `Colors: ${lucky.colors.join(', ')}`, icon: <Palette className="w-4 h-4" /> },
    { text: `Dates: ${lucky.dates.slice(0, 5).map(d => `${d}th`).join(', ')}`, icon: <Calendar className="w-4 h-4" /> },
    ...(lucky.years.length > 0 ? [{ text: `Lucky Years: ${lucky.years.slice(0, 4).map(y => `Age ${y}`).join(', ')}`, icon: <Clock className="w-4 h-4" /> }] : []),
    ...(lucky.gemstone ? [{ text: `Gemstone: ${lucky.gemstone}`, icon: <Gem className="w-4 h-4" /> }] : []),
    ...(lucky.rudraksh ? [{ text: `Rudraksh: ${lucky.rudraksh}`, icon: <Heart className="w-4 h-4" /> }] : []),
    ...(lucky.bracelet ? [{ text: `Bracelet: ${lucky.bracelet}`, icon: <Heart className="w-4 h-4" /> }] : []),
    ...(lucky.yantra ? [{ text: `Yantra: ${lucky.yantra}`, icon: <Star className="w-4 h-4" /> }] : []),
    ...(lucky.mantra ? [{ text: `Mantra: ${lucky.mantra}`, icon: <Volume2 className="w-4 h-4" />, highlight: true }] : [])
  ]

  return (
    <DevotionistStyleCard
      icon={<Sparkles className="w-5 h-5" />}
      title="Lucky Essentials"
      summary="Favorable elements aligned with your numerology profile to enhance luck and harmony"
      items={items}
      colorScheme="amber"
    />
  )
}

