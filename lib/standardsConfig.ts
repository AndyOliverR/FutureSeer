/**
 * Standards Configuration for All FutureSeer Tools
 * Maps each tool category and individual tools to their validation standards,
 * traditional references, and accreditation claims.
 */

export interface CategoryStandard {
  standard: string;
  validation: string;
  traditionalRef: string;
  precision?: string;
  tools: string[];
}

export interface StandardsConfig {
  categories: Record<string, CategoryStandard>;
  global: {
    swissEphemeris: string;
    astronomicalAccuracy: string;
    nasaValidation: string;
    traditionalMethods: string;
    totalTools: number;
  };
}

export const STANDARDS_CONFIG: StandardsConfig = {
  categories: {
    'Astrology': {
      standard: 'Swiss Ephemeris (NASA JPL Validated)',
      validation: 'Cross-validated with NASA Horizons & Astronomical Almanac',
      traditionalRef: 'Classical astrological texts (Brihat Parashara Hora Shastra, Tetrabiblos, Almagest)',
      precision: '0.001 arcseconds',
      tools: [
        'vedic-astrology',
        'western-astrology',
        'hellenistic-astrology',
        'kp-astrology',
        'horary-astrology',
        'medical-astrology',
        'synastry',
        'uranian-astrology',
        'cosmobiology',
        'esoteric-astrology',
        'kabbalistic-astrology',
        'hermetic-astrology',
        'astrocartography',
        'solar-return',
        'lunar-return',
        'progressions',
        'transits',
        'composite-charts',
        'davison-charts',
        'psychological-astrology',
        'evolutionary-astrology',
        'shamanic-astrology',
        'tibetan-astrology',
        'mayan-astrology',
        'celtic-astrology',
        'thirteen-signs-zodiac',
        'quantum-astrology',
        'kerykeion'
        // Note: iztro is listed under Chinese category (matches toolManager category)
      ]
    },
    'Numerology': {
      standard: 'Traditional Methods + Mathematical Precision',
      validation: 'Historical calculation methods with cross-validation',
      traditionalRef: 'Ancient Babylonian/Chaldean methods & Hebrew Kabbalistic traditions (Tree of Life)',
      tools: [
        'numerology',
        'kabbalistic-numerology',
        'name-analysis',
        'angel-numbers'
      ]
    },
    'Divination': {
      standard: 'Time-Tested Methods + Symbolic Interpretation',
      validation: 'Traditional divination systems preserved through centuries',
      traditionalRef: 'Classical divination methods: Tarot (Rider-Waite, Thoth, Marseille), Runes (Elder Futhark), I Ching (Zhou Yi), Geomancy (Traditional figures), Ogham (Celtic tree alphabet), Tasseography (Tea leaf reading), Bone throwing (Traditional African divination)',
      tools: [
        'tarot',
        'runes',
        'lenormand',
        'pendulum',
        'geomancy',
        'i-ching',
        'ogham',
        'sortilege',
        'tea-leaf-reading',
        'bone-throwing'
      ]
    },
    'Reading': {
      standard: 'Classical Analysis + Modern AI Enhancement',
      validation: 'Traditional reading methods enhanced with AI interpretation',
      traditionalRef: 'Palmistry (Classical Indian & Western), Face Reading (Traditional Chinese & Western physiognomy), Dream Symbols (Jungian & traditional symbolism)',
      tools: [
        'palmistry',
        'face-reading',
        'dream-symbols',
        'chinese-face-reading'
      ]
    },
    'Chinese': {
      standard: 'Traditional Chinese Methods',
      validation: 'Classical Chinese systems with documented historical accuracy',
      traditionalRef: 'BaZi (Four Pillars of Destiny), Feng Shui (Classical Compass School), Zi Wei Dou Shu (Purple Star Astrology - Imperial methods)',
      tools: [
        'bazi',
        'ziwei-dou-shu',
        'feng-shui',
      ]
    },
    'Indian': {
      standard: 'Classical Indian Traditions',
      validation: 'Traditional Indian systems based on ancient texts',
      traditionalRef: 'Vastu Shastra (Shilpa Shastras - Classical architectural harmony principles)',
      tools: [
        'vastu'
      ]
    },
    'Energy': {
      standard: 'Holistic Energy Practices',
      validation: 'Traditional holistic practices with documented methodologies',
      traditionalRef: 'Chakra system (traditional Indian), Aura reading (theosophical traditions), Reiki (Usui lineage), Crystal healing (traditional gemstone lore)',
      tools: [
        'energy-healing',
        'chakra-analysis',
        'aura-reading',
        'reiki',
        'crystal-healing'
      ]
    },
    'Analysis': {
      standard: 'Synthesized Systems + Modern Research',
      validation: 'Documented methodologies combining multiple traditions',
      traditionalRef: 'Human Design (synthesized system with documented methods), Akashic Records (theosophical tradition)',
      tools: [
        'human-design',
        'akashic-records'
      ]
    }
  },
  global: {
    swissEphemeris: 'Swiss Ephemeris (NASA JPL DE431)',
    astronomicalAccuracy: 'Precision: 0.001 arcseconds',
    nasaValidation: 'Cross-validated with NASA Horizons system',
    traditionalMethods: '60+ Tools Based on Time-Tested Traditions',
    totalTools: 60
  }
};

/**
 * Get standards for a specific category
 */
export function getCategoryStandards(category: string): CategoryStandard | undefined {
  return STANDARDS_CONFIG.categories[category];
}

/**
 * Get all categories with their standards
 */
export function getAllCategoryStandards(): Record<string, CategoryStandard> {
  return STANDARDS_CONFIG.categories;
}

/**
 * Get global standards
 */
export function getGlobalStandards() {
  return STANDARDS_CONFIG.global;
}

/**
 * Check if a tool slug belongs to a category with specific standards
 */
export function getToolStandards(toolSlug: string): CategoryStandard | undefined {
  for (const [category, standard] of Object.entries(STANDARDS_CONFIG.categories)) {
    if (standard.tools.includes(toolSlug)) {
      return standard;
    }
  }
  return undefined;
}

/**
 * Get all tools for a category
 */
export function getToolsForCategory(category: string): string[] {
  const categoryStandard = STANDARDS_CONFIG.categories[category];
  return categoryStandard ? categoryStandard.tools : [];
}