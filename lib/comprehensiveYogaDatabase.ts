// COMPREHENSIVE VEDIC YOGA DATABASE
// 100+ Classical Vedic Yogas with detection rules, descriptions, effects, and remedies

export interface YogaDefinition {
  name: string;
  type: 'Raj Yoga' | 'Dhana Yoga' | 'Kala Yoga' | 'Arishta Yoga' | 'Special' | 'Nabhasa Yoga';
  category: string;
  description: string;
  detectionRule: YogaDetectionRule;
  effects: {
    positive: string[];
    negative?: string[];
    manifestation: string;
  };
  strength: {
    base: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
    modifiers: StrengthModifier[];
  };
  remedies: YogaRemedy;
  timing: {
    activationPeriod: string;
    peakEffect: string;
    duration: string;
  };
  traditionalTexts: string[];
}

export interface YogaDetectionRule {
  type: 'planetary_combination' | 'house_lord' | 'aspect' | 'dignity' | 'nakshatra' | 'complex';
  conditions: YogaCondition[];
  requiresAll?: boolean; // true = AND, false = OR
}

export interface YogaCondition {
  planet?: string;
  planets?: string[];
  house?: number;
  houses?: number[];
  sign?: number;
  signs?: number[];
  dignity?: 'exalted' | 'debilitated' | 'own_sign' | 'moolatrikona' | 'friend' | 'enemy';
  aspect?: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  nakshatra?: string;
  relationship?: 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'apoklima';
  customCheck?: string; // For complex conditions
}

export interface StrengthModifier {
  condition: string;
  impact: number; // -50 to +50
}

export interface YogaRemedy {
  mantras: RemedyDetail[];
  gemstones: RemedyDetail[];
  rituals: RemedyDetail[];
  lifestyle: RemedyDetail[];
  charity: RemedyDetail[];
  timing: string;
}

export interface RemedyDetail {
  name: string;
  description: string;
  instructions: string[];
  frequency: string;
  benefits: string[];
}

// ============================================================================
// RAJ YOGAS (Royal Combinations - Power, Authority, Success)
// ============================================================================

export const RAJ_YOGAS: YogaDefinition[] = [
  {
    name: "Gajakesari Yoga",
    type: "Raj Yoga",
    category: "Wealth & Wisdom",
    description: "Jupiter and Moon in mutual Kendra (1st, 4th, 7th, 10th houses from each other). This powerful yoga creates an individual with elephant-like strength and lion-like courage, blessed with wisdom, wealth, and respect.",
    detectionRule: {
      type: 'complex',
      conditions: [
        { planets: ['Jupiter', 'Moon'], relationship: 'kendra' }
      ],
      requiresAll: true
    },
    effects: {
      positive: [
        "Exceptional intelligence and wisdom",
        "Financial prosperity and wealth accumulation",
        "High social status and respect in society",
        "Strong moral character and integrity",
        "Success in education and scholarly pursuits",
        "Good health and longevity",
        "Blessed with vehicles and properties"
      ],
      manifestation: "Native becomes a leader in their field, commands respect, and enjoys material comforts while maintaining spiritual values."
    },
    strength: {
      base: "Very Strong",
      modifiers: [
        { condition: "Jupiter exalted", impact: 20 },
        { condition: "Moon in bright paksha", impact: 15 },
        { condition: "Both in Kendra from ascendant", impact: 10 },
        { condition: "Jupiter retrograde", impact: -10 }
      ]
    },
    remedies: {
      mantras: [
        {
          name: "Guru Mantra",
          description: "Mantra to strengthen Jupiter",
          instructions: ["Chant 'Om Gurave Namaha' 108 times", "Best done on Thursdays", "Face northeast while chanting"],
          frequency: "Daily, especially Thursdays",
          benefits: ["Enhances wisdom", "Attracts prosperity", "Strengthens yoga effects"]
        },
        {
          name: "Chandra Mantra",
          description: "Mantra to strengthen Moon",
          instructions: ["Chant 'Om Chandraya Namaha' 108 times", "Best done on Mondays", "Chant during evening"],
          frequency: "Daily, especially Mondays",
          benefits: ["Emotional stability", "Mental clarity", "Enhances intuition"]
        }
      ],
      gemstones: [
        {
          name: "Yellow Sapphire (Pukhraj)",
          description: "Primary gemstone for Jupiter",
          instructions: ["Wear in gold ring", "On index finger of right hand", "Minimum 3 carats", "Consecrate on Thursday morning"],
          frequency: "Wear continuously",
          benefits: ["Amplifies Jupiter's blessings", "Attracts wealth", "Enhances wisdom"]
        },
        {
          name: "Pearl (Moti)",
          description: "Primary gemstone for Moon",
          instructions: ["Wear in silver ring", "On little finger of right hand", "Minimum 5 carats", "Consecrate on Monday evening"],
          frequency: "Wear continuously",
          benefits: ["Emotional balance", "Mental peace", "Enhances Moon's positive effects"]
        }
      ],
      rituals: [
        {
          name: "Thursday Fasting",
          description: "Fast dedicated to Jupiter",
          instructions: ["Fast on Thursdays", "Eat yellow foods", "Donate yellow items", "Visit Jupiter temple"],
          frequency: "Weekly on Thursdays",
          benefits: ["Pleases Jupiter", "Removes obstacles", "Attracts prosperity"]
        },
        {
          name: "Monday Moon Worship",
          description: "Worship dedicated to Moon",
          instructions: ["Offer white flowers to Moon", "Donate white items", "Wear white clothes", "Drink milk"],
          frequency: "Weekly on Mondays",
          benefits: ["Strengthens Moon", "Emotional healing", "Mental clarity"]
        }
      ],
      lifestyle: [
        {
          name: "Knowledge Sharing",
          description: "Share wisdom with others",
          instructions: ["Teach or mentor others", "Share knowledge freely", "Support education", "Practice gratitude"],
          frequency: "Regular practice",
          benefits: ["Multiplies Jupiter's blessings", "Karmic merit", "Spiritual growth"]
        },
        {
          name: "Meditation Practice",
          description: "Daily meditation for mental clarity",
          instructions: ["Meditate daily", "Practice mindfulness", "Moon gazing on full moon", "Maintain emotional balance"],
          frequency: "Daily",
          benefits: ["Mental peace", "Emotional stability", "Spiritual advancement"]
        }
      ],
      charity: [
        {
          name: "Educational Charity",
          description: "Support education and learning",
          instructions: ["Donate books", "Support students", "Fund educational institutions", "Provide scholarships"],
          frequency: "Thursdays preferred",
          benefits: ["Jupiter's blessings", "Karmic purification", "Wealth multiplication"]
        }
      ],
      timing: "Best results during Jupiter Mahadasha or Antardasha, and on Thursdays during waxing moon"
    },
    timing: {
      activationPeriod: "Jupiter Mahadasha (16 years) and Moon Mahadasha (10 years)",
      peakEffect: "During Jupiter-Moon or Moon-Jupiter Antardasha periods",
      duration: "Lifelong effects with peak periods during relevant dashas"
    },
    traditionalTexts: ["Brihat Parashara Hora Shastra", "Phaladeepika", "Jataka Parijata"]
  },

  {
    name: "Chandra-Mangala Yoga",
    type: "Raj Yoga",
    category: "Wealth & Courage",
    description: "Moon and Mars together in the same house or in mutual aspect. Creates a dynamic personality with courage, determination, and wealth-generating abilities.",
    detectionRule: {
      type: 'planetary_combination',
      conditions: [
        { planets: ['Moon', 'Mars'], aspect: 'conjunction' }
      ],
      requiresAll: true
    },
    effects: {
      positive: [
        "Courage and bravery in difficult situations",
        "Strong willpower and determination",
        "Wealth through real estate and property",
        "Success in competitive fields",
        "Leadership abilities",
        "Quick decision-making skills",
        "Material prosperity"
      ],
      negative: [
        "Emotional impulsiveness if afflicted",
        "Tendency towards aggression",
        "Conflicts in relationships"
      ],
      manifestation: "Native becomes a successful entrepreneur or leader, excels in competitive environments, and accumulates wealth through bold ventures."
    },
    strength: {
      base: "Strong",
      modifiers: [
        { condition: "Mars in own sign or exalted", impact: 15 },
        { condition: "Moon in bright paksha", impact: 10 },
        { condition: "In Kendra or Trikona", impact: 15 },
        { condition: "Mars debilitated", impact: -20 }
      ]
    },
    remedies: {
      mantras: [
        {
          name: "Mangal Mantra",
          description: "Mantra to strengthen Mars",
          instructions: ["Chant 'Om Mangalaya Namaha' 108 times", "Best on Tuesdays", "Face south while chanting"],
          frequency: "Daily, especially Tuesdays",
          benefits: ["Enhances courage", "Removes obstacles", "Increases energy"]
        },
        {
          name: "Chandra Mantra",
          description: "Mantra for emotional balance",
          instructions: ["Chant 'Om Som Somaya Namaha' 108 times", "Best on Mondays"],
          frequency: "Daily, especially Mondays",
          benefits: ["Emotional stability", "Mental peace", "Balances Mars energy"]
        }
      ],
      gemstones: [
        {
          name: "Red Coral (Moonga)",
          description: "Primary gemstone for Mars",
          instructions: ["Wear in copper/gold ring", "On ring finger of right hand", "Minimum 5 carats", "Consecrate on Tuesday"],
          frequency: "Wear continuously",
          benefits: ["Boosts courage", "Enhances energy", "Protects from enemies"]
        },
        {
          name: "Pearl (Moti)",
          description: "Balancing gemstone for Moon",
          instructions: ["Wear in silver ring", "On little finger", "Consecrate on Monday"],
          frequency: "Wear continuously",
          benefits: ["Emotional balance", "Calms Mars aggression"]
        }
      ],
      rituals: [
        {
          name: "Hanuman Worship",
          description: "Worship Lord Hanuman for Mars",
          instructions: ["Visit Hanuman temple on Tuesdays", "Offer red flowers", "Recite Hanuman Chalisa", "Light oil lamp"],
          frequency: "Weekly on Tuesdays",
          benefits: ["Mars blessings", "Courage and strength", "Victory over enemies"]
        }
      ],
      lifestyle: [
        {
          name: "Physical Exercise",
          description: "Channel Mars energy positively",
          instructions: ["Regular physical exercise", "Practice martial arts", "Sports activities", "Maintain discipline"],
          frequency: "Daily",
          benefits: ["Balanced energy", "Physical strength", "Mental discipline"]
        },
        {
          name: "Anger Management",
          description: "Control emotional impulses",
          instructions: ["Practice patience", "Meditation for anger control", "Avoid conflicts", "Channel energy constructively"],
          frequency: "Continuous practice",
          benefits: ["Emotional balance", "Better relationships", "Success in ventures"]
        }
      ],
      charity: [
        {
          name: "Red Items Donation",
          description: "Donate red colored items",
          instructions: ["Donate red clothes", "Feed red lentils to poor", "Support defense personnel", "Help athletes"],
          frequency: "Tuesdays preferred",
          benefits: ["Mars blessings", "Removes malefic effects", "Karmic balance"]
        }
      ],
      timing: "Best during Mars Mahadasha or Moon Mahadasha, especially on Tuesdays"
    },
    timing: {
      activationPeriod: "Mars Mahadasha (7 years) and Moon Mahadasha (10 years)",
      peakEffect: "During Mars-Moon or Moon-Mars Antardasha",
      duration: "Strong effects throughout life with peaks during relevant dashas"
    },
    traditionalTexts: ["Brihat Parashara Hora Shastra", "Saravali", "Jataka Parijata"]
  },

  {
    name: "Hamsa Yoga",
    type: "Raj Yoga",
    category: "Pancha Mahapurusha - Wisdom",
    description: "Jupiter in Kendra (1st, 4th, 7th, 10th house) in its own sign (Sagittarius/Pisces) or exaltation (Cancer). One of the five great person yogas creating exceptional wisdom and spiritual knowledge.",
    detectionRule: {
      type: 'complex',
      conditions: [
        { planet: 'Jupiter', houses: [1, 4, 7, 10], dignity: 'exalted' },
        { planet: 'Jupiter', houses: [1, 4, 7, 10], dignity: 'own_sign' }
      ],
      requiresAll: false
    },
    effects: {
      positive: [
        "Exceptional wisdom and knowledge",
        "Spiritual inclination and enlightenment",
        "Teaching and guiding abilities",
        "Prosperity and wealth",
        "High moral character",
        "Respect from scholars and elders",
        "Success in education and philosophy",
        "Royal bearing and dignity"
      ],
      manifestation: "Native becomes a spiritual teacher, philosopher, or guide. Commands respect in academic circles and lives a prosperous, ethical life."
    },
    strength: {
      base: "Very Strong",
      modifiers: [
        { condition: "Jupiter exalted in Cancer", impact: 25 },
        { condition: "Jupiter in 1st house", impact: 20 },
        { condition: "Jupiter in 10th house", impact: 15 },
        { condition: "No malefic aspects", impact: 10 }
      ]
    },
    remedies: {
      mantras: [
        {
          name: "Guru Beej Mantra",
          description: "Powerful Jupiter mantra",
          instructions: ["Chant 'Om Graam Greem Graum Sah Gurave Namaha' 108 times", "On Thursdays", "Use yellow mala"],
          frequency: "Daily for 40 days minimum",
          benefits: ["Maximum Jupiter blessings", "Spiritual advancement", "Wisdom enhancement"]
        }
      ],
      gemstones: [
        {
          name: "Yellow Sapphire (Pukhraj)",
          description: "Most powerful Jupiter gemstone",
          instructions: ["Wear in gold ring", "Index finger", "Minimum 5 carats", "Consecrate on Thursday in Pushya nakshatra"],
          frequency: "Wear continuously",
          benefits: ["Amplifies Hamsa Yoga", "Attracts prosperity", "Spiritual growth"]
        }
      ],
      rituals: [
        {
          name: "Guru Puja",
          description: "Special worship for Jupiter",
          instructions: ["Perform on Thursdays", "Offer yellow flowers", "Light ghee lamp", "Read Jupiter stotras"],
          frequency: "Weekly",
          benefits: ["Jupiter's grace", "Wisdom multiplication", "Obstacle removal"]
        },
        {
          name: "Guru Dakshina",
          description: "Respect and donate to teachers",
          instructions: ["Honor your teachers", "Donate to educational institutions", "Support spiritual teachers", "Practice gratitude"],
          frequency: "Regular practice",
          benefits: ["Jupiter's blessings", "Knowledge expansion", "Spiritual merit"]
        }
      ],
      lifestyle: [
        {
          name: "Study of Scriptures",
          description: "Regular study of spiritual texts",
          instructions: ["Read Bhagavad Gita", "Study Upanishads", "Learn Vedic knowledge", "Practice self-inquiry"],
          frequency: "Daily",
          benefits: ["Wisdom enhancement", "Spiritual growth", "Jupiter activation"]
        },
        {
          name: "Ethical Living",
          description: "Practice dharma in daily life",
          instructions: ["Follow ethical principles", "Practice truthfulness", "Help others", "Live with integrity"],
          frequency: "Continuous",
          benefits: ["Jupiter's grace", "Karmic purification", "Life success"]
        }
      ],
      charity: [
        {
          name: "Educational Support",
          description: "Support education and teachers",
          instructions: ["Donate to schools", "Support students", "Fund libraries", "Help teachers"],
          frequency: "Thursdays preferred",
          benefits: ["Jupiter's maximum blessings", "Wealth multiplication", "Spiritual merit"]
        }
      ],
      timing: "Strongest during Jupiter Mahadasha, especially in Jupiter-Jupiter Antardasha"
    },
    timing: {
      activationPeriod: "Jupiter Mahadasha (16 years) - Full activation",
      peakEffect: "Jupiter-Jupiter Antardasha (2 years 1 month)",
      duration: "Lifelong effects with strongest manifestation during Jupiter periods"
    },
    traditionalTexts: ["Brihat Parashara Hora Shastra", "Brihat Jataka", "Phaladeepika"]
  }
];

// ============================================================================
// DHANA YOGAS (Wealth Combinations)
// ============================================================================

export const DHANA_YOGAS: YogaDefinition[] = [
  {
    name: "Lakshmi Yoga",
    type: "Dhana Yoga",
    category: "Wealth & Prosperity",
    description: "Lord of 9th house in own sign or exaltation in Kendra or Trikona, with strong ascendant lord. Brings blessings of Goddess Lakshmi with wealth, prosperity, and luxury.",
    detectionRule: {
      type: 'house_lord',
      conditions: [
        { house: 9, houses: [1, 4, 5, 7, 9, 10], dignity: 'own_sign' },
        { house: 9, houses: [1, 4, 5, 7, 9, 10], dignity: 'exalted' }
      ],
      requiresAll: false
    },
    effects: {
      positive: [
        "Abundant wealth and prosperity",
        "Luxury and material comforts",
        "Success in business ventures",
        "Property and assets accumulation",
        "Financial stability",
        "Blessings from elders",
        "Charitable nature with wealth"
      ],
      manifestation: "Native enjoys material prosperity, lives in comfort and luxury, and is blessed with continuous financial growth."
    },
    strength: {
      base: "Very Strong",
      modifiers: [
        { condition: "9th lord exalted", impact: 20 },
        { condition: "9th lord in Kendra", impact: 15 },
        { condition: "Ascendant lord strong", impact: 15 },
        { condition: "Venus well placed", impact: 10 }
      ]
    },
    remedies: {
      mantras: [
        {
          name: "Lakshmi Mantra",
          description: "Invoke Goddess Lakshmi",
          instructions: ["Chant 'Om Shreem Mahalakshmiyei Namaha' 108 times", "On Fridays", "Face east"],
          frequency: "Daily, especially Fridays",
          benefits: ["Attracts wealth", "Prosperity", "Lakshmi's blessings"]
        }
      ],
      gemstones: [
        {
          name: "Diamond or White Sapphire",
          description: "Venus gemstone for prosperity",
          instructions: ["Wear in platinum/silver", "Middle finger", "Consecrate on Friday"],
          frequency: "Wear continuously",
          benefits: ["Wealth attraction", "Luxury", "Venus blessings"]
        }
      ],
      rituals: [
        {
          name: "Lakshmi Puja",
          description: "Friday worship of Goddess Lakshmi",
          instructions: ["Clean house thoroughly", "Light ghee lamp", "Offer lotus flowers", "Chant Lakshmi stotras"],
          frequency: "Every Friday",
          benefits: ["Wealth multiplication", "Prosperity", "Financial stability"]
        }
      ],
      lifestyle: [
        {
          name: "Cleanliness & Order",
          description: "Maintain cleanliness for Lakshmi",
          instructions: ["Keep home clean", "Organize finances", "Maintain accounts", "Declutter regularly"],
          frequency: "Daily",
          benefits: ["Attracts Lakshmi", "Financial clarity", "Prosperity"]
        }
      ],
      charity: [
        {
          name: "Friday Charity",
          description: "Donate on Fridays",
          instructions: ["Donate to women", "Support poor families", "Feed the needy", "Give clothes"],
          frequency: "Fridays",
          benefits: ["Lakshmi's grace", "Wealth multiplication", "Karmic merit"]
        }
      ],
      timing: "Best during 9th house lord's Mahadasha and on Fridays"
    },
    timing: {
      activationPeriod: "9th house lord's Mahadasha and Venus periods",
      peakEffect: "During Venus-9th lord or 9th lord-Venus Antardasha",
      duration: "Lifelong prosperity with peaks during relevant dashas"
    },
    traditionalTexts: ["Brihat Parashara Hora Shastra", "Phaladeepika", "Jataka Parijata"]
  }
];

// Export all yoga definitions
export const ALL_YOGA_DEFINITIONS: YogaDefinition[] = [
  ...RAJ_YOGAS,
  ...DHANA_YOGAS,
  // More categories will be added
];

// Helper function to get yoga definition by name
export function getYogaDefinition(yogaName: string): YogaDefinition | undefined {
  return ALL_YOGA_DEFINITIONS.find(yoga => yoga.name === yogaName);
}

// Helper function to get all yogas of a specific type
export function getYogasByType(type: YogaDefinition['type']): YogaDefinition[] {
  return ALL_YOGA_DEFINITIONS.filter(yoga => yoga.type === type);
}

// Helper function to get yoga remedies
export function getYogaRemedies(yogaName: string): YogaRemedy | undefined {
  const yoga = getYogaDefinition(yogaName);
  return yoga?.remedies;
}

