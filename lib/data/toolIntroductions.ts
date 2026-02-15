export interface ToolIntroduction {
  slug: string;
  name: string;
  icon: string;
  description: string;
  overview: string;
  howItWorks: string;
  keyConcepts: string[];
  useCases: string[];
  whyItMatters: string;
  exampleQuestions?: string[];
}

export const TOOL_INTRODUCTIONS: Record<string, ToolIntroduction> = {
  'western-astrology': {
    slug: 'western-astrology',
    name: 'Western Astrology',
    icon: '⭐',
    description: 'Traditional Western zodiac system',
    overview: 'Western Astrology, also known as Tropical Astrology, is the most widely recognized astrological system in the Western world. Based on the 12 zodiac signs, planetary positions, and houses, it provides insights into personality traits, life patterns, and future trends. This system uses the tropical zodiac, which aligns with the seasons and has been practiced for thousands of years.',
    howItWorks: 'Western Astrology calculates planetary positions at the moment of your birth to create a natal chart. The chart is divided into 12 houses representing different life areas, and 12 zodiac signs through which planets move. The system analyzes planetary positions, aspects (angles between planets), and house placements to reveal personality traits, strengths, challenges, and life patterns. Transits and progressions show how current planetary movements affect your birth chart.',
    keyConcepts: [
      'Zodiac Signs: 12 signs representing personality archetypes (Aries through Pisces)',
      'Planets: Celestial bodies influencing different aspects of life (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)',
      'Houses: 12 sectors of the chart representing life areas (self, resources, communication, home, creativity, work, relationships, transformation, philosophy, career, social circles, subconscious)',
      'Aspects: Angular relationships between planets revealing dynamics and interactions',
      'Rising Sign (Ascendant): The zodiac sign rising on the eastern horizon at birth, representing your outer personality',
      'Elements: Fire, Earth, Air, Water - categorizing signs by fundamental qualities',
      'Modalities: Cardinal, Fixed, Mutable - showing how signs express energy'
    ],
    useCases: [
      'Understanding personality traits and behaviors',
      'Career and life path guidance',
      'Relationship compatibility analysis',
      'Timing important decisions and events',
      'Personal growth and self-awareness',
      'Predicting future trends and opportunities',
      'Understanding emotional patterns and needs'
    ],
    whyItMatters: 'Western Astrology offers a comprehensive framework for self-understanding and life guidance. It helps you recognize your strengths, navigate challenges, and make informed decisions by understanding cosmic influences. Whether you\'re exploring career paths, relationships, or personal growth, astrology provides insights that complement self-reflection and empower conscious living.'
  },
  'hellenistic-astrology': {
    slug: 'hellenistic-astrology',
    name: 'Hellenistic Astrology',
    icon: '🏛️',
    description: 'Ancient Greco-Roman astrology system (1st century BCE - 7th century CE)',
    overview: 'Hellenistic Astrology is the foundation of Western astrological tradition, developed in the Mediterranean region from approximately the 1st century BCE to the 7th century CE. This ancient system blended Babylonian, Egyptian, and Greek astrological ideas, creating the first horoscopic astrology tradition. It focuses on the seven visible planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn), uses Whole Sign Houses, and employs unique techniques like planetary dignities, Lots (Parts), Sect, and Profections for timing and interpretation.',
    howItWorks: 'Hellenistic Astrology uses Whole Sign Houses, where each zodiac sign equals one house starting from the Ascendant. The system calculates planetary dignities (domicile, exaltation, triplicity, term, face) to assess planetary strength. It determines whether a chart is a day chart (Sun above horizon) or night chart (Sun below horizon), which affects which planets are more benefic or malefic. The system calculates Lots (mathematical points), most notably the Part of Fortune and Part of Spirit, using formulas combining planetary positions. Profections advance one sign per year from the Ascendant for annual timing. The system emphasizes fate, fortune, and timing through these ancient techniques.',
    keyConcepts: [
      'Whole Sign Houses: Each zodiac sign equals one house, starting from the Ascendant sign',
      'Planetary Dignities: Five essential dignities (domicile, exaltation, triplicity, term, face) showing planetary strength',
      'Lots (Parts): Mathematical points calculated from planetary positions, especially Part of Fortune and Part of Spirit',
      'Planetary Sect: Day charts (Sun above horizon) vs Night charts (Sun below horizon), affecting benefic/malefic planets',
      'Profections: Annual timing technique where each year of life activates a different sign from the Ascendant',
      'Time-Lords: Planets that rule profected signs become time-lords for that year',
      'Traditional Seven Planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn (no outer planets)',
      'Philosophical Influences: Draws from Stoicism, Neoplatonism, and Neopythagoreanism'
    ],
    useCases: [
      'Understanding your fate and fortune through ancient techniques',
      'Annual timing and life period analysis through profections',
      'Material prosperity guidance through Part of Fortune',
      'Spiritual purpose discovery through Part of Spirit',
      'Planetary strength assessment through dignities',
      'Day/night chart analysis for understanding your natural energies',
      'Traditional predictive astrology for life events',
      'Historical and philosophical astrological study'
    ],
    whyItMatters: 'Hellenistic Astrology represents the original Western astrological tradition, providing a direct connection to ancient wisdom. Its techniques offer unique insights into timing, planetary strength, and life patterns that differ from modern approaches. By understanding your chart through this ancient lens, you gain access to traditional methods of prediction and interpretation that have been practiced for over two millennia. The system\'s emphasis on fate, fortune, and timing provides a different perspective on life guidance compared to modern psychological astrology.'
  },
  'esoteric-astrology': {
    slug: 'esoteric-astrology',
    name: 'Esoteric Astrology',
    icon: '✨',
    description: 'Soul evolution and spiritual purpose',
    overview: 'Esoteric Astrology is a soul-evolution system, not a predictive one. Based on the teachings of Alice A. Bailey and the Tibetan, it focuses on why you are here, what your soul seeks to develop, and what higher lesson is unfolding. It does not predict material events, give timing, replace Vedic or KP astrology, or provide remedies—it operates on meaning and inner alignment.',
    howItWorks: 'The system works with soul ruler vs personality ruler, rays and spiritual qualities, and the evolutionary purpose of signs and houses. Your chart is interpreted from a soul-centered perspective to reveal higher purpose, spiritual lessons, evolutionary themes, and service and contribution focus. Planets, signs, and houses have both exoteric (personality) and esoteric (soul) meanings.',
    keyConcepts: [
      'Soul Ruler vs Personality Ruler: Different planetary influences for outer life vs soul direction',
      'Seven Rays: Universal spiritual energies influencing development (e.g. Love-Wisdom, Will-Power)',
      'Evolutionary Theme: The overarching soul lesson and growth focus',
      'Spiritual Challenges: Inner blocks and qualities the soul is here to transform',
      'Soul Growth Focus: Service and contribution aligned with higher purpose',
      'Integration Guidance: Aligning action with higher intention'
    ],
    useCases: [
      'Understanding your higher life purpose and why you are here',
      'Identifying the spiritual lesson you are here to learn',
      'Reframing inner conflict and blocks to spiritual growth',
      'Aligning with your higher self and direction',
      'Clarifying how you serve best and what impact you are meant to create',
      'Soul-level insight without material prediction or timing'
    ],
    whyItMatters: 'Esoteric Astrology answers "why does this matter in my life?" with spiritual framing and purpose clarification. It complements personality astrology (Western) and predictive systems (Vedic, KP) by focusing entirely on soul evolution and higher meaning.'
  },
  'psychological-astrology': {
    slug: 'psychological-astrology',
    name: 'Psychological Astrology',
    icon: '🧠',
    description: 'Inner patterns and emotional dynamics — not prediction',
    overview: 'Psychological Astrology is a personality-depth system. It works with Sun, Moon, Ascendant dynamics; inner planet aspects (Mercury, Venus, Mars); shadow projections; attachment patterns; and archetypal complexes. It answers why you think, feel, and react the way you do, what subconscious patterns repeat, and how to integrate shadow and growth. It does not predict events, give timing, diagnose mental illness, or replace therapy.',
    howItWorks: 'Your Western natal chart is interpreted through a psychological lens. The system focuses on core identity pattern, emotional signature, defense mechanisms, shadow theme, relationship pattern, growth focus, and integration guidance. When aspect or chart data is incomplete, analysis stays general. No prediction, no timing, no diagnosis.',
    keyConcepts: [
      'Core Identity Pattern: How your ego and sense of self are structured',
      'Emotional Signature: How you typically feel and express emotion',
      'Defense Mechanisms: Unconscious strategies (e.g. withdrawal, intellectualization)',
      'Shadow Theme: Aspects of self that are repressed or projected',
      'Relationship Pattern: Repeating dynamics in close relationships',
      'Growth Focus: Direction for emotional integration and development',
      'Integration Guidance: Practical step toward wholeness'
    ],
    useCases: [
      'Understanding why you react emotionally in certain ways',
      'Identifying subconscious patterns that repeat',
      'Exploring shadow traits and how to integrate them',
      'Clarifying relationship and attachment dynamics',
      'Improving emotional balance and boundary clarity',
      'Reflective insight without prediction or therapy'
    ],
    exampleQuestions: [
      'Why do I keep attracting the same type of partner?',
      'What does my chart say about my emotional triggers?',
      'Why do I feel divided between logic and emotion?',
      'What shadow pattern should I integrate?'
    ],
    whyItMatters: 'Psychological Astrology explains inner patterns, not external fate. It provides emotional pattern explanation, shadow integration lens, and behavior insight. When users ask "Why do I feel this way?" this tool answers—without prediction, diagnosis, or replacement for professional support.'
  },
  'shamanic-astrology': {
    slug: 'shamanic-astrology',
    name: 'Shamanic Astrology',
    icon: '🪶',
    description: 'Initiatory life journey — power, shadow, soul contracts',
    overview: 'Shamanic Astrology is an initiatory life-journey system, not a forecast. It works with archetypal life cycles, evolutionary gateways, power vs victim polarity, totemic symbolism, and soul contracts and initiations. It answers what initiation you are in, where your power is being tested, and how to reclaim spiritual authority. It does not predict external events, give timing or dates, replace Vedic or KP astrology, or provide ritual prescriptions.',
    howItWorks: 'Your Western natal chart is interpreted through shamanic archetypes. The system identifies your current life cycle phase, archetypal theme, shadow pattern, power dynamic, spiritual threshold, and integration path. When chart data is incomplete, interpretation stays archetypal. No prediction, no timing, no ritual prescriptions—only initiatory framing and empowerment.',
    keyConcepts: [
      'Life Cycle Phase: The initiation you are currently undergoing',
      'Archetypal Theme: The governing archetype of your path (e.g. Warrior becoming Guide)',
      'Shadow Pattern: Where you give away power or hide from visibility',
      'Power Dynamic: Oscillation between self-doubt and claiming force',
      'Spiritual Threshold: The edge you are crossing (e.g. claiming authority through service)',
      'Integration Path: Owning responsibility without domination'
    ],
    useCases: [
      'Understanding what initiation you are going through',
      'Identifying where your power is being tested',
      'Reclaiming spiritual authority in difficult situations',
      'Recognizing soul contracts and repeating lessons',
      'Moving from victim to empowered cycle',
      'Initiatory insight without prediction or timing'
    ],
    exampleQuestions: [
      'What initiation am I currently in?',
      'Why does this period feel like a test?',
      'What archetypal force governs my life path?',
      'How can I reclaim my power in this situation?'
    ],
    whyItMatters: 'Shamanic Astrology answers "Why does this feel like a life test?" with initiatory framing, empowerment narrative, and archetypal transformation context. It complements psychological and predictive systems by focusing entirely on life as an initiatory journey—symbolic and transformative, not predictive.'
  },
  'kabbalistic-astrology': {
    slug: 'kabbalistic-astrology',
    name: 'Kabbalistic Astrology',
    icon: '🪬',
    description: 'Spiritual blueprint and karmic correction (Tikkun)',
    overview: 'Kabbalistic Astrology is a karmic correction system, not a predictive one. It works with Hebrew zodiac correspondences, soul correction (Tikkun), past-life residue themes, and spiritual rectification patterns. It answers what your soul came to correct, why certain challenges repeat, and what internal transformation is required. It does not predict material outcomes, give timing or dates, replace Vedic or KP astrology, or provide religious rulings—it is a transformational lens.',
    howItWorks: 'The system maps your birth chart to Hebrew zodiac correspondences and interprets your spiritual blueprint through the lens of Tikkun (soul correction). Your chart reveals your Hebrew sign, core correction theme, past-life residue patterns, spiritual strengths, growth path, and integration guidance. Planets and signs are read for their karmic and transformative meaning rather than event-level prediction.',
    keyConcepts: [
      'Hebrew Sign: Zodiac sign with its Hebrew month/path correspondence',
      'Tikkun Theme: The central soul correction you are here to work on',
      'Past-Life Residue: Recurring themes and imbalances carried forward',
      'Core Correction: The primary inner transformation required',
      'Spiritual Strength: Innate resilience and depth to draw on',
      'Growth Path: Qualities to develop and refine',
      'Integration Guidance: How to respond with awareness rather than reaction'
    ],
    useCases: [
      'Understanding your soul correction (Tikkun) in this lifetime',
      'Identifying why certain challenges or patterns repeat',
      'Discovering which traits to develop and weaknesses to refine',
      'Aligning with your spiritual blueprint and higher self',
      'Reframing life events through a karmic correction lens',
      'Spiritual growth insight without event or timing prediction'
    ],
    whyItMatters: 'Kabbalistic Astrology answers "why is this happening to me spiritually?" with a focus on Tikkun and karmic correction. It complements Esoteric Astrology (soul evolution) and predictive systems (Vedic, KP) by providing a pattern-based, transformational view of your spiritual blueprint.'
  },
  'hermetic-astrology': {
    slug: 'hermetic-astrology',
    name: 'Hermetic Astrology',
    icon: '🔱',
    description: 'Spiritual mechanics and inner alchemy',
    overview: 'Hermetic Astrology is a metaphysical mechanics system, not a predictive one. It works with polarity (masculine/feminine forces), elemental balance, planetary archetypes, alchemical symbolism, and microcosm–macrocosm correspondence. It answers how energies operate within you, where imbalance exists, and what internal alchemy is required. It does not predict events, give timing, provide yes/no outcomes, or replace Vedic, KP, or Horary systems.',
    howItWorks: 'Your birth chart is interpreted through Hermetic principles to reveal dominant element, elemental imbalance, polarity balance, archetypal theme, planetary dynamics, alchemical lesson, and integration guidance. The system focuses on inner transformation and energy mechanics rather than life events or timing.',
    keyConcepts: [
      'Polarity: Masculine/feminine (yang/yin) forces and their balance',
      'Elemental balance: Fire, Earth, Air, Water — dominance and imbalance',
      'Planetary archetypes: How each planet expresses in your inner mechanics',
      'Alchemical symbolism: Transmutation, refinement, and inner work',
      'Microcosm–macrocosm: As above, so below — correspondence between inner and outer'
    ],
    useCases: [
      'Understanding where you are energetically imbalanced',
      'Identifying what you must transmute or refine',
      'Discovering which element or force dominates your behavior',
      'Clarifying your archetypal theme and inner transformation path',
      'Reframing internal conflict through polarity and alchemical lens',
      'Spiritual mechanics insight without event or timing prediction'
    ],
    whyItMatters: 'Hermetic Astrology answers "what is happening inside me energetically?" with a focus on spiritual mechanics and inner alchemy. It complements Western (personality), Esoteric (soul evolution), and Kabbalistic (Tikkun) systems by providing an energetic and alchemical view of your inner dynamics.'
  },
  'tarot': {
    slug: 'tarot',
    name: 'Tarot',
    icon: '🔮',
    description: '78-card mystical deck system',
    overview: 'Tarot is an ancient divination system using a deck of 78 cards divided into Major Arcana (22 cards) and Minor Arcana (56 cards). Each card carries symbolic imagery and archetypal meanings that tap into universal wisdom. Tarot readings provide guidance, clarity, and insight into life situations, relationships, and personal growth through intuitive interpretation of card combinations.',
    howItWorks: 'A Tarot reading begins with a question or focus area. Cards are drawn and laid out in a specific spread pattern, each position representing different aspects of the situation. The reader interprets the cards\' meanings, their positions, and relationships to each other. The Major Arcana represent major life themes and spiritual lessons, while the Minor Arcana reflect daily experiences and practical matters. The four suits (Wands, Cups, Swords, Pentacles) correspond to Fire, Water, Air, and Earth elements, representing different life areas.',
    keyConcepts: [
      'Major Arcana: 22 cards representing major life themes and archetypal journeys (The Fool through The World)',
      'Minor Arcana: 56 cards divided into four suits showing daily life experiences',
      'Suits: Wands (Fire - passion, action), Cups (Water - emotions, relationships), Swords (Air - thoughts, communication), Pentacles (Earth - material, practical)',
      'Card Spreads: Specific layouts like Three-Card, Celtic Cross, or custom spreads for different questions',
      'Upright vs Reversed: Cards can be read in normal or reversed position, showing different aspects',
      'Card Combinations: How cards interact to reveal deeper meanings',
      'Intuitive Reading: Combining traditional meanings with intuitive insights'
    ],
    useCases: [
      'Gaining clarity on life decisions',
      'Understanding relationship dynamics',
      'Career and financial guidance',
      'Personal growth and self-reflection',
      'Timing and planning important events',
      'Exploring subconscious patterns',
      'Spiritual guidance and meditation'
    ],
    whyItMatters: 'Tarot serves as a powerful mirror for self-reflection and decision-making. It helps you access inner wisdom, recognize patterns, and gain perspective on challenges. Whether you\'re facing a difficult choice, seeking insight into relationships, or exploring personal growth, Tarot provides a structured framework for intuitive guidance that complements rational thinking.'
  },
  'numerology': {
    slug: 'numerology',
    name: 'Chaldean Numerology',
    icon: '🔢',
    description: 'Ancient Babylonian number system',
    overview: 'Chaldean Numerology is an ancient system dating back to Babylonian times, predating the more commonly known Pythagorean system. It assigns mystical meanings to numbers based on their vibrational qualities and uses your name and birth date to reveal personality traits, life path, and destiny. This system is considered more accurate for predicting future events and understanding deeper character traits.',
    howItWorks: 'Chaldean Numerology calculates several key numbers from your name and birth date: Life Path Number (from birth date), Destiny Number (from full name), Soul Number (from vowels), Personality Number (from consonants), and more. Each number has specific meanings and vibrations. The system uses a different number-letter correspondence than Pythagorean numerology, where certain numbers are not assigned to letters, making it more precise. Numbers are analyzed individually and in combination to reveal complete personality profiles.',
    keyConcepts: [
      'Life Path Number: Derived from birth date, showing your life purpose and main lessons',
      'Destiny Number: Calculated from full name, revealing your ultimate potential and life direction',
      'Soul Number: From vowels in your name, representing inner desires and true self',
      'Personality Number: From consonants in your name, showing how others perceive you',
      'Vibrational Frequencies: Each number carries specific energy and meaning',
      'Master Numbers: 11, 22, 33 - special numbers with enhanced spiritual significance',
      'Number Compatibility: How numbers interact in relationships and partnerships'
    ],
    useCases: [
      'Understanding life purpose and direction',
      'Personality analysis and self-awareness',
      'Choosing business names and brand identity',
      'Relationship compatibility assessment',
      'Career path guidance',
      'Timing important decisions',
      'Personal name analysis and potential name changes'
    ],
    whyItMatters: 'Chaldean Numerology provides a mathematical framework for understanding yourself and your life path. It reveals hidden patterns, strengths, and challenges encoded in your name and birth date. By understanding your numbers, you can make choices aligned with your authentic nature, recognize opportunities, and navigate life\'s challenges with greater awareness and purpose.'
  },
  'vedic-astrology': {
    slug: 'vedic-astrology',
    name: 'Vedic Astrology',
    icon: '🕉️',
    description: 'Ancient Indian astrological system with comprehensive birth chart analysis',
    overview: 'Vedic Astrology, also known as Jyotish (science of light), is an ancient Indian astrological system dating back over 5,000 years. Unlike Western astrology, it uses the sidereal zodiac (fixed stars) rather than the tropical zodiac. This system places strong emphasis on predicting events, timing, and providing remedies for challenging planetary influences. It\'s deeply integrated with Hindu philosophy and offers comprehensive life guidance.',
    howItWorks: 'Vedic Astrology calculates planetary positions using the sidereal zodiac system, which accounts for the precession of equinoxes. The system creates multiple chart types: Rasi (D1 - main birth chart), Navamsa (D9 - marriage and relationships), Dashas (planetary periods), and various divisional charts for specific life areas. It analyzes planetary positions, Nakshatras (lunar mansions), planetary periods (Dashas), transits (Gochara), and provides specific remedies (gemstones, mantras, rituals) for challenging influences.',
    keyConcepts: [
      'Sidereal Zodiac: Fixed star-based system, more accurate for predictions',
      'Nakshatras: 27 lunar mansions providing detailed personality insights',
      'Dashas: Planetary periods determining timing of events (Vimshottari Dasha system)',
      'Divisional Charts: Multiple charts (D1-D60) for different life areas',
      'Planetary Strengths: Benefic and malefic planets, exaltation, debilitation',
      'Yogas: Special planetary combinations indicating specific results',
      'Remedies: Gemstones, mantras, rituals, and practices to balance planetary influences'
    ],
    useCases: [
      'Accurate event prediction and timing',
      'Marriage and relationship compatibility',
      'Career and financial guidance',
      'Health predictions and remedies',
      'Education and academic success',
      'Spiritual growth and dharma',
      'Remedial measures for challenging periods'
    ],
    whyItMatters: 'Vedic Astrology offers exceptional accuracy in prediction and timing, making it invaluable for planning important life events. Its comprehensive system of remedies provides practical solutions for challenging planetary influences. Whether you\'re seeking to understand your life purpose (dharma), timing major decisions, or navigating difficult periods, Vedic Astrology provides both insight and actionable guidance.'
  },
  'palmistry': {
    slug: 'palmistry',
    name: 'Palmistry',
    icon: '🤲',
    description: 'Palm reading and hand analysis',
    overview: 'Palmistry, also known as Chiromancy, is the ancient art of reading palms to reveal personality traits, life patterns, and future possibilities. By analyzing the lines, mounts, shapes, and markings on your hands, palmistry provides insights into your character, talents, relationships, career, health, and life journey. Each hand tells a unique story, with the dominant hand showing your present and future, and the non-dominant hand revealing your potential and past.',
    howItWorks: 'Palmistry analyzes multiple features of your hands: major lines (Life, Head, Heart, Fate), minor lines (Health, Marriage, Travel), mounts (planetary mounds representing different qualities), hand shape (Earth, Air, Fire, Water types), finger lengths and characteristics, and special markings (stars, crosses, triangles, islands). The reader interprets these features in combination, considering their depth, length, breaks, and intersections to provide comprehensive insights into your life patterns and potential.',
    keyConcepts: [
      'Major Lines: Life Line (vitality, life force), Head Line (intellect, thinking), Heart Line (emotions, relationships), Fate Line (career, destiny)',
      'Mounts: Raised areas at the base of fingers representing planetary influences (Jupiter, Saturn, Apollo, Mercury, Mars, Venus, Moon)',
      'Hand Shapes: Four elemental types (Earth, Air, Fire, Water) revealing basic personality',
      'Finger Analysis: Length, shape, and characteristics of fingers revealing traits',
      'Minor Lines: Marriage lines, travel lines, health lines providing additional details',
      'Markings: Stars, crosses, triangles, islands indicating special events or qualities',
      'Dominant vs Non-Dominant: Present reality vs potential and past patterns'
    ],
    useCases: [
      'Understanding personality traits and talents',
      'Career and life path guidance',
      'Relationship and marriage insights',
      'Health and wellness awareness',
      'Timing important life events',
      'Recognizing strengths and challenges',
      'Personal growth and self-awareness'
    ],
    whyItMatters: 'Palmistry offers a tangible, visual way to understand yourself and your life patterns. Your hands are unique blueprints that reflect your personality, talents, and potential. By learning to read your palms, you gain insights into your strengths, recognize areas for growth, and understand the timing of important life events. It\'s a practical tool for self-awareness and life planning.'
  },
  'angel-numbers': {
    slug: 'angel-numbers',
    name: 'Angel Numbers',
    icon: '👼',
    description: 'Divine guidance through numbers',
    overview: 'Angel Numbers are sequences of numbers that carry spiritual messages and guidance from angels, spirit guides, or the universe. When you repeatedly notice the same number patterns (like 111, 222, 333, or 11:11), it\'s considered a sign that divine forces are trying to communicate with you. These numbers appear in everyday life - on clocks, license plates, receipts, addresses - as gentle nudges toward awareness and guidance.',
    howItWorks: 'Angel Numbers work through synchronicity - meaningful coincidences where numbers appear repeatedly in your awareness. Each number sequence carries specific vibrational meanings. Single digits (1-9) have core meanings, while repeating sequences amplify these messages. Triple numbers (111, 222, etc.) and master numbers (11, 22, 33) carry particularly powerful messages. The numbers appear when you need guidance, reassurance, or confirmation about your path, often when you\'re questioning decisions or seeking direction.',
    keyConcepts: [
      'Number Vibrations: Each number carries specific energetic meanings and messages',
      'Repeating Sequences: Patterns like 111, 222, 333 amplify single-digit meanings',
      'Master Numbers: 11, 22, 33 - numbers with enhanced spiritual significance',
      'Synchronicity: Meaningful coincidences where numbers appear repeatedly',
      'Personal Context: How numbers relate to your current life situation',
      'Intuitive Interpretation: Combining number meanings with personal insight',
      'Timing: Numbers appear when guidance is most needed'
    ],
    useCases: [
      'Receiving guidance on life decisions',
      'Confirmation you\'re on the right path',
      'Emotional support and reassurance',
      'Understanding spiritual messages',
      'Recognizing patterns and synchronicities',
      'Connection with spiritual guides',
      'Awareness and mindfulness practice'
    ],
    whyItMatters: 'Angel Numbers provide gentle, accessible guidance that helps you stay aligned with your spiritual path. They offer reassurance during uncertain times, confirmation when making decisions, and reminders to stay present and aware. By learning to recognize and interpret these numbers, you open yourself to receiving guidance and support from the spiritual realm, enhancing your intuition and connection to higher wisdom.'
  },
  'bazi': {
    slug: 'bazi',
    name: 'BaZi',
    icon: '🏮',
    description: 'Chinese Four Pillars of Destiny',
    overview: 'BaZi, also known as Four Pillars of Destiny or Eight Characters, is a Chinese astrological system that analyzes your birth date and time to reveal your destiny, personality, and life patterns. Based on the interaction of five elements (Metal, Water, Wood, Fire, Earth) and Yin-Yang principles, BaZi provides precise predictions about career, relationships, wealth, health, and life timing. It\'s one of the most respected and accurate systems in Chinese metaphysics.',
    howItWorks: 'BaZi extracts four pairs of characters (Eight Characters total) from your birth date and time: Year Pillar, Month Pillar, Day Pillar (Day Master), and Hour Pillar. Each pillar consists of a Heavenly Stem (outer element) and Earthly Branch (inner element). The system analyzes the Day Master (your core essence), the five elements\' strength and balance, the Ten Gods (relationships between elements), and the interactions between pillars to determine personality traits, life patterns, favorable periods, and challenges.',
    keyConcepts: [
      'Four Pillars: Year, Month, Day, Hour - representing different life aspects',
      'Day Master: The core element representing your essential nature',
      'Five Elements: Metal, Water, Wood, Fire, Earth - fundamental energies',
      'Yin and Yang: Dual nature of each element, creating balance',
      'Ten Gods: Relationships between elements (director, wealth, resource, output, friend)',
      'Element Strength: Balance and harmony of elements determining fortune',
      'Favorable Periods: Years and months when elements align favorably'
    ],
    useCases: [
      'Career and wealth prediction',
      'Relationship compatibility analysis',
      'Health and longevity assessment',
      'Timing important decisions and ventures',
      'Understanding personality and character',
      'Identifying favorable and challenging periods',
      'Career and business planning'
    ],
    whyItMatters: 'BaZi provides exceptional accuracy in predicting life events and understanding your true nature. Its precise timing system helps you identify the best periods for career moves, relationships, investments, and major decisions. By understanding your element balance and Day Master, you can leverage your strengths, address weaknesses, and align your actions with favorable cosmic timing for optimal success.'
  },
  'chinese-astrology': {
    slug: 'chinese-astrology',
    name: 'Chinese Astrology (Zi Wei Dou Shu)',
    icon: '👑',
    description: '紫微斗数 - Traditional Chinese Purple Star Astrology with 12 palaces and fortune cycles',
    overview: 'Zi Wei Dou Shu (Purple Star Astrology) is an advanced Chinese astrological system that creates a detailed chart using 12 palaces (life areas) and over 100 stars. Unlike BaZi\'s element-based system, Zi Wei Dou Shu focuses on star placements and their interactions to reveal personality, relationships, career, wealth, health, and life fortune. It\'s considered the "Emperor\'s Astrology" due to its precision and comprehensive analysis.',
    howItWorks: 'Zi Wei Dou Shu calculates star positions based on birth date and time, placing them in 12 palaces: Life, Siblings, Spouse, Children, Wealth, Health, Travel, Servants, Career, Property, Fortune, Parents. The system uses the Purple Star (Zi Wei) as the primary star, along with other major stars (Tian Ji, Tai Yang, Wu Qu, Tian Tong, Lian Zhen, etc.) and minor stars. The interactions between stars, their brightness, and palace positions reveal detailed insights about each life area and fortune cycles.',
    keyConcepts: [
      '12 Palaces: Different life areas analyzed in the chart (Life, Career, Wealth, Spouse, etc.)',
      'Major Stars: Primary stars like Zi Wei (Purple Star), Tian Ji (Heavenly Machine), Tai Yang (Sun)',
      'Minor Stars: Supporting stars providing additional details',
      'Star Brightness: Stars can be bright, beneficial, or dim, affecting their influence',
      'Four Transformations: Changes in fortune through life cycles',
      'Palace Interactions: How palaces and stars influence each other',
      'Fortune Cycles: 10-year, annual, and monthly fortune periods'
    ],
    useCases: [
      'Comprehensive life analysis and fortune prediction',
      'Career and wealth forecasting',
      'Relationship and marriage compatibility',
      'Health and longevity assessment',
      'Timing major life decisions',
      'Understanding personality and character traits',
      'Identifying favorable periods for various endeavors'
    ],
    whyItMatters: 'Zi Wei Dou Shu offers unparalleled depth and precision in Chinese astrology. Its detailed palace system provides comprehensive insights into every aspect of life, while its star-based analysis reveals subtle personality traits and fortune patterns. Whether you\'re planning career moves, understanding relationships, or seeking to optimize life timing, Zi Wei Dou Shu provides the detailed guidance needed for informed decision-making.'
  },
  'synastry': {
    slug: 'synastry',
    name: 'Synastry',
    icon: '💕',
    description: 'Relationship compatibility analysis',
    overview: 'Synastry is the astrological analysis of relationships by comparing two birth charts. It reveals how two people interact, their compatibility, areas of harmony and challenge, and the dynamics of their relationship. By overlaying one person\'s planets onto another\'s chart, synastry identifies planetary aspects, house overlays, and elemental compatibility that determine relationship success, communication styles, and long-term potential.',
    howItWorks: 'Synastry compares two birth charts by analyzing how Person A\'s planets fall into Person B\'s houses, and vice versa. The system examines planetary aspects between the two charts (conjunctions, trines, squares, oppositions), elemental compatibility (Fire, Earth, Air, Water), and how each person\'s planets activate areas of the other\'s chart. Composite charts (midpoint charts) and Davison charts provide additional insights into the relationship as a unified entity.',
    keyConcepts: [
      'House Overlays: How one person\'s planets activate areas of the other\'s chart',
      'Planetary Aspects: Angles between planets in both charts revealing dynamics',
      'Element Compatibility: How Fire, Earth, Air, Water elements interact',
      'Composite Chart: Midpoint chart representing the relationship as an entity',
      'Davison Chart: Relationship midpoint chart for timing and dynamics',
      'Synastry Aspects: Conjunctions (unity), trines (harmony), squares (challenges), oppositions (polarity)',
      'Relationship Houses: 7th house (partnerships), 5th house (romance), 8th house (intimacy)'
    ],
    useCases: [
      'Romantic relationship compatibility',
      'Business partnership assessment',
      'Family relationship understanding',
      'Friendship compatibility',
      'Marriage timing and potential',
      'Identifying relationship strengths and challenges',
      'Understanding communication and conflict patterns'
    ],
    whyItMatters: 'Synastry provides deep insights into relationship dynamics, helping you understand why relationships work or struggle. It reveals areas of natural harmony, potential challenges, and how to navigate differences. Whether you\'re exploring romantic compatibility, business partnerships, or family relationships, synastry offers valuable guidance for building stronger, more understanding connections.'
  },
  'i-ching': {
    slug: 'i-ching',
    name: 'I Ching',
    icon: '☯️',
    description: 'Ancient Chinese divination system',
    overview: 'The I Ching, or Book of Changes, is one of the oldest Chinese divination systems, dating back over 3,000 years. It\'s both a philosophical text and a practical oracle that provides guidance through 64 hexagrams - combinations of six lines (broken or unbroken) representing different situations and life patterns. The I Ching offers profound wisdom for decision-making, understanding change, and navigating life\'s complexities.',
    howItWorks: 'I Ching readings begin with a question. You generate a hexagram through coin tossing (three coins, six times) or yarrow stalks. Each hexagram consists of six lines (Yin - broken, or Yang - unbroken) creating 64 possible combinations. The hexagram represents your current situation, and changing lines create a second hexagram showing the outcome. Each hexagram includes a name, judgment, image, and line texts providing detailed guidance and philosophical insights.',
    keyConcepts: [
      '64 Hexagrams: Combinations of six lines representing life situations',
      'Yin and Yang: Broken (Yin) and unbroken (Yang) lines representing dual forces',
      'Changing Lines: Lines that change, creating a second hexagram for outcome',
      'Trigrams: Three-line combinations (Heaven, Earth, Thunder, Water, Mountain, Wind, Fire, Lake)',
      'Hexagram Texts: Judgment, Image, and line texts providing guidance',
      'The Tao: Understanding the natural flow and order of change',
      'Timeless Wisdom: Philosophical insights applicable to all situations'
    ],
    useCases: [
      'Making important life decisions',
      'Understanding current situations and outcomes',
      'Personal growth and self-reflection',
      'Business and career guidance',
      'Relationship insights',
      'Timing and planning',
      'Philosophical contemplation and wisdom'
    ],
    whyItMatters: 'The I Ching offers timeless wisdom that helps you understand change, make decisions, and navigate life\'s complexities. It provides both practical guidance and profound philosophical insights, teaching you to work with natural flow rather than against it. Whether you\'re facing major decisions, seeking clarity, or exploring deeper understanding, the I Ching offers a framework for wise living.'
  },
  'face-reading': {
    slug: 'face-reading',
    name: 'Face Reading',
    icon: '👁️',
    description: 'Personality analysis through facial features',
    overview: 'Face Reading, also known as Physiognomy, is the ancient art of analyzing facial features to understand personality traits, character, and life patterns. By examining the shape, size, and characteristics of facial features (eyes, nose, mouth, eyebrows, forehead, etc.), face reading reveals insights about personality, communication style, relationships, career aptitudes, health tendencies, and fortune. It combines Chinese face reading traditions with modern psychological insights.',
    howItWorks: 'Face Reading analyzes multiple facial features: the Three Zones (forehead, mid-face, lower face representing past, present, future), Five Elements (facial features corresponding to elements), facial shape (round, square, oval, etc.), individual features (eyes, nose, mouth, eyebrows, ears), and facial markings (moles, lines, asymmetry). Each feature reveals specific personality traits, and their combination provides comprehensive insights into character, communication style, and life patterns.',
    keyConcepts: [
      'Three Zones: Upper (forehead - intellect, past), Middle (nose/cheeks - relationships, present), Lower (mouth/chin - willpower, future)',
      'Five Elements: Features corresponding to Metal, Water, Wood, Fire, Earth elements',
      'Facial Shape: Round (friendly), Square (practical), Oval (balanced), etc.',
      'Eye Analysis: Size, shape, distance revealing personality and communication style',
      'Nose Features: Shape and size indicating wealth, career, and character',
      'Mouth and Lips: Revealing communication style, relationships, and sensuality',
      'Facial Markings: Moles and lines indicating specific traits or events'
    ],
    useCases: [
      'Understanding personality traits',
      'Career and aptitude guidance',
      'Relationship compatibility analysis',
      'Communication style insights',
      'Health and wellness awareness',
      'Personal growth and self-awareness',
      'Recognizing strengths and challenges'
    ],
    whyItMatters: 'Face Reading provides immediate insights into personality and character through visible facial features. It helps you understand yourself and others better, recognize communication styles, and identify natural aptitudes. Whether you\'re exploring career paths, understanding relationships, or seeking self-awareness, face reading offers a practical tool for understanding human nature and improving interpersonal connections.'
  },
  'dream-symbols': {
    slug: 'dream-symbols',
    name: 'Dream Symbols',
    icon: '💭',
    description: 'Dream interpretation and symbolism',
    overview: 'Dream Symbol interpretation is the practice of understanding messages from your subconscious through dream imagery, symbols, and narratives. Dreams serve as a bridge between conscious and unconscious mind, revealing hidden thoughts, emotions, fears, desires, and guidance. By analyzing dream symbols, themes, and scenarios, you can gain insights into your inner world, unresolved issues, and receive guidance for waking life decisions.',
    howItWorks: 'Dream interpretation analyzes multiple aspects: dream symbols (objects, people, animals, places), dream themes and scenarios, emotions experienced in the dream, colors and numbers, recurring patterns, and dream context. Symbols carry both universal meanings and personal associations. The interpretation considers how symbols relate to your waking life, current challenges, and subconscious patterns. Different types of dreams (prophetic, processing, warning, guidance) provide different kinds of insights.',
    keyConcepts: [
      'Universal Symbols: Common meanings shared across cultures (water = emotions, flying = freedom)',
      'Personal Symbols: Individual associations based on personal experiences',
      'Dream Types: Prophetic, processing, warning, wish-fulfillment, guidance dreams',
      'Emotional Content: Feelings in dreams revealing underlying emotions',
      'Recurring Dreams: Patterns indicating unresolved issues or important messages',
      'Lucid Dreaming: Awareness within dreams for conscious exploration',
      'Dream Journaling: Recording dreams to identify patterns and symbols'
    ],
    useCases: [
      'Understanding subconscious patterns',
      'Receiving guidance on life decisions',
      'Processing emotions and experiences',
      'Identifying unresolved issues',
      'Creative inspiration and problem-solving',
      'Self-awareness and personal growth',
      'Recognizing warnings or opportunities'
    ],
    whyItMatters: 'Dream interpretation provides a direct window into your subconscious mind, revealing thoughts, emotions, and patterns you may not be consciously aware of. It helps you process experiences, understand yourself better, and receive guidance for waking life. Whether you\'re seeking self-awareness, dealing with emotional issues, or looking for creative inspiration, dream symbols offer valuable insights from your inner wisdom.'
  },
  'kp-astrology': {
    slug: 'kp-astrology',
    name: 'KP Astrology',
    icon: '⭐',
    description: 'Krishnamurti Paddhati system',
    overview: 'KP Astrology (Krishnamurti Paddhati) is a modern, precise astrological system developed by the late Prof. K.S. Krishnamurti in India. It\'s a refined version of Vedic astrology that uses a unique system of ruling planets, sub-lords, and cusps for highly accurate predictions. KP Astrology is particularly renowned for its precision in timing events and answering specific questions, making it popular for horary and predictive astrology.',
    howItWorks: 'KP Astrology uses the sidereal zodiac like Vedic astrology but introduces the concept of sub-lords - subdivisions of signs and Nakshatras. The system calculates ruling planets for different time periods (Primary, Secondary, Tertiary, Sub periods) and uses cusps (exact boundaries) of houses rather than whole signs. It analyzes the sub-lord of each house cusp and planet to determine outcomes. The system places strong emphasis on the 11th house (gains) and 6th house (obstacles) for prediction accuracy.',
    keyConcepts: [
      'Sub-Lords: Subdivisions of signs and Nakshatras for precise predictions',
      'Ruling Planets: Planets ruling specific time periods determining outcomes',
      'Cusps: Exact boundaries of houses rather than whole sign houses',
      'House Significance: Emphasis on specific houses (11th for gains, 6th for obstacles)',
      'Primary Periods: Major planetary periods (Dasha)',
      'Four-Fold Theory: Primary, Secondary, Tertiary, Sub periods for timing',
      'Horary Astrology: Answering specific questions using current time'
    ],
    useCases: [
      'Precise event timing and prediction',
      'Answering specific questions (horary)',
      'Marriage and relationship timing',
      'Career and job prediction',
      'Health and medical astrology',
      'Financial and business timing',
      'Education and exam success'
    ],
    whyItMatters: 'KP Astrology offers exceptional accuracy in prediction and timing, making it invaluable for planning important events and answering specific questions. Its unique sub-lord system provides precision that traditional Vedic astrology may lack. Whether you\'re timing a career move, planning a wedding, or seeking answers to specific questions, KP Astrology delivers highly accurate predictions.'
  },
  'runes': {
    slug: 'runes',
    name: 'Runes',
    icon: 'ᚱ',
    description: 'Ancient Norse divination system',
    overview: 'Runes are an ancient Germanic and Norse divination system using a set of 24 symbols (plus a blank rune) carved on stones, wood, or other materials. Each rune carries specific meanings related to Norse mythology, natural forces, and life experiences. Rune reading provides guidance, reveals hidden patterns, and offers wisdom for decision-making. The runes were used by ancient Norse people for divination, magic, and communication.',
    howItWorks: 'Rune reading involves drawing runes from a set and interpreting their meanings based on position, orientation (upright or reversed), and relationships to other runes. The three most common spreads are: Single Rune (quick answer), Three Rune (past-present-future), and Nine Rune (comprehensive reading). Each rune has a name (like Fehu, Uruz, Thurisaz), a symbolic meaning, and associations with Norse gods, natural forces, and life experiences. The reading combines traditional meanings with intuitive interpretation.',
    keyConcepts: [
      '24 Runes: Each rune represents different concepts (Fehu = wealth, Uruz = strength, etc.)',
      'Rune Sets: Elder Futhark (24 runes), Younger Futhark, Anglo-Saxon Futhark',
      'Rune Spreads: Single, Three-Rune, Nine-Rune, and custom layouts',
      'Upright vs Reversed: Different meanings when runes appear reversed',
      'Norse Mythology: Connections to gods, goddesses, and ancient wisdom',
      'Natural Forces: Runes representing elements, seasons, and natural cycles',
      'Intuitive Reading: Combining traditional meanings with personal insight'
    ],
    useCases: [
      'Receiving guidance on decisions',
      'Understanding current situations',
      'Connecting with Norse wisdom',
      'Personal growth and self-reflection',
      'Timing and planning',
      'Exploring subconscious patterns',
      'Spiritual guidance and meditation'
    ],
    whyItMatters: 'Runes offer a powerful, direct connection to ancient Norse wisdom and natural forces. They provide clear, practical guidance that cuts through confusion and reveals essential truths. Whether you\'re facing difficult decisions, seeking clarity, or exploring your spiritual path, runes offer straightforward insights and connection to timeless wisdom.'
  },
  'feng-shui': {
    slug: 'feng-shui',
    name: 'Feng Shui',
    icon: '🪔',
    description: 'Chinese geomancy and space harmony',
    overview: 'Feng Shui is an ancient Chinese system of harmonizing your environment with natural energy flow (Qi) to enhance health, wealth, relationships, and overall well-being. By analyzing the placement of objects, colors, materials, and directions in your living or working space, Feng Shui creates balance and harmony that supports your goals. It\'s based on the principles of Yin and Yang, the Five Elements, and the Bagua (energy map).',
    howItWorks: 'Feng Shui analyzes your space using the Bagua map - an octagonal grid dividing your space into nine areas corresponding to life aspects (Wealth, Fame, Relationships, Family, Health, Creativity, Knowledge, Career, Helpful People). The system considers compass directions, the Five Elements (Wood, Fire, Earth, Metal, Water), colors, shapes, and the flow of Qi (energy). By placing appropriate elements, colors, and objects in each area, you activate and balance energies to support your goals.',
    keyConcepts: [
      'Bagua Map: Eight-sided energy map dividing space into life areas',
      'Five Elements: Wood, Fire, Earth, Metal, Water - fundamental energies',
      'Qi (Chi): Life force energy flowing through spaces',
      'Yin and Yang: Balance of opposing forces',
      'Compass Directions: Cardinal directions influencing energy',
      'Feng Shui Cures: Objects, colors, and arrangements enhancing energy',
      'Flying Star Feng Shui: Advanced system using time-based energy patterns'
    ],
    useCases: [
      'Home and office design',
      'Enhancing wealth and career',
      'Improving relationships',
      'Health and wellness',
      'Creating harmonious living spaces',
      'Business success and prosperity',
      'Personal growth and well-being'
    ],
    whyItMatters: 'Feng Shui recognizes that your environment directly influences your life, health, and success. By harmonizing your space with natural energy flow, you create an environment that supports your goals and well-being. Whether you\'re designing a new home, arranging an office, or seeking to improve specific life areas, Feng Shui provides practical tools for creating spaces that nurture and support you.'
  },
  'horary-astrology': {
    slug: 'horary-astrology',
    name: 'Horary Astrology',
    icon: '🕰️',
    description: 'Question-based astrological divination',
    overview: 'Horary Astrology is a branch of astrology that answers specific questions by analyzing the chart cast for the exact moment the question is asked or understood. Rather than predicting your entire life, horary focuses on providing precise answers to specific questions like "Will I get the job?" or "Where is my lost item?" The system uses traditional rulerships and timing techniques to deliver accurate, practical answers.',
    howItWorks: 'When you ask a horary question, a chart is cast for that exact moment. The question is assigned to a specific house (like 10th house for career questions, 7th house for relationships). The astrologer identifies the significator planets (planets ruling the question) and analyzes their condition, aspects, and movement to determine the answer. The system uses traditional timing techniques to predict when events will occur, if they will occur at all.',
    keyConcepts: [
      'Question Timing: Chart cast for the moment question is asked',
      'House Significance: Different houses for different question types',
      'Significators: Planets representing the question and related parties',
      'Reception: How planets receive each other, indicating outcomes',
      'Aspects: Planetary angles revealing interactions and timing',
      'Prohibition: Factors preventing an outcome',
      'Timing: When events will occur based on planetary movement'
    ],
    useCases: [
      'Answering specific questions',
      'Finding lost items',
      'Career and job inquiries',
      'Relationship questions',
      'Business decisions',
      'Legal matters',
      'Health inquiries'
    ],
    whyItMatters: 'Horary Astrology provides practical, precise answers to specific questions when you need clarity. Unlike natal astrology\'s broad life analysis, horary focuses on immediate concerns and delivers actionable guidance. Whether you\'re facing a decision, seeking lost items, or wondering about timing, horary astrology offers direct answers backed by centuries of proven techniques.'
  },
  'medical-astrology': {
    slug: 'medical-astrology',
    name: 'Medical Astrology',
    icon: '⚕️',
    description: 'Health-focused astrological analysis',
    overview: 'Medical Astrology is the practice of using astrological charts to understand health patterns, identify potential health issues, and guide wellness practices. By analyzing planetary positions, aspects, and house placements related to health, medical astrology reveals constitutional strengths, vulnerabilities, and timing of health events. It\'s used as a complementary tool alongside medical care to understand health patterns and support wellness.',
    howItWorks: 'Medical Astrology analyzes the 6th house (health and illness), planets in health-related houses, planetary aspects affecting health, and planetary periods (transits) that may trigger health events. Each planet rules specific body parts and systems (Mars = muscles/blood, Venus = kidneys/throat, etc.), and signs correspond to body regions. The system identifies health strengths, vulnerabilities, and timing of health-related events through planetary analysis.',
    keyConcepts: [
      '6th House: Primary house of health and illness',
      'Planetary Rulerships: Each planet rules specific body parts and systems',
      'Sign Correspondences: Zodiac signs corresponding to body regions',
      'Health Timing: Planetary periods and transits affecting health',
      'Constitutional Analysis: Inherent health strengths and weaknesses',
      'Remedial Measures: Astrological remedies supporting health',
      'Preventive Guidance: Understanding health patterns for prevention'
    ],
    useCases: [
      'Understanding health patterns',
      'Identifying health vulnerabilities',
      'Timing health-related events',
      'Supporting wellness practices',
      'Complementary health guidance',
      'Understanding constitutional health',
      'Preventive health awareness'
    ],
    whyItMatters: 'Medical Astrology provides insights into your constitutional health patterns, helping you understand your body\'s strengths and vulnerabilities. It offers timing awareness for health events and supports preventive wellness practices. While not a replacement for medical care, it serves as a valuable complementary tool for understanding health patterns and supporting overall well-being.'
  },
  'financial-astrology': {
    slug: 'financial-astrology',
    name: 'Financial Astrology',
    icon: '💰',
    description: 'Investment and wealth astrological guidance',
    overview: 'Financial Astrology applies astrological principles to financial markets, investments, and wealth creation. By analyzing planetary cycles, aspects, and transits, financial astrology identifies favorable periods for investments, market trends, and wealth-building opportunities. It\'s used to time financial decisions, understand market cycles, and optimize wealth creation strategies.',
    howItWorks: 'Financial Astrology analyzes planetary cycles (especially Jupiter and Saturn cycles), planetary aspects affecting markets, and transits to financial houses (2nd house for personal wealth, 8th house for shared resources). The system identifies favorable periods for investments, business ventures, and financial decisions. It considers planetary rulerships of commodities, currencies, and market sectors, and uses timing techniques to optimize financial activities.',
    keyConcepts: [
      '2nd House: Personal wealth and resources',
      '8th House: Shared resources, investments, inheritance',
      'Planetary Cycles: Jupiter (expansion), Saturn (restriction) cycles affecting markets',
      'Market Timing: Favorable periods for investments and financial decisions',
      'Commodity Rulerships: Planets ruling gold, silver, oil, etc.',
      'Business Cycles: Astrological patterns in economic cycles',
      'Wealth Patterns: Astrological indicators of wealth potential'
    ],
    useCases: [
      'Timing investments',
      'Market trend analysis',
      'Business venture timing',
      'Wealth-building strategies',
      'Financial decision timing',
      'Understanding market cycles',
      'Optimizing financial opportunities'
    ],
    whyItMatters: 'Financial Astrology helps you time financial decisions for optimal outcomes, understand market cycles, and identify favorable periods for wealth-building activities. By aligning your financial actions with favorable astrological timing, you can enhance your chances of success and make more informed investment and business decisions.'
  },
  'pendulum': {
    slug: 'pendulum',
    name: 'Pendulum',
    icon: '🔮',
    description: 'Crystal pendulum divination',
    overview: 'Pendulum divination is a simple yet powerful method of receiving guidance by asking questions and observing the pendulum\'s movement. A weighted object (often a crystal) suspended on a chain or cord responds to subtle energy and subconscious influences, moving in specific patterns (yes/no, directional) to answer questions. Pendulums tap into your intuition and the energetic field to provide clear, direct answers.',
    howItWorks: 'Pendulum reading involves holding a pendulum steady, asking a question, and observing its movement. The pendulum typically moves in specific patterns: back-and-forth or circular motion for "yes," side-to-side for "no," or directional movement for guidance. The reader establishes a baseline with the pendulum to determine its "yes" and "no" responses, then asks questions and interprets the movements. The pendulum responds to subtle energy, intuition, and subconscious knowledge.',
    keyConcepts: [
      'Pendulum Types: Crystal, metal, wood, or other materials',
      'Movement Patterns: Yes (forward/back or clockwise), No (side-to-side or counterclockwise)',
      'Baseline Establishment: Determining pendulum\'s specific responses',
      'Question Framing: Clear, specific questions for accurate answers',
      'Energy Sensitivity: Pendulum responding to subtle energies',
      'Intuitive Connection: Combining pendulum movement with intuition',
      'Practical Applications: Finding objects, making decisions, health questions'
    ],
    useCases: [
      'Answering yes/no questions',
      'Finding lost items',
      'Making decisions',
      'Health and wellness guidance',
      'Energy clearing and balancing',
      'Chakra assessment',
      'Personal guidance and intuition development'
    ],
    whyItMatters: 'Pendulum divination provides a simple, accessible tool for receiving guidance and accessing your intuition. It offers clear, direct answers to questions and helps you connect with your inner wisdom. Whether you\'re making decisions, seeking guidance, or developing your intuitive abilities, the pendulum serves as a practical bridge between conscious questions and subconscious knowing.'
  },
  'kabbalistic-numerology': {
    slug: 'kabbalistic-numerology',
    name: 'Kabbalistic Numerology',
    icon: '🪬',
    description: 'Hebrew mystical number system',
    overview: 'Kabbalistic Numerology combines numerology with the mystical teachings of the Kabbalah, specifically the Tree of Life. It uses Hebrew letters and their numerical values (Gematria) to reveal spiritual insights, life purpose, and mystical connections. Each Hebrew letter has a numerical value, and names are analyzed through these values to reveal deeper spiritual meanings and connections to divine forces.',
    howItWorks: 'Kabbalistic Numerology assigns numerical values to Hebrew letters using Gematria (the Hebrew system of numerology). Names are converted to their Hebrew equivalents, then analyzed through their numerical values. The system connects numbers to the Tree of Life\'s Sephiroth (divine emanations), revealing spiritual purpose, karmic patterns, and connections to divine forces. It combines numerical analysis with Kabbalistic symbolism and mystical teachings.',
    keyConcepts: [
      'Gematria: Hebrew system assigning numerical values to letters',
      'Hebrew Letters: 22 letters each with numerical and mystical significance',
      'Tree of Life: 10 Sephiroth representing divine emanations',
      'Spiritual Purpose: Revealing soul mission through numbers',
      'Karmic Patterns: Numbers indicating past-life influences',
      'Divine Connections: Links between numbers and spiritual forces',
      'Mystical Symbolism: Integrating numerology with Kabbalistic wisdom'
    ],
    useCases: [
      'Understanding spiritual purpose',
      'Kabbalistic pathworking',
      'Spiritual name analysis',
      'Connecting with divine forces',
      'Understanding karmic patterns',
      'Mystical and spiritual exploration',
      'Integrating numerology with Jewish mysticism'
    ],
    whyItMatters: 'Kabbalistic Numerology bridges numerology with mystical tradition, offering deep spiritual insights into your purpose and connection to divine forces. It reveals karmic patterns, spiritual gifts, and your place in the cosmic order. Whether you\'re exploring spiritual purpose, working with Kabbalistic practices, or seeking deeper mystical understanding, this system provides profound insights.'
  },
  'name-analysis': {
    slug: 'name-analysis',
    name: 'Name Analysis',
    icon: '📝',
    description: 'Personality analysis through name',
    overview: 'Name Analysis uses numerology and letter symbolism to reveal personality traits, talents, challenges, and life patterns encoded in your name. Every letter carries vibrational energy and meaning, and your full name creates a unique combination that influences your personality and life path. Name analysis helps you understand how your name shapes your identity and can guide decisions about name changes or variations.',
    howItWorks: 'Name Analysis calculates several key numbers from your name: Expression Number (from full name), Soul Urge Number (from vowels), Personality Number (from consonants), and more. Each letter is assigned a numerical value (typically using Pythagorean or Chaldean systems), and numbers are calculated and interpreted. The analysis considers the meanings of individual letters, their positions in your name, and the overall numerical vibration of your name.',
    keyConcepts: [
      'Expression Number: Full name revealing overall personality and talents',
      'Soul Urge Number: Vowels revealing inner desires and motivations',
      'Personality Number: Consonants revealing outer personality',
      'Letter Meanings: Individual letters carrying specific vibrations',
      'Name Vibration: Overall energy of your complete name',
      'Name Changes: How name modifications affect your numerology',
      'Nicknames and Variations: Different name forms revealing different aspects'
    ],
    useCases: [
      'Understanding personality traits',
      'Career and talent identification',
      'Relationship compatibility',
      'Choosing business names',
      'Considering name changes',
      'Understanding name influence',
      'Personal growth and self-awareness'
    ],
    whyItMatters: 'Name Analysis reveals how your name influences your personality, talents, and life path. It helps you understand your authentic nature, recognize your strengths, and make informed decisions about name variations. Whether you\'re exploring your identity, choosing a business name, or considering a name change, name analysis provides valuable insights into how names shape who you are.'
  },
  'lenormand': {
    slug: 'lenormand',
    name: 'Lenormand',
    icon: '🎴',
    description: '36-card fortune telling system',
    overview: 'Lenormand is a card divination system using 36 cards with simple, everyday imagery (like Anchor, Tree, Snake, Heart). Unlike Tarot\'s archetypal symbolism, Lenormand cards represent concrete situations, people, and events. The system is known for its literal, practical readings that provide clear answers about daily life, relationships, and specific situations. Named after the famous French fortune teller Mademoiselle Lenormand.',
    howItWorks: 'Lenormand readings use the 36-card deck in various spreads, most commonly the Grand Tableau (all 36 cards) or smaller spreads. Cards are read in combination with adjacent cards, creating a narrative. Unlike Tarot, Lenormand cards have fixed meanings and are read literally rather than symbolically. The system emphasizes card combinations, proximity, and directional reading to provide clear, practical guidance about real-life situations.',
    keyConcepts: [
      '36 Cards: Simple, literal imagery representing concrete situations',
      'Card Combinations: Adjacent cards modifying each other\'s meanings',
      'Grand Tableau: Layout using all 36 cards for comprehensive reading',
      'Literal Meanings: Cards interpreted directly rather than symbolically',
      'Card Proximity: Cards near each other influencing each other',
      'Directional Reading: Reading cards in specific directions',
      'Practical Focus: Emphasis on real-life situations and events'
    ],
    useCases: [
      'Daily life guidance',
      'Specific situation answers',
      'Relationship insights',
      'Career and financial questions',
      'Timing events',
      'Practical decision-making',
      'Understanding concrete situations'
    ],
    whyItMatters: 'Lenormand provides straightforward, practical answers to everyday questions and situations. Its literal approach makes it accessible and clear, offering concrete guidance rather than abstract symbolism. Whether you\'re facing daily decisions, relationship questions, or practical concerns, Lenormand delivers clear, actionable insights.'
  },
  'vastu': {
    slug: 'vastu',
    name: 'Vastu',
    icon: '🏠',
    description: 'Indian architectural harmony system',
    overview: 'Vastu Shastra is the ancient Indian science of architecture and design, creating harmonious living and working spaces aligned with natural forces and cosmic energies. Similar to Feng Shui but with Indian philosophical foundations, Vastu provides guidelines for building orientation, room placement, colors, and spatial arrangements to enhance health, wealth, relationships, and overall well-being. It\'s based on the five elements, directional energies, and cosmic principles.',
    howItWorks: 'Vastu analyzes your space based on cardinal directions, the five elements (Earth, Water, Fire, Air, Space), and cosmic energies. Each direction has specific qualities and is ruled by different deities and planets. The system provides guidelines for: building orientation (facing specific directions), room placement (kitchen in southeast, bedroom in southwest, etc.), colors and materials for each direction, and spatial arrangements to optimize energy flow and support your goals.',
    keyConcepts: [
      'Directional Energies: Each cardinal direction has specific qualities',
      'Five Elements: Earth, Water, Fire, Air, Space - fundamental energies',
      'Room Placement: Optimal locations for different rooms',
      'Directional Deities: Deities and planets ruling each direction',
      'Vastu Purusha: Cosmic being whose body maps the building',
      'Energy Flow: Creating harmonious flow of positive energies',
      'Remedial Measures: Corrections for Vastu imbalances'
    ],
    useCases: [
      'Home and office design',
      'Building new structures',
      'Enhancing wealth and prosperity',
      'Improving relationships',
      'Health and wellness',
      'Business success',
      'Creating harmonious living spaces'
    ],
    whyItMatters: 'Vastu recognizes that your living and working spaces directly influence your life, health, and success. By aligning your space with natural and cosmic energies, you create an environment that supports your goals and well-being. Whether you\'re building a new home, arranging an office, or seeking to improve existing spaces, Vastu provides time-tested principles for creating harmonious, supportive environments.'
  },
  'human-design': {
    slug: 'human-design',
    name: 'Human Design',
    icon: '🧬',
    description: 'Modern synthesis of astrology, I Ching, Kabbalah, and chakras',
    overview: 'Human Design is a modern system synthesizing astrology, the I Ching, Kabbalah, and the chakra system to create a unique map of your authentic nature. It reveals your "Type" (how you\'re designed to interact with the world), "Strategy" (how to make decisions), and "Authority" (how to know what\'s correct for you). Human Design helps you understand your true nature and live authentically according to your design.',
    howItWorks: 'Human Design creates a BodyGraph (chart) based on your birth date, time, and place. The chart shows 64 gates (from I Ching) positioned in 9 centers (chakras), with defined and undefined centers revealing your design. The system identifies your Type (Manifestor, Generator, Projector, Reflector), Strategy (how to respond to life), Authority (inner decision-making), Profile (life role), and Definition (how your centers connect). It provides practical guidance for living authentically.',
    keyConcepts: [
      'Four Types: Manifestor, Generator, Projector, Reflector - how you interact with the world',
      'Strategy: How to make decisions and interact (wait, respond, inform, wait for invitation)',
      'Inner Authority: How to know what\'s correct for you (emotional, sacral, splenic, etc.)',
      'Nine Centers: Energy centers (chakras) - defined vs undefined',
      '64 Gates: I Ching hexagrams positioned in centers',
      'Profile: Your life role and how you interact',
      'Conditioning: How undefined centers are influenced by others'
    ],
    useCases: [
      'Understanding authentic nature',
      'Decision-making guidance',
      'Career and life path',
      'Relationship compatibility',
      'Personal growth and self-awareness',
      'Living authentically',
      'Understanding your design'
    ],
    whyItMatters: 'Human Design provides a unique synthesis of ancient wisdom systems, offering practical guidance for living authentically. It helps you understand your true nature, make decisions aligned with your design, and navigate life according to your authentic blueprint. Whether you\'re exploring your purpose, making decisions, or seeking self-understanding, Human Design offers a comprehensive framework for authentic living.'
  },
  'geomancy': {
    slug: 'geomancy',
    name: 'Geomancy',
    icon: '🌍',
    description: 'Earth-based divination system',
    overview: 'Geomancy is an ancient divination system that interprets patterns formed by marking dots in sand, earth, or paper. The system creates 16 geomantic figures (combinations of single and double dots) that answer questions and provide guidance. Geomancy combines earth-based divination with astrological correspondences, creating a unique system that bridges earth and cosmos. It was popular in medieval Europe and the Islamic world.',
    howItWorks: 'Geomancy begins with a question. The diviner makes random marks (dots) in four rows, creating patterns of single and double dots. These patterns form 16 possible geomantic figures, each with specific meanings. The figures are arranged in a shield chart, with the first four figures (Mothers) generating four more (Daughters), then four more (Nephews), and finally figures representing the querent, question, outcome, and judge. The system interprets these figures and their positions.',
    keyConcepts: [
      '16 Geomantic Figures: Combinations of dots creating specific patterns',
      'Shield Chart: Layout organizing geomantic figures',
      'Mothers, Daughters, Nephews: Figures generated from each other',
      'Astrological Correspondences: Figures linked to planets and signs',
      'Judging Figure: Final figure determining the answer',
      'Figure Meanings: Each figure representing specific concepts',
      'Earth Connection: Divination through earth-based patterns'
    ],
    useCases: [
      'Answering specific questions',
      'Receiving guidance on decisions',
      'Understanding situations',
      'Timing events',
      'Practical divination',
      'Earth-based spiritual practice',
      'Medieval divination methods'
    ],
    whyItMatters: 'Geomancy offers a unique earth-based divination system that combines practicality with mystical tradition. Its structured approach provides clear answers while maintaining connection to natural elements. Whether you\'re seeking guidance, exploring traditional divination methods, or connecting with earth-based practices, geomancy offers a distinctive approach to divination.'
  },
  'energy-healing': {
    slug: 'energy-healing',
    name: 'Energy & Healing',
    icon: '✨',
    description: 'Holistic energy work: Chakra Analysis, Aura Reading, Reiki, Crystal Healing, and Energy Balancing',
    overview: 'Energy & Healing encompasses various holistic practices that work with the body\'s energy systems to promote healing, balance, and well-being. This includes Chakra Analysis (examining energy centers), Aura Reading (interpreting energy fields), Reiki (universal life force energy), Crystal Healing (using crystal energies), and Energy Balancing (harmonizing energy flow). These practices recognize that physical, emotional, and spiritual health are interconnected through energy systems.',
    howItWorks: 'Energy healing works with subtle energy systems: Chakras (seven main energy centers along the spine), Aura (energy field surrounding the body), Meridians (energy pathways), and the overall energy field. Practitioners use various techniques: hands-on or hands-off energy work, crystals, visualization, sound, and intention to clear blockages, balance energy flow, and restore harmony. The system addresses imbalances at the energy level before they manifest as physical or emotional issues.',
    keyConcepts: [
      'Seven Chakras: Energy centers from root to crown',
      'Aura: Energy field surrounding the body with multiple layers',
      'Energy Blockages: Imbalances preventing healthy energy flow',
      'Reiki: Universal life force energy channeled for healing',
      'Crystal Healing: Using crystal energies for balance and healing',
      'Energy Balancing: Harmonizing energy flow throughout the system',
      'Holistic Approach: Addressing physical, emotional, and spiritual levels'
    ],
    useCases: [
      'Physical healing and wellness',
      'Emotional balance and healing',
      'Stress reduction and relaxation',
      'Chakra balancing and alignment',
      'Energy clearing and purification',
      'Spiritual growth and development',
      'Complementary healing practices'
    ],
    whyItMatters: 'Energy healing recognizes that health and well-being extend beyond the physical body to include energy systems. By working with these subtle energies, you can address imbalances at their source, promote healing, and maintain optimal health. Whether you\'re dealing with physical issues, emotional challenges, or spiritual growth, energy healing offers holistic approaches to well-being.'
  },
  'scrying': {
    slug: 'scrying',
    name: 'Scrying',
    icon: '🪞',
    description: 'Crystal ball and mirror scrying',
    overview: 'Scrying is the ancient art of divination by gazing into reflective or translucent surfaces to receive visions, insights, and guidance. Traditional methods include crystal ball gazing, mirror scrying (using black mirrors), water scrying, and fire scrying. The practice involves entering a meditative state and allowing images, symbols, or impressions to appear in the scrying surface, accessing intuitive and spiritual guidance.',
    howItWorks: 'Scrying begins with preparing a scrying surface (crystal ball, black mirror, water, etc.) and entering a meditative, relaxed state. The practitioner gazes into the surface without focusing the eyes, allowing the mind to enter a receptive state. Images, symbols, colors, or impressions may appear in the surface, which are then interpreted for guidance. The practice combines relaxation, intuition, and symbolic interpretation to access subconscious wisdom and spiritual guidance.',
    keyConcepts: [
      'Scrying Surfaces: Crystal balls, black mirrors, water, fire, etc.',
      'Meditative State: Relaxed, receptive consciousness for visions',
      'Vision Interpretation: Understanding symbols and images',
      'Intuitive Access: Tapping into subconscious and spiritual wisdom',
      'Historical Tradition: Ancient practice across cultures',
      'Symbolic Language: Images and symbols conveying messages',
      'Spiritual Connection: Accessing guidance from higher sources'
    ],
    useCases: [
      'Receiving spiritual guidance',
      'Accessing intuitive insights',
      'Divination and prophecy',
      'Meditation and contemplation',
      'Spiritual development',
      'Answering questions',
      'Exploring the subconscious'
    ],
    whyItMatters: 'Scrying offers a direct method for accessing intuitive wisdom and spiritual guidance through visual meditation. It connects you with deeper levels of consciousness and provides insights that complement rational thinking. Whether you\'re seeking guidance, exploring your intuition, or developing spiritual abilities, scrying offers a powerful tool for accessing inner and outer wisdom.'
  },
  'mundane-astrology': {
    slug: 'mundane-astrology',
    name: 'Mundane Astrology',
    icon: '🌐',
    description: 'World events and political astrology',
    overview: 'Mundane Astrology applies astrological principles to world events, politics, economics, weather, and collective human experiences. Rather than focusing on individual charts, mundane astrology analyzes charts for nations, cities, events, and global phenomena. It predicts and explains world events, political changes, economic cycles, natural disasters, and cultural trends through astrological analysis.',
    howItWorks: 'Mundane Astrology uses charts for significant events (like presidential inaugurations, natural disasters, economic events), ingress charts (when planets enter signs), eclipses, and national charts. The system analyzes planetary positions, aspects, and transits affecting nations, regions, and global events. It interprets how planetary cycles influence political changes, economic trends, weather patterns, and collective human experiences on a large scale.',
    keyConcepts: [
      'Ingress Charts: Charts for planets entering signs (especially Aries ingress)',
      'Eclipses: Solar and lunar eclipses affecting world events',
      'National Charts: Birth charts for nations and countries',
      'Event Charts: Charts for significant world events',
      'Planetary Cycles: Long-term cycles affecting global trends',
      'Political Astrology: Astrological analysis of political events',
      'Economic Cycles: Astrological patterns in economics'
    ],
    useCases: [
      'Understanding world events',
      'Predicting political changes',
      'Economic trend analysis',
      'Weather and natural disaster prediction',
      'Cultural trend understanding',
      'Global cycle awareness',
      'Historical event analysis'
    ],
    whyItMatters: 'Mundane Astrology provides insights into world events and global patterns, helping you understand the larger forces shaping our world. It reveals the astrological influences behind political changes, economic cycles, and cultural trends. Whether you\'re studying world events, understanding global patterns, or seeking awareness of collective influences, mundane astrology offers valuable perspective.'
  },
  'akashic-records': {
    slug: 'akashic-records',
    name: 'Akashic Records',
    icon: '📚',
    description: 'Access to the universal library of souls',
    overview: 'The Akashic Records are believed to be a universal library containing all thoughts, events, experiences, and knowledge - past, present, and future. Accessing the Records provides insights into your soul\'s journey, past lives, karmic patterns, and spiritual purpose. The Records are accessed through meditation, prayer, or guided practices, offering profound wisdom about your soul\'s evolution and purpose.',
    howItWorks: 'Accessing the Akashic Records typically involves entering a meditative state, using specific prayers or mantras, and connecting with the Records through intention. Once connected, you may receive information through visions, feelings, thoughts, or direct knowing. The Records reveal information about your soul\'s journey, past lives, karmic patterns, life purpose, and guidance for your current incarnation. The information is received intuitively and interpreted for practical application.',
    keyConcepts: [
      'Universal Library: Repository of all knowledge and experiences',
      'Soul Journey: Your soul\'s evolution across lifetimes',
      'Past Lives: Previous incarnations and their influences',
      'Karmic Patterns: Patterns from past lives affecting current life',
      'Spiritual Purpose: Your soul\'s mission and purpose',
      'Soul Records: Individual soul\'s record within the universal Records',
      'Access Methods: Meditation, prayer, guided practices for connection'
    ],
    useCases: [
      'Understanding soul purpose',
      'Exploring past lives',
      'Understanding karmic patterns',
      'Spiritual guidance',
      'Life purpose clarity',
      'Healing past-life traumas',
      'Spiritual development'
    ],
    whyItMatters: 'The Akashic Records provide profound insights into your soul\'s journey and purpose, helping you understand patterns, heal past-life influences, and align with your spiritual mission. Whether you\'re exploring your purpose, understanding karmic patterns, or seeking spiritual guidance, accessing the Records offers deep wisdom about your soul\'s evolution.'
  },
  'astrocartography': {
    slug: 'astrocartography',
    name: 'Astrocartography',
    icon: '🗺️',
    description: 'Location-based activation: where planetary energies are strongest',
    overview: 'Astrocartography is a location-based activation system. It works with planetary meridian lines (MC, IC, ASC, DSC), angular planetary strength by geography, relocation influence, and proximity to planetary lines. It answers where certain life themes activate, which places support career, love, growth, or retreat, and why a location feels supportive or challenging. It does not guarantee success, replace personal effort, give exact event timing, or decide fate—it indicates energetic activation, not certainty.',
    howItWorks: 'Astrocartography calculates planetary lines that cross the Earth\'s surface based on your birth chart. Each planet creates multiple lines (Ascendant, Midheaven, Descendant, and IC lines) where its influence is particularly strong. These lines indicate locations where you experience heightened planetary energies—positive or challenging—depending on the planet and angle. Developed by Jim Lewis, the system maps your birth chart onto the world to reveal where specific energies are strongest for you.',
    keyConcepts: [
      'Planetary Lines: Meridian lines (MC, IC, ASC, DSC) where planetary influences are strongest',
      'Angular Strength: How geography affects the strength of planetary activation',
      'Relocation Influence: How moving changes which energies are emphasized',
      'Proximity to Lines: Being near a line amplifies that planet\'s themes',
      'Activation vs Prediction: Shows where energies activate, not what will happen',
      'Power Places: Locations where specific planetary energies are strongest for you'
    ],
    useCases: [
      'Relocation: Is this city good for my career? Where should I move for growth?',
      'Travel: Is this place supportive for launching a project? Where do I feel more aligned?',
      'Comparative: Which of these two cities suits me better? Does this place align with my goals?',
      'Understanding: Why did I struggle in a certain country? Why did I feel more confident there?'
    ],
    whyItMatters: 'Astrocartography reveals how geography interacts with your birth chart, showing where you experience the strongest planetary influences. It is invaluable for relocation decisions, travel planning, and understanding how different locations can support different aspects of your life—while always emphasizing activation of energies, not guaranteed outcomes.'
  },
  'ogham': {
    slug: 'ogham',
    name: 'Ogham',
    icon: '🌿',
    description: 'Celtic Ogham tree alphabet',
    overview: 'Ogham is an ancient Celtic alphabet and divination system using 20 symbols (and sometimes 5 additional) representing trees and natural elements. Each Ogham symbol (called a "feda" or "few") corresponds to a tree, carries specific meanings, and is used for divination, magic, and communication. The system connects you with Celtic wisdom, nature, and the power of trees and natural forces.',
    howItWorks: 'Ogham divination uses wooden staves, stones, or cards inscribed with Ogham symbols. You draw symbols (typically three or more) and interpret their meanings based on traditional associations with trees, natural elements, and Celtic mythology. Each symbol represents a tree (like Birch, Rowan, Ash, Alder) and carries specific meanings related to that tree\'s qualities, Celtic lore, and natural symbolism. The symbols are interpreted individually and in combination.',
    keyConcepts: [
      '20 Ogham Symbols: Basic alphabet representing trees',
      'Tree Correspondences: Each symbol linked to a specific tree',
      'Celtic Wisdom: Connections to Celtic mythology and lore',
      'Natural Elements: Symbols representing earth, water, fire, air',
      'Ogham Staves: Wooden pieces inscribed with symbols',
      'Symbol Meanings: Each symbol carrying specific interpretations',
      'Celtic Connection: Linking with ancient Celtic traditions'
    ],
    useCases: [
      'Receiving guidance through Celtic wisdom',
      'Connecting with nature and trees',
      'Understanding Celtic traditions',
      'Divination and guidance',
      'Spiritual practice',
      'Nature-based spirituality',
      'Cultural and historical exploration'
    ],
    whyItMatters: 'Ogham offers a unique connection to Celtic wisdom and natural forces through tree symbolism. It provides guidance while connecting you with ancient traditions and the natural world. Whether you\'re exploring Celtic culture, connecting with nature, or seeking guidance through tree wisdom, Ogham offers a distinctive divination system.'
  },
  'bibliomancy': {
    slug: 'bibliomancy',
    name: 'Bibliomancy',
    icon: '📖',
    description: 'Sacred Text Divination - Guidance through Bible, Quran, Bhagavad Gita, and more',
    overview: 'Bibliomancy (Sacred Text Divination) is the ancient practice of seeking divine guidance by randomly selecting passages from sacred texts. This timeless method has been used across cultures and faiths for centuries. Choose from multiple sacred texts including the Bible, Quran, Bhagavad Gita, Torah, and Divan of Hafez. Each selected passage is interpreted as personalized guidance for your question or life situation, offering wisdom, comfort, and spiritual direction from the world\'s most sacred writings.',
    howItWorks: 'Bibliomancy begins with selecting your sacred text - choose from the Bible, Quran, Bhagavad Gita, Torah, or Divan of Hafez. Then, either ask a specific question or seek comprehensive guidance. The system randomly selects passages from your chosen text, which are then interpreted as guidance for your question or life situation. The interpretation considers the literal meaning, symbolic significance, and how it relates to your situation, providing personalized insights across all areas of life.',
    keyConcepts: [
      'Multiple Sacred Texts: Choose from Bible, Quran, Bhagavad Gita, Torah, or Divan of Hafez',
      'Random Selection: Chance-based passage selection from your chosen text',
      'Text Interpretation: Finding meaning in selected passages specific to each tradition',
      'Spiritual Intention: Combining chance with prayer or intention',
      'Historical Practice: Ancient method used across cultures and faiths',
      'Symbolic Meaning: Interpreting passages symbolically within each tradition',
      'Guidance Reception: Receiving answers through written wisdom from multiple faith traditions',
      'Inclusive Practice: Honoring diverse spiritual paths and sacred texts'
    ],
    useCases: [
      'Receiving spiritual guidance from your chosen sacred text',
      'Answering questions through divine wisdom',
      'Seeking wisdom from multiple faith traditions',
      'Spiritual practice across different religions',
      'Decision-making support from sacred texts',
      'Meditation and reflection on sacred passages',
      'Connecting with sacred wisdom from various traditions',
      'Exploring guidance from different spiritual perspectives'
    ],
    whyItMatters: 'Bibliomancy provides a simple, accessible method for receiving guidance through sacred texts from multiple faith traditions. Whether you connect with the Bible, Quran, Bhagavad Gita, Torah, Divan of Hafez, or other revered scriptures, this practice combines the wisdom of written works with spiritual intention, offering insights and answers when you need guidance. It\'s an inclusive practice that honors diverse spiritual paths while providing personalized divine guidance for your questions and life journey.'
  },
  'sortilege': {
    slug: 'sortilege',
    name: 'Sortilege Divination',
    icon: '🪄',
    description: 'Cast lots through dice, stones, cards, coins, or sticks to receive divine guidance',
    overview: 'Sortilege (from Latin "sortilegium", meaning "divination by lots") is an ancient practice of casting or drawing lots to gain insight into questions and predict outcomes. This comprehensive system supports multiple casting methods: dice (cleromancy), stones (lithomancy), cards (cartomancy), coins (I Ching style), and sticks. Sortilege emphasizes the element of chance and synchronicity, where the random selection of objects reveals meaningful guidance through their positions, symbols, and traditional interpretations.',
    howItWorks: 'Sortilege divination works by casting or drawing objects (lots) and interpreting their results. You ask a question, choose a casting method (dice, stones, cards, coins, or sticks), and the system performs the cast. The positions, orientations, symbols, and values of the cast objects are analyzed according to traditional meanings. For dice, both dice must land inside a circle for the reading to be valid. For stones and sticks, their positions and proximity reveal patterns. Cards show their symbols and orientations (upright or reversed). Coins generate hexagram lines for I Ching interpretation. The system then generates a comprehensive AI-powered report that combines the cast results with your profile data for personalized insights.',
    keyConcepts: [
      'Cleromancy: Divination by casting lots (dice, stones, etc.)',
      'Multiple Methods: Dice, stones, cards, coins, and sticks',
      'Position Interpretation: Reading meaning from object positions',
      'Symbol Analysis: Understanding symbols and their traditional meanings',
      'Circle Casting: Dice must land inside a sacred circle',
      'Synchronicity: Meaningful coincidences in random selection',
      'Profile Integration: Personalized insights based on birth data',
      'Historical Context: Ancient practices from Rome, China, and other cultures'
    ],
    useCases: [
      'Answering specific questions through casting lots',
      'Decision-making support with multiple divination methods',
      'Receiving guidance on relationships, career, or life path',
      'Exploring different casting methods to find what resonates',
      'Combining chance-based divination with personalized insights',
      'Accessing ancient wisdom through traditional practices',
      'Understanding synchronicity and meaningful coincidences'
    ],
    whyItMatters: 'Sortilege offers a comprehensive and flexible approach to divination, combining multiple ancient methods to provide guidance. By casting lots through various objects, you access different perspectives and can find the method that resonates most with your question. The practice recognizes that chance and synchronicity play a role in selecting the right guidance at the right time. With profile-based personalization, sortilege provides both traditional interpretations and modern AI-powered insights tailored to your unique astrological and personal context.'
  },
  'navaratna-planetary-stones': {
    slug: 'navaratna-planetary-stones',
    name: 'Navaratna & Planetary Stones',
    icon: '💎',
    description: 'Personalized gemstone recommendations based on Vedic astrology and Navaratna principles',
    overview: 'Navaratna (Nine Gemstones) is a powerful Vedic remedial system that uses nine precious gemstones corresponding to the nine planets (Navagrahas) in Vedic astrology. Each gemstone channels the cosmic energy of its ruling planet, helping to strengthen favorable planetary influences and mitigate negative effects. This tool analyzes your birth chart to recommend personalized gemstones based on your Lagnesh (Ascendant Lord), planetary strengths, current Dasha period, and benefic/malefic analysis. The system provides detailed wearing instructions, mantras, purification methods, and weight recommendations for each gemstone.',
    howItWorks: 'The Navaratna analysis begins by calculating your Vedic birth chart using your exact birth date, time, and place. The system identifies your Lagnesh (Ascendant Lord) - the planet ruling your 1st house, which determines your Life Stone. It then analyzes each planet\'s strength, dignity, house placement, and functional benefic/malefic status based on your Ascendant. The system considers your current Dasha period to recommend gemstones that enhance favorable planetary influences. It identifies and avoids Maraka (Killer) planets and malefic influences. For each recommended gemstone, you receive detailed instructions including the correct day, time, metal, finger, mantra, purification method, and weight guidelines. The system also provides safety warnings and contraindications.',
    keyConcepts: [
      'Navaratna: Nine gemstones corresponding to nine planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)',
      'Lagnesh (Ascendant Lord): The planet ruling your 1st house, determines your Life Stone',
      'Life Stone: Primary gemstone recommendation based on Lagnesh, worn for overall well-being',
      'Benefic Planets: Natural benefics (Jupiter, Venus) and functional benefics based on your chart',
      'Malefic Planets: Natural malefics (Sun, Mars, Saturn, Rahu, Ketu) and functional malefics',
      'Maraka (Killer) Planets: Lords of 2nd and 7th houses - should be avoided',
      'Dasha Integration: Current planetary period influences gemstone recommendations',
      'Functional Benefic/Malefic: Determined by house lordship relative to your Ascendant',
      'Weight Calculation: Based on 1/10th of body weight, typically 5-8 Ratti (4.5-7.3 carats)',
      'Wearing Instructions: Specific day, time, metal, finger, hand, mantra, and purification for each gemstone',
      'Purification: Gemstones must be purified with Ganga Jal or Cow Milk before wearing',
      'Mantra Chanting: Each gemstone has a specific mantra to be chanted 108 times',
      'Testing Period: Some gemstones (especially Blue Sapphire) require a 3-7 day testing period'
    ],
    useCases: [
      'Finding your Life Stone based on Lagnesh for overall well-being',
      'Strengthening weak but beneficial planets in your chart',
      'Enhancing current Dasha period effects with appropriate gemstones',
      'Avoiding harmful gemstones for malefic or Maraka planets',
      'Receiving detailed wearing instructions for each recommended gemstone',
      'Understanding weight requirements and metal preferences',
      'Learning mantras and purification methods for gemstone activation',
      'Getting personalized recommendations based on your unique birth chart',
      'Understanding which gemstones to avoid and why',
      'Receiving safety warnings and contraindications'
    ],
    whyItMatters: 'Navaratna gemstones are powerful remedial measures (Upay) in Vedic astrology, used for thousands of years to balance planetary energies and enhance favorable influences. Unlike generic gemstone recommendations, this tool provides personalized analysis based on your unique birth chart, ensuring you wear gemstones that are truly beneficial for you. The system carefully avoids harmful combinations, especially Maraka planets and malefic influences that could cause negative effects. By following the detailed instructions for wearing, purification, and mantra chanting, you can safely harness the cosmic energy of gemstones to support your life journey. The tool emphasizes safety and proper consultation, recognizing that gemstone therapy is a serious practice that requires careful consideration.'
  },
  'daily-decisions': {
    slug: 'daily-decisions',
    name: 'Daily Decisions',
    icon: '📅',
    description: 'Personalized Vedic astrology guidance for daily life decisions',
    overview: 'Daily Decisions is a personalized Vedic astrology tool that provides guidance for everyday life activities based on your unique birth chart (Janma Kundli). The system analyzes your Janma Nakshatra (birth star), Janma Tithi (birth lunar day), current Dasha period, planetary transits, and daily Panchanga to recommend the best times for financial transactions (lending, borrowing, paying debts) and grooming activities (haircuts, cutting nails, applying hair oil). It also calculates location-specific Rahu Kaal and Gulika Kaal (inauspicious time periods) to help you avoid unfavorable timings.',
    howItWorks: 'The Daily Decisions tool uses your complete birth data (date, time, place) to calculate your Vedic birth chart. It identifies your Janma Nakshatra and Janma Tithi from your birth Panchanga, determines your current Dasha period, and analyzes your Ascendant and Moon sign. For any selected date, it calculates the current Panchanga (Tithi, Nakshatra, Vara, Yoga) and determines Rahu Kaal and Gulika Kaal based on sunrise/sunset times for your location. The system then applies traditional Vedic rules for each activity type, considering your personal chart factors like Dasha, Janma Nakshatra, and Janma Tithi to provide personalized recommendations with scores (0-100) indicating the favorability of performing each activity.',
    keyConcepts: [
      'Janma Nakshatra: Your birth star (27 lunar mansions) - avoid activities on your Janma Nakshatra day',
      'Janma Tithi: Your birth lunar day - avoid haircuts/nails on your Janma Tithi',
      'Dasha Period: Current planetary period (Mahadasha) affecting your life - malefic Dasha requires caution',
      'Panchanga: Five elements of time (Tithi, Nakshatra, Yoga, Karana, Vara) for any given day',
      'Rahu Kaal: Inauspicious period (1/8th of daylight) varying by weekday - avoid starting new activities',
      'Gulika Kaal: Another inauspicious period (1/8th of daylight) - avoid important activities',
      'Vara (Weekday): Each day ruled by a planet (Sun=Sunday, Moon=Monday, etc.) - influences activity favorability',
      'Personalization: Recommendations differ based on your unique chart, not generic advice',
      'Location-Specific: Rahu Kaal and Gulika Kaal calculated based on your location\'s sunrise/sunset times',
      'Score System: Each recommendation includes a score (0-100) indicating favorability level'
    ],
    useCases: [
      'Determining the best day to lend money to others',
      'Finding favorable times to borrow money or take loans',
      'Choosing optimal days to pay back debts (especially using Gulika time on Tuesday)',
      'Planning haircuts on auspicious days (avoiding Saturday, Tuesday, and your Janma Nakshatra/Tithi)',
      'Timing nail cutting (fingers and toes) based on your chart',
      'Deciding when to apply hair oil (avoiding Thursday and Saturday)',
      'Avoiding Rahu Kaal and Gulika Kaal for important activities',
      'Understanding how your current Dasha period affects daily decisions',
      'Getting personalized guidance based on your Janma Nakshatra and Tithi',
      'Aligning daily activities with cosmic timings for better outcomes'
    ],
    whyItMatters: 'Daily Decisions brings ancient Vedic wisdom into your modern life, providing personalized guidance for everyday activities that many people follow in traditional Indian culture. Unlike generic horoscopes, this tool uses your exact birth chart to give you specific, actionable advice. By aligning your actions with favorable cosmic timings and avoiding inauspicious periods like Rahu Kaal and Gulika Kaal, you can potentially reduce obstacles and enhance positive outcomes. The system respects traditional beliefs while providing clear, personalized recommendations with scores to help you make informed decisions about when to perform important daily activities. This tool is particularly valuable for those who follow Vedic traditions and want to incorporate astrological timing into their daily routine.'
  }
};

export function getToolIntroduction(slug: string): ToolIntroduction | undefined {
  return TOOL_INTRODUCTIONS[slug];
}

export function getAllToolIntroductions(): ToolIntroduction[] {
  return Object.values(TOOL_INTRODUCTIONS);
}

