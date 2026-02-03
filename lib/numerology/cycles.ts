// Challenge cycles calculation

interface ChallengeCycle {
  range: string
  number: number
  attributes: string
  focus: string
}

function reduceChallengeYear(yearDigits: number): number {
  let num = yearDigits
  while (num > 9) {
    num = num.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0)
  }
  return num
}

export function calcChallengeCycles(birthDateISO: string | undefined): ChallengeCycle[] {
  if (!birthDateISO) return []
  
  const [y, m, d] = birthDateISO.split('-').map(Number)
  if (!y || !m || !d) return []
  
  const birthMonthDigits = m.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0)
  const birthDayDigits = d.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0)
  const birthYearDigits = y.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0)
  
  const cycle1 = reduceChallengeYear(Math.abs(birthMonthDigits - birthDayDigits))
  const cycle2 = reduceChallengeYear(Math.abs(birthDayDigits - birthYearDigits))
  const cycle3 = reduceChallengeYear(Math.abs(cycle1 - cycle2))
  const cycle4 = reduceChallengeYear(birthMonthDigits + birthDayDigits + birthYearDigits)
  
  const cycles: ChallengeCycle[] = [
    {
      range: '0-34',
      number: cycle1,
      attributes: 'Early life challenges shape your character and ambitions.',
      focus: cycle1 === 8 ? 'Material success through discipline' : cycle1 === 9 ? 'Universal service and compassion' : 'Foundation building',
    },
    {
      range: '35-43',
      number: cycle2,
      attributes: 'Mid-life period focuses on relationships and stability.',
      focus: cycle2 === 8 ? 'Financial mastery and authority' : cycle2 === 9 ? 'Humanitarian ideals' : 'Personal growth',
    },
    {
      range: '44-52',
      number: cycle3,
      attributes: 'Mature phase emphasizes wisdom and legacy building.',
      focus: cycle3 === 8 ? 'Sustained success through relationships' : cycle3 === 9 ? 'Spiritual fulfillment' : 'Harmony and balance',
    },
    {
      range: '53+',
      number: cycle4,
      attributes: 'Later years bring versatility, travel, and new experiences.',
      focus: cycle4 === 5 ? 'Adventure and adaptability' : 'Continuing progress with steady work',
    },
  ]
  
  return cycles
}

