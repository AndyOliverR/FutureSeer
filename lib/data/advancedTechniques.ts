export interface AdvancedTechnique {
  slug: string;
  name: string;
  icon: string;
  description: string;
  overview: string;
  howItWorks: string;
  keyConcepts: string[];
  useCases: string[];
  whyItMatters: string;
}

export const ADVANCED_TECHNIQUES: Record<string, AdvancedTechnique> = {
  'uranian-astrology': {
    slug: 'uranian-astrology',
    name: 'Uranian Astrology',
    icon: '⚡',
    description: 'Hamburg School midpoint astrology',
    overview: 'Uranian Astrology, also known as the Hamburg School, is a precision-focused astrological system developed in the early 20th century by Alfred Witte and later refined by Reinhold Ebertin. This system emphasizes midpoints and symmetrical aspects to reveal hidden patterns and precise timing in astrological events.',
    howItWorks: 'Uranian Astrology calculates the midpoint between any two planets, creating a third harmonic point that reveals deeper insights. The system uses a 90-degree dial where all planets and points are projected, allowing for precise timing predictions through planetary pictures and transits. Key calculations include the use of hypothetical planets (Cupido, Hades, Zeus, Kronos, Apollon, Admetos, Vulcanus, and Poseidon) that represent archetypal forces.',
    keyConcepts: [
      'Midpoints: The halfway point between two planets reveals hidden dynamics',
      '90-Degree Dial: All planetary positions projected onto a single dial for analysis',
      'Planetary Pictures: Specific midpoint combinations that indicate events or traits',
      'Hypothetical Planets: Eight additional points representing archetypal forces',
      'Symmetrical Aspects: Patterns that create symmetrical relationships in the chart',
      'Solar Arc Directions: Precise timing method using solar arc progressions'
    ],
    useCases: [
      'Precise event timing and predictions',
      'Relationship compatibility analysis',
      'Career and opportunity timing',
      'Health and medical astrology',
      'Financial market predictions',
      'Identifying hidden talents and potentials'
    ],
    whyItMatters: 'Uranian Astrology offers unparalleled precision in timing predictions and reveals patterns that traditional astrology might miss. Its mathematical approach appeals to those seeking accuracy and scientific validation, while its midpoint system uncovers deeper psychological and karmic layers in the birth chart.'
  },
  'cosmobiology': {
    slug: 'cosmobiology',
    name: 'Cosmobiology',
    icon: '🔬',
    description: 'Ebertin system of midpoint astrology',
    overview: 'Cosmobiology, developed by Reinhold Ebertin, is a refined form of Uranian Astrology that focuses on empirical observation and practical application. Ebertin removed hypothetical planets and simplified the system to focus on observable planetary influences and their effects on human behavior and events.',
    howItWorks: 'Cosmobiology uses the 90-degree dial system but focuses on real planetary midpoints rather than hypothetical points. Ebertin\'s system emphasizes the combination of planetary influences at midpoints, creating "planetary pictures" that correlate with specific life events, personality traits, or health conditions. The system uses solar arc directions for precise timing and emphasizes empirical validation through observation.',
    keyConcepts: [
      'Midpoint Structures: Combinations of planetary influences at key points',
      'Planetary Pictures: Specific midpoint combinations with known meanings',
      'Solar Arc Directions: Progressed chart using solar arc method for timing',
      'Empirical Validation: Emphasis on observable correlations',
      'Zero Aries Point: Reference point for all calculations',
      'Dial Interpretation: Reading planetary patterns on the 90-degree dial'
    ],
    useCases: [
      'Medical astrology and health predictions',
      'Career timing and professional development',
      'Relationship dynamics and compatibility',
      'Event timing and prediction',
      'Psychological analysis and character assessment',
      'Financial and investment astrology'
    ],
    whyItMatters: 'Cosmobiology bridges the gap between traditional astrology and scientific observation, offering a practical system that emphasizes measurable results. It\'s particularly valuable for those seeking precise timing and clear, actionable insights without the complexity of hypothetical planets.'
  },
  'evolutionary-astrology': {
    slug: 'evolutionary-astrology',
    name: 'Evolutionary Astrology',
    icon: '🦋',
    description: 'Soul evolution and karmic patterns',
    overview: 'Evolutionary Astrology, developed by Steven Forrest and Jeffrey Wolf Green, views the birth chart as a map of the soul\'s evolutionary journey across lifetimes. This system reveals karmic patterns, soul intentions, and the path toward spiritual growth and evolution.',
    howItWorks: 'Evolutionary Astrology interprets the chart through the lens of past-life karma and soul evolution. Key elements include the lunar nodes (revealing past-life patterns and future direction), Pluto\'s placement (indicating karmic themes), and planetary positions that show what the soul is here to learn and evolve. The system emphasizes choice, growth, and the evolution of consciousness rather than fixed destiny.',
    keyConcepts: [
      'Lunar Nodes: Past-life patterns (South Node) and evolutionary direction (North Node)',
      'Karmic Themes: Patterns from past lives needing resolution',
      'Soul Intentions: What the soul is here to learn and evolve',
      'Pluto\'s Significance: Revealing deep karmic and evolutionary themes',
      'Choice and Free Will: Emphasizing personal responsibility',
      'Evolutionary Pressures: Challenges that promote growth'
    ],
    useCases: [
      'Understanding karmic patterns and past-life influences',
      'Discovering soul purpose and evolutionary direction',
      'Relationship karma and soul contracts',
      'Life purpose and career alignment',
      'Spiritual growth and transformation',
      'Healing ancestral and karmic patterns'
    ],
    whyItMatters: 'Evolutionary Astrology provides a framework for understanding your soul\'s journey across lifetimes, revealing karmic patterns and the path toward evolution. It\'s perfect for those seeking to understand the deeper purpose behind life challenges and relationships.'
  }
};

export function getAdvancedTechnique(slug: string): AdvancedTechnique | undefined {
  return ADVANCED_TECHNIQUES[slug];
}

export function getAllAdvancedTechniques(): AdvancedTechnique[] {
  return Object.values(ADVANCED_TECHNIQUES);
}

