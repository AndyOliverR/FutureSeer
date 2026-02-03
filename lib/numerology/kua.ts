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

const KUA_DIRECTIONS: Record<number, KuaResult['directions']> = {
  1: {
    success: 'North',
    health: 'East',
    relationships: 'Southeast',
    wisdom: 'Northeast',
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
    relationships: 'East',
    wisdom: 'Southeast',
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
    relationships: 'Northwest',
    wisdom: 'Southwest',
  },
  7: {
    success: 'Northwest',
    health: 'West',
    relationships: 'Southwest',
    wisdom: 'Northeast',
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
    relationships: 'South',
    wisdom: 'North',
  },
}

export function calcKuaNumber(birthYear: number, isMale: boolean): number {
  const yearDigits = birthYear
    .toString()
    .split('')
    .reduce((sum, d) => sum + parseInt(d, 10), 0)
  
  let kua = isMale ? 11 - yearDigits : 4 + yearDigits
  
  // Reduce to single digit or handle 5
  while (kua > 9 || kua < 1) {
    if (kua === 5) {
      return isMale ? 2 : 8
    }
    if (kua > 9) {
      kua = kua
        .toString()
        .split('')
        .reduce((sum, d) => sum + parseInt(d, 10), 0)
    } else {
      kua = Math.abs(kua)
    }
  }
  
  if (kua === 5) {
    return isMale ? 2 : 8
  }
  
  return kua
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

