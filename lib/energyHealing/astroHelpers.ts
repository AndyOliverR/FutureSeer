// Astrological Helpers for Energy Healing
// Maps planetary influences to chakras and energy systems

/**
 * Planetary rulerships over chakras
 */
export const PLANETARY_CHAKRA_MAPPING: Record<string, string[]> = {
  'Saturn': ['root'],
  'Venus': ['sacral', 'heart'],
  'Sun': ['solarPlexus'],
  'Moon': ['heart'], // Emotional aspect
  'Mercury': ['throat'],
  'Jupiter': ['thirdEye'],
  'Neptune': ['thirdEye', 'crown'],
  'Uranus': ['crown'],
};

/**
 * Get chakras influenced by a planet
 */
export function getChakrasForPlanet(planet: string): string[] {
  return PLANETARY_CHAKRA_MAPPING[planet] || [];
}

/**
 * Get planets influencing a chakra
 */
export function getPlanetsForChakra(chakra: string): string[] {
  const planets: string[] = [];
  for (const [planet, chakras] of Object.entries(PLANETARY_CHAKRA_MAPPING)) {
    if (chakras.includes(chakra)) {
      planets.push(planet);
    }
  }
  return planets;
}

/**
 * Crystal associations with astrological signs
 */
export const SIGN_CRYSTAL_MAPPING: Record<string, string[]> = {
  'Aries': ['Red Jasper', 'Bloodstone', 'Carnelian'],
  'Taurus': ['Rose Quartz', 'Emerald', 'Lapis Lazuli'],
  'Gemini': ['Agate', 'Citrine', 'Tiger Eye'],
  'Cancer': ['Moonstone', 'Pearl', 'Opal'],
  'Leo': ['Amber', 'Citrine', 'Sunstone'],
  'Virgo': ['Peridot', 'Amazonite', 'Obsidian'],
  'Libra': ['Rose Quartz', 'Lapis Lazuli', 'Opal'],
  'Scorpio': ['Obsidian', 'Garnet', 'Malachite'],
  'Sagittarius': ['Turquoise', 'Topaz', 'Amethyst'],
  'Capricorn': ['Garnet', 'Black Onyx', 'Smoky Quartz'],
  'Aquarius': ['Amethyst', 'Aquamarine', 'Clear Quartz'],
  'Pisces': ['Amethyst', 'Aquamarine', 'Moonstone'],
};

/**
 * Get crystals for astrological sign
 */
export function getCrystalsForSign(sign: string): string[] {
  return SIGN_CRYSTAL_MAPPING[sign] || [];
}

/**
 * Birthstone by month
 */
export const BIRTHSTONE_MAPPING: Record<number, string[]> = {
  1: ['Garnet'],
  2: ['Amethyst'],
  3: ['Aquamarine', 'Bloodstone'],
  4: ['Diamond'],
  5: ['Emerald'],
  6: ['Pearl', 'Moonstone', 'Alexandrite'],
  7: ['Ruby'],
  8: ['Peridot', 'Spinel'],
  9: ['Sapphire'],
  10: ['Opal', 'Tourmaline'],
  11: ['Topaz', 'Citrine'],
  12: ['Turquoise', 'Zircon', 'Tanzanite'],
};

/**
 * Get birthstone for month
 */
export function getBirthstone(month: number): string[] {
  return BIRTHSTONE_MAPPING[month] || [];
}

