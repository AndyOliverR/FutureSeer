// Zodiac sign determination and traits

export interface ZodiacInfo {
  sign: string
  symbol: string
  ruler: string
  traits: string[]
  description: string
}

const ZODIAC_DATA: Record<string, ZodiacInfo> = {
  Pisces: {
    sign: 'Pisces',
    symbol: 'Fish',
    ruler: 'Jupiter',
    traits: ['Emotional', 'Intuitive', 'Compassionate', 'Creative', 'Idealistic'],
    description: 'Deeply emotional and sensitive, you possess strong intuition and creativity. Your idealistic nature helps you connect with spirituality and the mystical.',
  },
  Aries: {
    sign: 'Aries',
    symbol: 'Ram',
    ruler: 'Mars',
    traits: ['Bold', 'Independent', 'Energetic', 'Pioneering', 'Impulsive'],
    description: 'Natural leader with pioneering spirit, you charge ahead with determination and courage.',
  },
  Taurus: {
    sign: 'Taurus',
    symbol: 'Bull',
    ruler: 'Venus',
    traits: ['Stable', 'Patient', 'Reliable', 'Sensual', 'Stubborn'],
    description: 'Grounded and practical, you seek security and enjoy life\'s pleasures with steady determination.',
  },
  Gemini: {
    sign: 'Gemini',
    symbol: 'Twins',
    ruler: 'Mercury',
    traits: ['Curious', 'Adaptable', 'Communicative', 'Versatile', 'Restless'],
    description: 'Quick-witted and versatile, you thrive on communication and new experiences.',
  },
  Cancer: {
    sign: 'Cancer',
    symbol: 'Crab',
    ruler: 'Moon',
    traits: ['Nurturing', 'Intuitive', 'Protective', 'Emotional', 'Moody'],
    description: 'Deeply caring and intuitive, you value home and family, guided by emotional intelligence.',
  },
  Leo: {
    sign: 'Leo',
    symbol: 'Lion',
    ruler: 'Sun',
    traits: ['Confident', 'Generous', 'Creative', 'Dramatic', 'Proud'],
    description: 'Bold and charismatic, you shine brightly and inspire others with your natural leadership.',
  },
  Virgo: {
    sign: 'Virgo',
    symbol: 'Maiden',
    ruler: 'Mercury',
    traits: ['Analytical', 'Practical', 'Detail-oriented', 'Modest', 'Critical'],
    description: 'Meticulous and service-oriented, you strive for perfection and helpfulness in all you do.',
  },
  Libra: {
    sign: 'Libra',
    symbol: 'Scales',
    ruler: 'Venus',
    traits: ['Diplomatic', 'Harmonious', 'Artistic', 'Social', 'Indecisive'],
    description: 'Seeker of balance and beauty, you bring harmony to relationships and surroundings.',
  },
  Scorpio: {
    sign: 'Scorpio',
    symbol: 'Scorpion',
    ruler: 'Mars/Pluto',
    traits: ['Intense', 'Passionate', 'Mysterious', 'Transformative', 'Secretive'],
    description: 'Powerfully transformative, you delve deep into life\'s mysteries with unwavering intensity.',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    symbol: 'Archer',
    ruler: 'Jupiter',
    traits: ['Adventurous', 'Optimistic', 'Philosophical', 'Independent', 'Blunt'],
    description: 'Free-spirited explorer, you seek truth and adventure with optimistic enthusiasm.',
  },
  Capricorn: {
    sign: 'Capricorn',
    symbol: 'Goat',
    ruler: 'Saturn',
    traits: ['Ambitious', 'Disciplined', 'Practical', 'Reserved', 'Rigid'],
    description: 'Driven and responsible, you build lasting success through discipline and patience.',
  },
  Aquarius: {
    sign: 'Aquarius',
    symbol: 'Water Bearer',
    ruler: 'Uranus',
    traits: ['Innovative', 'Independent', 'Humanitarian', 'Eccentric', 'Detached'],
    description: 'Visionary and forward-thinking, you champion progress and humanitarian causes.',
  },
}

export function getZodiacFromDate(birthDateISO: string | undefined): ZodiacInfo | null {
  if (!birthDateISO) return null
  
  const date = new Date(birthDateISO)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_DATA.Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_DATA.Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_DATA.Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_DATA.Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_DATA.Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_DATA.Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_DATA.Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_DATA.Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_DATA.Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_DATA.Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_DATA.Aquarius
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_DATA.Pisces
  
  return null
}

