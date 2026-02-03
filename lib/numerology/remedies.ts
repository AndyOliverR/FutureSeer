export const loShuRemedies: Record<number, string[]> = {
  1: ['Practice daily affirmations of initiative', 'Lead a small project or habit streak'],
  2: ['Cultivate partnerships; weekly check-ins', 'Moon journaling on Mondays'],
  3: ['Creative expression: 10-min free writing', 'Wear vibrant colors on Thursdays'],
  4: ['Structured routines; declutter workspace', 'Square talisman or grid on desk'],
  5: [
    'Wear a two-toned wristwatch (gold & silver)',
    'Green dial, round with Roman numerals, with date display',
    'Budh mantra: “Om Braam Breem Broum Sah Budhaya Namah” 108× on Wednesdays',
    'Communication discipline: daily journaling + 30-min walking in fresh air',
    'Limit stimulants and keep a consistent sleep/wake schedule for steadiness',
  ],
  6: ['Serve family/community weekly', 'Keep fresh flowers at home'],
  7: [
    'Green leafy vegetables weekly; hydrate and simplify diet',
    'Deep-green accents; time in nature and near clean water',
    'Ketu mantra: “Om Kem Ketave Namah” 108× on Tuesdays/Saturdays',
    'Solitude practice: 20‑min meditation + digital detox blocks',
  ],
  8: ['Budget review every Saturday', 'Metallic accents (gold) for authority'],
  9: ['Weekly act of compassion', 'Donate unused items'],
}

export function groupedRemedies(numbers: number[]): Record<number, string[]> {
  const map: Record<number, string[]> = {}
  numbers.forEach((n) => {
    const items = loShuRemedies[n]
    if (items && items.length) map[n] = items
  })
  return map
}

