/**
 * Lunar-day and half-tithi names from Sun/Moon elongation.
 * A tithi is 12° of elongation. A karana is 6°. Paksha flips at 180°.
 */

const PAKSHA_TITHI_NAMES = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
] as const

const MOVABLE_KARANAS = [
  'Bava',
  'Balava',
  'Kaulava',
  'Taitila',
  'Gara',
  'Vanija',
  'Vishti',
] as const

export type PanchangaPaksha = 'Shukla' | 'Krishna'

export interface TithiLabel {
  number: number
  name: string
  paksha: PanchangaPaksha
  progress: number
}

export interface KaranaLabel {
  number: number
  name: string
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360
}

/** Tithi 1 is Shukla Pratipada (0–12°). Tithi 15 is Purnima. Tithi 30 is Amavasya. */
export function tithiFromLongitudes(sunLongitude: number, moonLongitude: number): TithiLabel {
  const elongation = normalizeDegrees(moonLongitude - sunLongitude)
  const number = Math.floor(elongation / 12) + 1
  const progress = ((elongation % 12) / 12) * 100
  const paksha: PanchangaPaksha = number <= 15 ? 'Shukla' : 'Krishna'
  const withinPaksha = number <= 15 ? number : number - 15
  const name = withinPaksha === 15
    ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya')
    : PAKSHA_TITHI_NAMES[withinPaksha - 1]

  return { number, name, paksha, progress }
}

/**
 * Sixty karanas in a lunar month.
 * Index 0 is Kimstughna, indexes 1–56 repeat the seven movable karanas,
 * and indexes 57–59 are Shakuni, Chatushpada, and Naga.
 */
export function karanaFromElongation(elongation: number): KaranaLabel {
  const normalized = normalizeDegrees(elongation)
  const index = Math.min(59, Math.floor(normalized / 6))
  const number = index + 1

  if (index === 0) return { number, name: 'Kimstughna' }
  if (index === 57) return { number, name: 'Shakuni' }
  if (index === 58) return { number, name: 'Chatushpada' }
  if (index === 59) return { number, name: 'Naga' }

  return { number, name: MOVABLE_KARANAS[(index - 1) % 7] }
}

export function karanaFromLongitudes(sunLongitude: number, moonLongitude: number): KaranaLabel {
  return karanaFromElongation(moonLongitude - sunLongitude)
}

export function tithiSignificance(tithiNumber: number, paksha: string): string {
  const withinPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15
  const significances: Record<number, string> = {
    1: 'New beginnings, auspicious for starting ventures',
    2: 'Good for partnerships and relationships',
    3: 'Favorable for creative activities',
    4: 'Good for spiritual practices',
    5: 'Auspicious for learning and education',
    6: 'Good for health-related activities',
    7: 'Favorable for travel and movement',
    8: 'Good for transformation and change',
    9: 'Auspicious for worship and devotion',
    10: 'Good for business and commerce',
    11: 'Favorable for fasting and spiritual practices',
    12: 'Good for charity and service',
    13: 'Favorable for meditation and introspection',
    14: 'Good for preparation and planning',
    15: paksha === 'Shukla' ? 'Full Moon - Peak energy' : 'New Moon - New beginnings',
  }

  return significances[withinPaksha] || 'Neutral day'
}
