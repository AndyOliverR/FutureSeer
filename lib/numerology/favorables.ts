// Favorables: days, alphabets, direction, deity, mantra based on Driver

interface Favorables {
  days: string[]
  alphabets: string[]
  direction: string
  deity: string
  mantra: string
}

const FAVORABLE_DAYS: Record<number, string[]> = {
  1: ['Sunday', 'Tuesday', 'Thursday'],
  2: ['Monday', 'Friday'],
  3: ['Thursday'],
  4: ['Saturday'],
  5: ['Wednesday'],
  6: ['Friday'],
  7: ['Tuesday', 'Saturday'],
  8: ['Saturday'],
  9: ['Tuesday'],
}

const FAVORABLE_ALPHABETS: Record<number, string[]> = {
  1: ['A', 'I', 'J', 'Q', 'Y'],
  2: ['B', 'K', 'R'],
  3: ['C', 'G', 'L', 'S'],
  4: ['D', 'M', 'T'],
  5: ['E', 'H', 'N', 'X'],
  6: ['U', 'V', 'W'],
  7: ['O', 'Z'],
  8: ['F', 'P'],
  9: ['A', 'E', 'I', 'O', 'U'],
}

const FAVORABLE_DIRECTIONS: Record<number, string> = {
  1: 'East',
  2: 'Northwest',
  3: 'Northeast',
  4: 'South',
  5: 'North',
  6: 'Southeast',
  7: 'West',
  8: 'Southwest',
  9: 'South',
}

const DEITIES: Record<number, string> = {
  1: 'Lord Surya (Sun)',
  2: 'Lord Chandra (Moon)',
  3: 'Lord Brihaspati (Jupiter)',
  4: 'Lord Rahu',
  5: 'Lord Budh (Mercury)',
  6: 'Lord Shukra (Venus)',
  7: 'Lord Ketu',
  8: 'Lord Shani (Saturn)',
  9: 'Lord Mangal (Mars)',
}

const DETAILED_MANTRAS: Record<number, string> = {
  1: 'Om Suryaya Namaha',
  2: 'Om Som Somaya Namaha',
  3: 'Om Brihaspataye Namaha',
  4: 'Om Rahave Namaha',
  5: 'Om Budhaya Namaha',
  6: 'Om Dram Dreem Droum Sah Shukraya Namaha',
  7: 'Om Ketave Namaha',
  8: 'Om Sham Shanaye Namaha',
  9: 'Om Mangalaya Namaha',
}

export function getFavorables(driver: number | null): Favorables {
  const d = driver || 1
  
  return {
    days: FAVORABLE_DAYS[d] || ['Monday'],
    alphabets: FAVORABLE_ALPHABETS[d] || ['A'],
    direction: FAVORABLE_DIRECTIONS[d] || 'East',
    deity: DEITIES[d] || 'Universal',
    mantra: DETAILED_MANTRAS[d] || 'Om Namah Shivaya',
  }
}

