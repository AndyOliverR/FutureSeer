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
  'esoteric-astrology': {
    slug: 'esoteric-astrology',
    name: 'Esoteric Astrology',
    icon: '🌟',
    description: 'Spiritual development and soul purpose',
    overview: 'Esoteric Astrology, based on the teachings of Alice A. Bailey and the Tibetan Master Djwhal Khul, focuses on the soul\'s evolutionary journey rather than personality traits. This system reveals the spiritual purpose behind the birth chart and the path toward higher consciousness.',
    howItWorks: 'In Esoteric Astrology, planets, signs, and houses have both exoteric (personality) and esoteric (soul) meanings. The system examines the chart from the perspective of the soul\'s evolution, looking at how planetary energies serve spiritual growth. Key elements include the esoteric ruler of signs (different from traditional rulers), the Dweller on the Threshold, and the Angel of the Presence, representing shadow and light aspects of the soul.',
    keyConcepts: [
      'Soul Purpose: The spiritual mission revealed through the chart',
      'Esoteric Rulers: Planetary rulers that guide soul evolution',
      'The Dweller: Shadow aspects needing transformation',
      'The Angel: Light aspects representing spiritual potential',
      'Seven Rays: Universal energies influencing spiritual development',
      'Initiation: Stages of spiritual awakening and growth'
    ],
    useCases: [
      'Understanding soul purpose and spiritual mission',
      'Identifying karmic lessons and evolutionary tasks',
      'Spiritual growth and transformation guidance',
      'Shadow work and inner healing',
      'Meditation and spiritual practice timing',
      'Soul-level relationship compatibility'
    ],
    whyItMatters: 'Esoteric Astrology provides a framework for understanding your spiritual journey and soul evolution. It helps you see beyond personality traits to discover your deeper purpose and the path toward greater consciousness and service to humanity.'
  },
  'kabbalistic-astrology': {
    slug: 'kabbalistic-astrology',
    name: 'Kabbalistic Astrology',
    icon: '✡️',
    description: 'Tree of Life correspondences',
    overview: 'Kabbalistic Astrology combines Western astrology with the mystical teachings of the Kabbalah, specifically the Tree of Life. Each planet, sign, and house corresponds to specific Sephiroth (divine emanations) on the Tree, revealing the spiritual and mystical dimensions of astrological influences.',
    howItWorks: 'In this system, the 12 zodiac signs correspond to the 12 paths on the Tree of Life, while the planets connect to the 10 Sephiroth. The system maps astrological influences onto the Tree\'s structure, revealing how cosmic energies flow through divine consciousness. Kabbalistic correspondences also include Hebrew letters, Tarot cards, and color associations, creating a rich symbolic language for interpretation.',
    keyConcepts: [
      'Tree of Life: The 10 Sephiroth representing divine emanations',
      'Planetary Sephiroth: Each planet corresponds to a specific Sephirah',
      'Zodiac Paths: 12 paths connecting the Sephiroth',
      'Hebrew Letters: Correspondence between letters and astrological symbols',
      'Tarot Correspondences: Tarot cards linked to planetary and zodiac energies',
      'Color and Element Associations: Vibrational qualities of each sphere'
    ],
    useCases: [
      'Deep spiritual and mystical understanding',
      'Kabbalistic pathworking and meditation',
      'Understanding divine purpose and destiny',
      'Integration of astrology with Jewish mysticism',
      'Symbolic interpretation and archetypal work',
      'Ceremonial magic and ritual timing'
    ],
    whyItMatters: 'Kabbalistic Astrology bridges astrology and mystical tradition, offering a framework for understanding how cosmic forces operate through divine consciousness. It\'s invaluable for those interested in mystical work, spiritual development, and the deeper esoteric meanings behind astrological influences.'
  },
  'hermetic-astrology': {
    slug: 'hermetic-astrology',
    name: 'Hermetic Astrology',
    icon: '🔮',
    description: 'Hermetic principles and correspondences',
    overview: 'Hermetic Astrology applies the principles of Hermeticism—"As above, so below"—to astrological interpretation. This system emphasizes the correspondence between macrocosm (universe) and microcosm (individual), revealing how planetary influences reflect universal laws and principles.',
    howItWorks: 'Hermetic Astrology integrates the seven Hermetic principles (Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause and Effect, Gender) with astrological interpretation. The system views the chart as a map of consciousness, where planetary positions reflect the operation of universal laws. Hermetic correspondences include elements, directions, colors, metals, and other symbolic associations that deepen interpretation.',
    keyConcepts: [
      'Hermetic Principles: Seven universal laws governing reality',
      'Correspondence: "As above, so below" - macrocosm and microcosm',
      'Mentalism: The universe is mental - consciousness creates reality',
      'Vibration: Everything vibrates at specific frequencies',
      'Polarity: Everything has its opposite',
      'Alchemical Transformation: The process of spiritual evolution'
    ],
    useCases: [
      'Understanding universal laws and principles',
      'Alchemical transformation and spiritual work',
      'Integrating astrology with Hermetic philosophy',
      'Manifestation and conscious creation',
      'Magical and ritual work',
      'Deep philosophical and metaphysical exploration'
    ],
    whyItMatters: 'Hermetic Astrology provides a philosophical framework for understanding how astrological influences operate according to universal laws. It\'s perfect for those seeking to integrate astrology with Hermetic philosophy and understand the deeper principles governing cosmic and personal evolution.'
  },
  'psychological-astrology': {
    slug: 'psychological-astrology',
    name: 'Psychological Astrology',
    icon: '🧠',
    description: 'Jungian psychological astrology',
    overview: 'Psychological Astrology, pioneered by thinkers like Dane Rudhyar and Carl Jung, views the birth chart as a map of the psyche. This approach emphasizes psychological development, archetypal patterns, and the integration of conscious and unconscious aspects of the personality.',
    howItWorks: 'Psychological Astrology interprets planetary positions, aspects, and houses through the lens of depth psychology. The chart reveals archetypal patterns, complexes, and developmental needs. Emphasis is placed on understanding the shadow (unconscious aspects), the anima/animus (contrasexual elements), and the individuation process (becoming whole). The system focuses on growth, healing, and psychological integration rather than fatalistic prediction.',
    keyConcepts: [
      'Archetypes: Universal patterns of the collective unconscious',
      'The Shadow: Unconscious aspects needing integration',
      'Anima/Animus: Inner contrasexual aspects',
      'Individuation: The process of becoming whole',
      'Complexes: Patterns of emotional charge',
      'Symbolic Interpretation: Reading the chart as a symbolic language'
    ],
    useCases: [
      'Personal growth and self-understanding',
      'Therapy and psychological healing',
      'Understanding relationship dynamics',
      'Career and life purpose exploration',
      'Shadow work and inner integration',
      'Archetypal pattern recognition'
    ],
    whyItMatters: 'Psychological Astrology offers a modern, psychologically-informed approach to astrology that focuses on growth, healing, and self-understanding. It\'s ideal for those seeking to use astrology as a tool for personal development and psychological insight rather than prediction.'
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
  },
  'shamanic-astrology': {
    slug: 'shamanic-astrology',
    name: 'Shamanic Astrology',
    icon: '🦅',
    description: 'Shamanic journey and spirit guides',
    overview: 'Shamanic Astrology combines traditional astrology with shamanic practices, viewing the planets and stars as living spirits and guides. This system emphasizes journeying, spirit communication, and working with astrological energies through ritual, ceremony, and shamanic practices.',
    howItWorks: 'In Shamanic Astrology, each planet, sign, and house is seen as a spirit guide or ally. Practitioners journey to connect with these astrological spirits, receiving guidance and healing. The system integrates traditional astrological interpretation with shamanic practices like drumming, journeying, and working with spirit allies. The chart reveals which planetary spirits are allies and which need healing or integration.',
    keyConcepts: [
      'Planetary Spirits: Each planet as a living spirit guide',
      'Shamanic Journeying: Connecting with astrological spirits',
      'Spirit Allies: Planetary energies as guides and protectors',
      'Ritual and Ceremony: Working with astrological energies through practice',
      'Ancestral Wisdom: Connecting with ancient astrological traditions',
      'Soul Retrieval: Healing through astrological and shamanic work'
    ],
    useCases: [
      'Connecting with planetary spirits and guides',
      'Shamanic healing and soul retrieval',
      'Ritual and ceremonial timing',
      'Spiritual guidance and wisdom',
      'Ancestral healing and connection',
      'Integrating astrology with shamanic practice'
    ],
    whyItMatters: 'Shamanic Astrology offers a living, experiential approach to astrology where planetary energies become guides and allies. It\'s perfect for those seeking to work with astrology through shamanic practices, ritual, and direct spirit communication.'
  },
  'astrocartography': {
    slug: 'astrocartography',
    name: 'Astrocartography',
    icon: '🗺️',
    description: 'Relocation astrology and world mapping',
    overview: 'Astrocartography maps your birth chart onto the Earth\'s surface, showing where planetary influences are strongest. Developed by Jim Lewis, this system reveals the best locations for career, love, health, creativity, and spiritual growth based on where planetary lines cross.',
    howItWorks: 'Astrocartography calculates planetary lines that cross the Earth\'s surface based on your birth chart. Each planet creates multiple lines (Ascendant, Midheaven, Descendant, and IC lines) where its influence is particularly strong. These lines indicate locations where you\'ll experience heightened planetary energies—positive or challenging—depending on the planet and angle.',
    keyConcepts: [
      'Planetary Lines: Lines on Earth where planetary influences are strongest',
      'Locational Astrology: How geography affects astrological influences',
      'Relocation Charts: Charts calculated for different locations',
      'Power Places: Locations where specific planetary energies are strongest',
      'Travel Timing: Optimal times to visit or relocate to specific lines',
      'Global Influence: Understanding your worldwide astrological influence'
    ],
    useCases: [
      'Finding ideal locations for career success',
      'Discovering places for love and relationships',
      'Health and wellness location planning',
      'Creative and spiritual destination selection',
      'Relocation decisions and planning',
      'Travel planning and timing'
    ],
    whyItMatters: 'Astrocartography reveals how geography interacts with your birth chart, showing where you\'ll experience the strongest planetary influences. It\'s invaluable for relocation decisions, travel planning, and understanding how different locations can support different aspects of your life.'
  }
};

export function getAdvancedTechnique(slug: string): AdvancedTechnique | undefined {
  return ADVANCED_TECHNIQUES[slug];
}

export function getAllAdvancedTechniques(): AdvancedTechnique[] {
  return Object.values(ADVANCED_TECHNIQUES);
}

