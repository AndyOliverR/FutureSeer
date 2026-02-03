// Lucky essentials based on Driver (Mulank) and Conductor (Bhagyank)

interface LuckyEssentials {
  numbers: number[]
  colors: string[]
  dates: number[]
  years: number[]
  gemstone?: string
  rudraksh?: string
  bracelet?: string
  yantra?: string
  mantra?: string
}

// Lucky numbers map (Driver-based)
const LUCKY_NUMBERS: Record<number, number[]> = {
  1: [1, 5, 7],
  2: [2, 7],
  3: [3, 6, 9],
  4: [1, 7],
  5: [5],
  6: [1, 5, 7],
  7: [2, 7],
  8: [1, 4, 8],
  9: [3, 9],
}

// Lucky colors map (Driver-based)
const LUCKY_COLORS: Record<number, string[]> = {
  1: ['Red', 'Orange'],
  2: ['White', 'Cream', 'Light Blue'],
  3: ['Yellow', 'Orange', 'Gold'],
  4: ['Gray', 'Blue'],
  5: ['Green', 'Yellow'],
  6: ['Blue', 'White', 'Pink'],
  7: ['Violet', 'Purple', 'Green'],
  8: ['Black', 'Dark Blue', 'Gray'],
  9: ['Red', 'Orange', 'Pink'],
}

// Lucky dates (based on Driver)
function getLuckyDates(driver: number): number[] {
  const base = driver % 9 || 9
  const dates: number[] = []
  for (let i = base; i <= 30; i += 9) {
    dates.push(i)
  }
  return dates.slice(0, 10)
}

// Lucky years (milestones)
function getLuckyYears(birthYear: number, driver: number): number[] {
  const base = driver % 9 || 9
  const years: number[] = []
  let current = birthYear
  let count = 0
  while (count < 8 && current < birthYear + 80) {
    const age = current - birthYear
    if (age % base === 0 || age % 9 === 0) {
      years.push(age)
      count++
    }
    current++
  }
  return years
}

// Gemstones by Driver
const GEMSTONES: Record<number, string> = {
  1: 'Ruby',
  2: 'Pearl',
  3: 'Yellow Sapphire',
  4: 'Blue Sapphire',
  5: 'Emerald',
  6: 'Diamond',
  7: 'Cat\'s Eye',
  8: 'Blue Sapphire',
  9: 'Red Coral',
}

// Rudraksh by Driver
const RUDRAKSH: Record<number, string> = {
  1: '1 Mukhi',
  2: '2 Mukhi',
  3: '3 Mukhi',
  4: '4 Mukhi',
  5: '5 Mukhi',
  6: '6 Mukhi',
  7: '7 Mukhi',
  8: '8 Mukhi',
  9: '9 Mukhi',
}

// Bracelets by Driver
const BRACELETS: Record<number, string> = {
  1: 'Red Jasper',
  2: 'Rose Quartz',
  3: 'Citrine',
  4: 'Blue Lace Agate',
  5: 'Green Zade',
  6: 'Rose Quartz',
  7: 'Amethyst',
  8: 'Black Obsidian',
  9: 'Carnelian',
}

// Yantras by Driver
const YANTRAS: Record<number, string> = {
  1: 'Surya Yantra',
  2: 'Chandra Yantra',
  3: 'Guru Yantra',
  4: 'Rahu Yantra',
  5: 'Budh Yantra',
  6: 'Shukra Yantra',
  7: 'Ketu Yantra',
  8: 'Shani Yantra',
  9: 'Mangal Yantra',
}

// Mantras by Driver (short form)
const MANTRAS: Record<number, string> = {
  1: 'Om Suryaya Namaha',
  2: 'Om Som Somaya Namaha',
  3: 'Om Brihaspataye Namaha',
  4: 'Om Rahave Namaha',
  5: 'Om Budhaya Namaha',
  6: 'Om Shukraya Namaha',
  7: 'Om Ketave Namaha',
  8: 'Om Shanaye Namaha',
  9: 'Om Mangalaya Namaha',
}

export function getLuckyEssentials(
  driver: number | null,
  conductor: number | null,
  birthYear?: number
): LuckyEssentials {
  const d = driver || 1
  const c = conductor || 1
  
  return {
    numbers: LUCKY_NUMBERS[d] || [1, 5, 7],
    colors: LUCKY_COLORS[d] || ['White'],
    dates: getLuckyDates(d),
    years: birthYear ? getLuckyYears(birthYear, d) : [],
    gemstone: GEMSTONES[d],
    rudraksh: RUDRAKSH[d],
    bracelet: BRACELETS[d],
    yantra: YANTRAS[d],
    mantra: MANTRAS[d],
  }
}

