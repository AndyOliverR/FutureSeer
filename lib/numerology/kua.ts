// Kua number calculation and directions

interface KuaResult {
  number: number
  element: string
  attributes: string
  directions: {
    success: string
    health: string
    relationships: string
    wisdom: string
  }
}

const KUA_ELEMENTS: Record<number, string> = {
  1: 'Water',
  2: 'Earth',
  3: 'Wood',
  4: 'Wood',
  6: 'Metal',
  7: 'Metal',
  8: 'Earth',
  9: 'Fire',
}

const KUA_ATTRIBUTES: Record<number, string> = {
  1: 'Flexible, intuitive, and adaptable. Natural flow and movement.',
  2: 'Stable, nurturing, and grounded. Builds lasting foundations.',
  3: 'Growth-oriented, creative, and expansive. Forward momentum.',
  4: 'Disciplined, organized, and methodical. Structured progress.',
  6: 'Strong, decisive, and authoritative. Leadership qualities.',
  7: 'Analytical, reflective, and precise. Wisdom through contemplation.',
  8: 'Practical, responsible, and hardworking. Material stability.',
  9: 'Energetic, passionate, and dynamic. Transformation through action.',
}

/** Sheng Qi, Tian Yi, Yan Nian, Fu Wei. Fu Wei is the person's own sitting direction. */
const KUA_DIRECTIONS: Record<number, KuaResult['directions']> = {
  1: {
    success: 'Southeast',
    health: 'East',
    relationships: 'South',
    wisdom: 'North',
  },
  2: {
    success: 'Northeast',
    health: 'West',
    relationships: 'Northwest',
    wisdom: 'Southwest',
  },
  3: {
    success: 'South',
    health: 'North',
    relationships: 'Southeast',
    wisdom: 'East',
  },
  4: {
    success: 'North',
    health: 'South',
    relationships: 'East',
    wisdom: 'Southeast',
  },
  6: {
    success: 'West',
    health: 'Northeast',
    relationships: 'Southwest',
    wisdom: 'Northwest',
  },
  7: {
    success: 'Northwest',
    health: 'Southwest',
    relationships: 'Northeast',
    wisdom: 'West',
  },
  8: {
    success: 'Southwest',
    health: 'Northwest',
    relationships: 'West',
    wisdom: 'Northeast',
  },
  9: {
    success: 'East',
    health: 'Southeast',
    relationships: 'North',
    wisdom: 'South',
  },
}

/** Bump when the Kua number or direction map changes so stored Feng Shui reports are recomputed. */
export const KUA_FORMULA_VERSION = 2

function digitalRoot(value: number): number {
  let n = Math.abs(Math.trunc(value))
  while (n > 9) {
    let sum = 0
    while (n > 0) {
      sum += n % 10
      n = Math.floor(n / 10)
    }
    n = sum
  }
  return n
}

/**
 * Eight Mansions Kua.
 * Reduce the birth year to one digit first, then male = 11 − year and female = 4 + year.
 * That matches the last-two-digits rule (10/9 for men, +5/+6 for women) for both centuries.
 * Kua 5 is stored as 2 for men and 8 for women.
 */
export function calcKuaNumber(birthYear: number, isMale: boolean): number {
  const reducedYear = digitalRoot(birthYear)
  let kua = isMale ? 11 - reducedYear : 4 + reducedYear
  if (kua > 9) kua = digitalRoot(kua)
  if (kua === 5) return isMale ? 2 : 8
  return kua
}

/** Calendar year from a profile birth date. ISO dates stay on that year in every timezone. */
export function gregorianYearFromBirthDate(birthDate: string): number | null {
  const iso = /^(\d{4})-\d{2}-\d{2}/.exec(birthDate.trim())
  if (iso) {
    const year = Number(iso[1])
    return year >= 1 && year <= 9999 ? year : null
  }
  const parsed = new Date(birthDate)
  if (Number.isNaN(parsed.getTime())) return null
  const year = parsed.getFullYear()
  return year >= 1 && year <= 9999 ? year : null
}

export function getKuaResult(birthYear: number, isMale: boolean): KuaResult {
  const kua = calcKuaNumber(birthYear, isMale)
  
  return {
    number: kua,
    element: KUA_ELEMENTS[kua] || 'Earth',
    attributes: KUA_ATTRIBUTES[kua] || 'Balanced and harmonious.',
    directions: KUA_DIRECTIONS[kua] || {
      success: 'Northeast',
      health: 'Northwest',
      relationships: 'West',
      wisdom: 'Southeast',
    },
  }
}

