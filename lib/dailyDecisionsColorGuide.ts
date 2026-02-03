// Daily Decisions Color Guide – static data for clothes, accessories, and personalization

export interface DailyColorGuideRow {
  day: string;
  rulingPlanet: string;
  primaryColors: string;
  beneficialActions: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
}

export const DAILY_COLOR_GUIDE: DailyColorGuideRow[] = [
  { day: 'Sunday', rulingPlanet: 'Sun', primaryColors: 'Orange, Red, Yellow', beneficialActions: 'Planning, setting intentions, outdoor activity', weekday: 0 },
  { day: 'Monday', rulingPlanet: 'Moon', primaryColors: 'White, Silver, Cream', beneficialActions: 'Meditation, self-care, calming tasks', weekday: 1 },
  { day: 'Tuesday', rulingPlanet: 'Mars', primaryColors: 'Red, Maroon, Coral', beneficialActions: 'Bold decisions, physical exercise, action', weekday: 2 },
  { day: 'Wednesday', rulingPlanet: 'Mercury', primaryColors: 'Green, Emerald', beneficialActions: 'Meetings, communication, learning', weekday: 3 },
  { day: 'Thursday', rulingPlanet: 'Jupiter', primaryColors: 'Yellow, Gold, Saffron', beneficialActions: 'Starting a business, seeking wisdom, gratitude', weekday: 4 },
  { day: 'Friday', rulingPlanet: 'Venus', primaryColors: 'Pink, White, Pastels', beneficialActions: 'Creative arts, romance, luxury shopping', weekday: 5 },
  { day: 'Saturday', rulingPlanet: 'Saturn', primaryColors: 'Black, Navy Blue, Grey', beneficialActions: 'Chores, discipline, acts of service', weekday: 6 },
];

export const SHOE_COLOR_BY_DAY: Record<number, string> = {
  0: 'Orange, red, or yellow (Sun)',
  1: 'White, silver, or cream (Moon)',
  2: 'Red, maroon, or coral (Mars)',
  3: 'Green or emerald (Mercury)',
  4: 'Yellow, gold, or saffron (Jupiter)',
  5: 'Pink, white, or pastels (Venus)',
  6: 'Black, navy blue, or grey (Saturn)',
};

export const AVOIDANCE_LIST: { text: string }[] = [
  { text: 'Avoid wearing black on Sunday (dulls solar energy).' },
  { text: 'Avoid red on Monday (too aggressive for the Moon).' },
  { text: 'Postpone major negotiations or travel on Tuesday when possible.' },
];

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

export const SIGN_ELEMENT: Record<string, Element> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

export const ELEMENT_PALETTE: Record<Element, string> = {
  Fire: 'reds, oranges, bold warm tones',
  Earth: 'greens, beiges, browns, natural tones',
  Air: 'light blues, lavenders, soft neutrals',
  Water: 'blues, teals, sea greens, soft pastels',
};

export const RISING_STYLE_HINT: Record<string, string> = {
  Aries: 'Structured, sporty cuts; bold, confident lines.',
  Taurus: 'Comfortable, quality fabrics; classic, grounded silhouettes.',
  Gemini: 'Versatile, layered looks; mix-and-match, communicative style.',
  Cancer: 'Soft, nurturing fabrics; cozy, intuitive aesthetics.',
  Leo: 'Statement pieces, luxury; dramatic, regal cuts.',
  Virgo: 'Tailored, refined; clean lines, practical elegance.',
  Libra: 'Balanced, harmonious; elegant, relationship-oriented style.',
  Scorpio: 'Mysterious, intense; deep colors, transformative pieces.',
  Sagittarius: 'Adventurous, eclectic; global influences, bold patterns.',
  Capricorn: 'Professional, timeless; structured, ambitious dressing.',
  Aquarius: 'Unique, forward-looking; unconventional, innovative style.',
  Pisces: 'Flowing, dreamy; soft textures, imaginative aesthetics.',
};

export const VENUS_TEXTURE_HINT: Record<string, string> = {
  Aries: 'Bold textures, leather, sporty fabrics; confidence-building materials.',
  Taurus: 'Silk, cashmere, cotton; tactile, luxurious textures.',
  Gemini: 'Light, breathable fabrics; versatile, communicative textures.',
  Cancer: 'Soft knits, velvet, comfortable layers; nurturing materials.',
  Leo: 'Bold prints, luxury fabrics, metallics; glamorous textures.',
  Virgo: 'Crisp cotton, linen, refined weaves; clean, precise textures.',
  Libra: 'Delicate lace, silk, balanced fabrics; harmonious textures.',
  Scorpio: 'Rich velvets, deep weaves; intense, transformative textures.',
  Sagittarius: 'Natural fibres, travel-friendly fabrics; adventurous textures.',
  Capricorn: 'Wool, structured fabrics; professional, enduring textures.',
  Aquarius: 'Innovative materials, tech fabrics; unique, futuristic textures.',
  Pisces: 'Flowing chiffon, soft jersey; dreamy, imaginative textures.',
};

/**
 * Get weekday (0–6) from ISO date string YYYY-MM-DD.
 */
export function getWeekdayFromDate(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDay();
}

/**
 * Get color guide row for a given weekday (0 = Sunday, 6 = Saturday).
 */
export function getColorGuideForWeekday(weekday: number): DailyColorGuideRow {
  const row = DAILY_COLOR_GUIDE.find((r) => r.weekday === weekday);
  return row ?? DAILY_COLOR_GUIDE[0];
}

// -----------------------------------------------------------------------------
// Nail-cutting (Vedic) guide
// -----------------------------------------------------------------------------

export const NAILS_VEDIC_GUIDE = {
  bestDays: ['Wednesday', 'Friday', 'Monday', 'Thursday'] as const,
  avoidDays: ['Saturday', 'Tuesday', 'Sunday'] as const,
  bestTiming: 'Morning or early afternoon.',
  avoidAfterSunset: true as const,
  avoidAfterSunsetReason: 'Believed to invite tamasic or negative energies; may cause financial or personal harm.',
  disposalTip: 'Do not throw nail clippings inside the house, as this is believed to spread negative energy.',
  keyTakeaways: [
    'Wednesday and Friday are the most commonly cited auspicious days for grooming.',
    'Daytime only — avoid cutting nails after sunset.',
  ],
  disclaimer:
    'These are based on traditional astrology and cultural beliefs, which may not be supported by scientific evidence.',
} as const;
