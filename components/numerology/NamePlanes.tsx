import React from 'react'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { BookOpen, Zap, Heart, Sparkles } from 'lucide-react'

interface NamePlanesProps {
  firstName?: string
  nameNumber?: number
}

// Simplified first letter analysis
const FIRST_LETTER_TRAITS: Record<string, string> = {
  A: 'Honest, independent, creative, ambitious, original, emotional depth, sociable',
  B: 'Diplomatic, cooperative, intuitive, sensitive',
  C: 'Creative, communicative, expressive, optimistic',
  D: 'Practical, disciplined, hardworking, reliable',
  E: 'Versatile, curious, adventurous, freedom-loving',
  F: 'Family-oriented, nurturing, responsible',
  G: 'Spiritual, intuitive, analytical, perfectionist',
  H: 'Practical, business-minded, organized',
  I: 'Creative, expressive, idealistic, compassionate',
  J: 'Independent, original, leadership qualities',
  K: 'Practical, ambitious, disciplined',
  L: 'Artistic, creative, expressive, emotional',
  M: 'Practical, reliable, nurturing, family-focused',
  N: 'Intuitive, creative, adaptable, communicative',
  O: 'Optimistic, enthusiastic, charismatic',
  P: 'Practical, analytical, perfectionist',
  Q: 'Intuitive, mysterious, spiritual',
  R: 'Practical, reliable, responsible',
  S: 'Independent, original, creative',
  T: 'Practical, analytical, detail-oriented',
  U: 'Intuitive, creative, expressive',
  V: 'Practical, visionary, independent',
  W: 'Practical, reliable, disciplined',
  X: 'Versatile, adaptable, intuitive',
  Y: 'Intuitive, creative, independent',
  Z: 'Practical, analytical, perfectionist',
}

export function NamePlanes({ firstName, nameNumber }: NamePlanesProps) {
  const firstLetter = firstName?.charAt(0).toUpperCase() || 'A'
  const traits = FIRST_LETTER_TRAITS[firstLetter] || FIRST_LETTER_TRAITS.A

  const items = [
    { text: `First Letter ${firstLetter}: ${traits}`, highlight: true },
    ...(nameNumber === 8 ? [
      { text: 'Name Number 8: Beneficial when paired with Driver or Conductor numbers 1, 3, or 6. You may experience loneliness initially but achieve success, recognition, and fame through persistent effort.', type: 'positive' as const },
      { text: 'Note: The name number influences the Driver but not the Conductor (destiny is shaped by past life karmas).', type: 'neutral' as const }
    ] : []),
    { text: 'Knowledge Plane: Strong drive and determination with cautious approach', icon: <Zap className="w-4 h-4" /> },
    { text: 'Strength Plane: Emotional sensitivity and deep attachments', icon: <Zap className="w-4 h-4" /> },
    { text: 'Emotional Plane: Dramatic nature with frequent mood swings', icon: <Heart className="w-4 h-4" /> },
    { text: 'Spiritual Plane: Strong intuition and psychic connection', icon: <Sparkles className="w-4 h-4" /> }
  ]

  return (
    <DevotionistStyleCard
      icon={<BookOpen className="w-5 h-5" />}
      title="Name Analysis"
      summary="Your name reveals hidden aspects of your personality and spiritual planes"
      items={items}
      colorScheme="purple"
    />
  )
}

