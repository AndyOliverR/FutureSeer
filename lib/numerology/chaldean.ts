// Chaldean Numerology engine (MVP)
// Uses current full legal name (with middle names) and birth date

export type ChaldeanNumbers = {
  lifePath: number
  destiny: number // also known as Name/Expression in some systems
  soulUrge: number
  personality: number
  birthday: number
  maturity: number
}

export type ChaldeanBreakdown = {
  mappingUsed: 'chaldean'
  nameNormalized: string
  vowelLetters: string
  consonantLetters: string
  steps: Record<string, string>
}

export type ChaldeanResult = {
  numbers: ChaldeanNumbers
  breakdown: ChaldeanBreakdown
}

// Chaldean letter to number mapping (1–8, 9 reserved/omitted)
// Reference-common mapping. Y treated contextually; here counted as consonant by default.
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

function normalizeName(name: string): string {
  return (name || '')
    .toUpperCase()
    .normalize('NFKD')
    .replace(/[^A-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sumLetters(text: string): number {
  let sum = 0
  for (const ch of text) {
    const val = CHALDEAN_MAP[ch]
    if (val) sum += val
  }
  return sum
}

function reduceNumber(value: number): number {
  // Preserve master numbers 11 and 22
  if (value === 11 || value === 22) return value
  while (value > 9) {
    let s = 0
    for (const d of String(value)) s += Number(d)
    value = s
    if (value === 11 || value === 22) break
  }
  return value
}

function calcLifePath(birthDate: string): number {
  const d = new Date(birthDate)
  if (isNaN(d.getTime())) return 0
  const parts = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
  const partReduced = parts.map(n => reduceNumber(n)).reduce((a, b) => a + b, 0)
  return reduceNumber(partReduced)
}

export function computeChaldeanProfile(fullName: string, birthDate: string): ChaldeanResult {
  const name = normalizeName(fullName)
  const lifePath = calcLifePath(birthDate)

  const letters = name.replace(/\s/g, '')
  const vowels = [...letters].filter(ch => VOWELS.has(ch)).join('')
  const consonants = [...letters].filter(ch => !VOWELS.has(ch)).join('')

  const destinySum = sumLetters(letters)
  const soulSum = sumLetters(vowels)
  const personalitySum = sumLetters(consonants)

  const destiny = reduceNumber(destinySum)
  const soulUrge = reduceNumber(soulSum)
  const personality = reduceNumber(personalitySum)
  const birthday = reduceNumber(new Date(birthDate).getDate())
  const maturity = reduceNumber(lifePath + destiny)

  const steps: Record<string, string> = {
    lifePath: `Reduce (year ${new Date(birthDate).getFullYear()}) + (month ${new Date(birthDate).getMonth() + 1}) + (day ${new Date(birthDate).getDate()}) → ${lifePath}`,
    destiny: `${letters} → sum ${destinySum} → ${destiny}`,
    soulUrge: `${vowels || '—'} → sum ${soulSum} → ${soulUrge}`,
    personality: `${consonants || '—'} → sum ${personalitySum} → ${personality}`,
    birthday: `Day ${new Date(birthDate).getDate()} → ${birthday}`,
    maturity: `Life Path ${lifePath} + Destiny ${destiny} → ${maturity}`
  }

  return {
    numbers: { lifePath, destiny, soulUrge, personality, birthday, maturity },
    breakdown: {
      mappingUsed: 'chaldean',
      nameNormalized: name,
      vowelLetters: vowels,
      consonantLetters: consonants,
      steps
    }
  }
}

export const ChaldeanInterpretations: Record<number, string> = {
  1: 'You stride forward with the fire of initiative. Lead with clarity and purpose.',
  2: 'You are the quiet bridge—harmonizer, listener, and peacemaker.',
  3: 'Your words are spells—create, express, and uplift.',
  4: 'Build foundations. Discipline, order, and steady progress are your allies.',
  5: 'Flow with change. Adventure and versatility shape your destiny.',
  6: 'Serve with heart. Home, care, and responsibility are sacred to you.',
  7: 'Seek the hidden pattern. Silence and study reveal the truth.',
  8: 'Command results. Power, stewardship, and legacy are your path.',
  9: 'Offer compassion. Endings become offerings to the world.',
  11: 'Illuminate. You are a tuning fork for inspiration and subtle guidance.',
  22: 'Manifest the vision. Architecture of the soul meets the world of form.'
}


