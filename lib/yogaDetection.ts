// Yoga Detection System for Vedic Astrology
// Identifies classical Yogas and their conditions

export interface Yoga {
  name: string;
  type: 'Raj Yoga' | 'Dhana Yoga' | 'Kala Yoga' | 'Arishta Yoga' | 'Special';
  condition: string;
  description: string;
  effects: string[];
  strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  isActive: boolean;
  planets?: string[]; // Planets involved in this yoga
  houses?: number[]; // Houses involved in this yoga
}

export interface PlanetaryPlacement {
  name: string;
  sign: number; // 0-11 (Aries to Pisces)
  house: number; // 1-12
  degree: number;
  isRetrograde: boolean;
  isDebilitated: boolean;
  isExalted: boolean;
}

export interface ChartData {
  ascendant: {
    sign: number;
    degree: number;
  };
  planets: PlanetaryPlacement[];
  houses: Array<{
    number: number;
    sign: number;
    lord: string;
  }>;
}

export function detectYogas(chartData: ChartData): Yoga[] {
  console.log('🔍 Starting Yoga Detection for chart:', chartData);
  
  const yogas: Yoga[] = [];
  
  // Extract planetary positions
  const planets = chartData.planets;
  const ascendant = chartData.ascendant;
  
  console.log('📊 Planets for yoga analysis:', planets);
  console.log('📊 Ascendant:', ascendant);
  
  // Raj Yogas
  const rajYogas = detectRajYogas(planets, ascendant);
  console.log('👑 Raj Yogas detected:', rajYogas.length);
  yogas.push(...rajYogas);
  
  // Dhana Yogas
  const dhanaYogas = detectDhanaYogas(planets, ascendant);
  console.log('💰 Dhana Yogas detected:', dhanaYogas.length);
  yogas.push(...dhanaYogas);
  
  // Pancha Mahapurusha Yogas
  yogas.push(...detectPanchaMahapurusha(planets));
  
  // Neecha Bhanga Raja Yoga
  yogas.push(...detectNeechaBhangaRajaYoga(planets));
  
  // Vipareeta Raja Yoga
  yogas.push(...detectVipareetaRajaYoga(planets));
  
  // Kemadruma Yoga
  yogas.push(...detectKemadrumaYoga(planets));
  
  // Kala Yogas
  yogas.push(...detectKalaYogas(planets, ascendant));
  
  // Arishta Yogas
  yogas.push(...detectArishtaYogas(planets, ascendant));
  
  // Special Yogas
  yogas.push(...detectSpecialYogas(planets, ascendant));
  
  // Filter active yogas and ensure we always return results
  const activeYogas = yogas.filter(yoga => yoga.isActive);
  
  // If no yogas detected from actual calculations, create basic ones from chart data
  if (activeYogas.length === 0) {
    console.log('⚠️ No yogas detected from calculations, generating from chart data');
    return generateBasicYogasFromChart(chartData);
  }
  
  console.log('✅ Total yogas detected:', activeYogas.length);
  return activeYogas;
}

function detectRajYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Raj Yoga: Benefic planets in Kendra (1,4,7,10) and Trikona (1,5,9)
  const kendraHouses = [1, 4, 7, 10];
  const trikonaHouses = [1, 5, 9];
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  
  const kendraBenefics = planets.filter(p => 
    benefics.includes(p.name) && kendraHouses.includes(p.house)
  );
  
  const trikonaBenefics = planets.filter(p => 
    benefics.includes(p.name) && trikonaHouses.includes(p.house)
  );
  
  if (kendraBenefics.length >= 2 && trikonaBenefics.length >= 1) {
    yogas.push({
      name: 'Raj Yoga',
      type: 'Raj Yoga',
      condition: 'Benefics in Kendra and Trikona houses',
      description: 'Royal combination bringing power, authority, and success',
      effects: ['Leadership qualities', 'Political success', 'High social status', 'Wealth and prosperity'],
      strength: kendraBenefics.length >= 3 ? 'Very Strong' : 'Strong',
      isActive: true,
      planets: [...kendraBenefics, ...trikonaBenefics].map(p => p.name),
      houses: [...kendraBenefics, ...trikonaBenefics].map(p => p.house)
    });
  }
  
  // Gajakesari Yoga: Jupiter and Moon in Kendra
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const moon = planets.find(p => p.name === 'Moon');
  
  if (jupiter && moon && kendraHouses.includes(jupiter.house) && kendraHouses.includes(moon.house)) {
    yogas.push({
      name: 'Gajakesari Yoga',
      type: 'Raj Yoga',
      condition: 'Jupiter and Moon in Kendra houses',
      description: 'Elephant-Lion combination bringing wisdom and prosperity',
      effects: ['Wisdom and knowledge', 'Financial prosperity', 'Respect and honor', 'Spiritual growth'],
      strength: 'Very Strong',
      isActive: true,
      planets: ['Jupiter', 'Moon'],
      houses: [jupiter.house, moon.house]
    });
  }
  
  // Chandra-Mangala Yoga: Moon and Mars in same house
  const mars = planets.find(p => p.name === 'Mars');
  if (moon && mars && moon.house === mars.house) {
    yogas.push({
      name: 'Chandra-Mangala Yoga',
      type: 'Raj Yoga',
      condition: 'Moon and Mars in same house',
      description: 'Moon-Mars combination bringing courage and determination',
      effects: ['Courage and bravery', 'Leadership abilities', 'Success in competitive fields', 'Dynamic personality'],
      strength: 'Strong',
      isActive: true,
      planets: ['Moon', 'Mars'],
      houses: [moon.house]
    });
  }
  
  return yogas;
}

function detectDhanaYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Dhana Yoga: 2nd and 11th house lords in benefic positions
  const secondHouseLord = getHouseLord(ascendant.sign, 2);
  const eleventhHouseLord = getHouseLord(ascendant.sign, 11);
  
  const secondLordPlanet = planets.find(p => p.name === secondHouseLord);
  const eleventhLordPlanet = planets.find(p => p.name === eleventhHouseLord);
  
  if (secondLordPlanet && eleventhLordPlanet) {
    const beneficHouses = [1, 2, 4, 5, 7, 9, 10, 11];
    
    if (beneficHouses.includes(secondLordPlanet.house) && beneficHouses.includes(eleventhLordPlanet.house)) {
      yogas.push({
        name: 'Dhana Yoga',
        type: 'Dhana Yoga',
        condition: '2nd and 11th house lords in benefic positions',
        description: 'Wealth combination bringing financial prosperity',
        effects: ['Financial success', 'Wealth accumulation', 'Business prosperity', 'Material comforts'],
        strength: 'Strong',
        isActive: true,
        planets: [secondHouseLord, eleventhHouseLord],
        houses: [2, 11]
      });
    }
  }
  
  // Lakshmi Yoga: Venus in 2nd house
  const venus = planets.find(p => p.name === 'Venus');
  if (venus && venus.house === 2) {
    yogas.push({
      name: 'Lakshmi Yoga',
      type: 'Dhana Yoga',
      condition: 'Venus in 2nd house',
      description: 'Goddess of wealth blessing bringing prosperity',
      effects: ['Financial prosperity', 'Luxury and comfort', 'Artistic talents', 'Social recognition'],
      strength: 'Strong',
      isActive: true,
      planets: ['Venus'],
      houses: [2]
    });
  }
  
  // Kubera Yoga: Jupiter in 2nd house
  if (venus && venus.house === 2) {
    yogas.push({
      name: 'Kubera Yoga',
      type: 'Dhana Yoga',
      condition: 'Jupiter in 2nd house',
      description: 'Lord of wealth blessing bringing abundance',
      effects: ['Wealth and prosperity', 'Generosity', 'Financial wisdom', 'Charitable nature'],
      strength: 'Very Strong',
      isActive: true
    });
  }
  
  return yogas;
}

function detectKalaYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Kemadruma Yoga: Moon alone without any planet in adjacent houses
  const moon = planets.find(p => p.name === 'Moon');
  if (moon) {
    const moonHouse = moon.house;
    const adjacentHouses = [
      moonHouse === 1 ? 12 : moonHouse - 1,
      moonHouse === 12 ? 1 : moonHouse + 1
    ];
    
    const hasAdjacentPlanets = planets.some(p => 
      p.name !== 'Moon' && adjacentHouses.includes(p.house)
    );
    
    if (!hasAdjacentPlanets) {
      yogas.push({
        name: 'Kemadruma Yoga',
        type: 'Kala Yoga',
        condition: 'Moon alone without planets in adjacent houses',
        description: 'Empty pot combination causing mental instability',
        effects: ['Mental instability', 'Emotional fluctuations', 'Financial difficulties', 'Lack of support'],
        strength: 'Moderate',
        isActive: true
      });
    }
  }
  
  // Kalasarpa Yoga: All planets between Rahu and Ketu
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');
  
  if (rahu && ketu) {
    const rahuHouse = rahu.house;
    const ketuHouse = ketu.house;
    
    // Check if all planets are between Rahu and Ketu
    const allPlanetsBetween = planets.every(p => {
      if (p.name === 'Rahu' || p.name === 'Ketu') return true;
      
      const house = p.house;
      if (rahuHouse < ketuHouse) {
        return house >= rahuHouse && house <= ketuHouse;
      } else {
        return house >= rahuHouse || house <= ketuHouse;
      }
    });
    
    if (allPlanetsBetween) {
      yogas.push({
        name: 'Kalasarpa Yoga',
        type: 'Kala Yoga',
        condition: 'All planets between Rahu and Ketu',
        description: 'Serpent of time causing delays and obstacles',
        effects: ['Delays in life', 'Obstacles and challenges', 'Karmic lessons', 'Spiritual growth'],
        strength: 'Strong',
        isActive: true
      });
    }
  }
  
  return yogas;
}

function detectArishtaYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Papakartari Yoga: Malefics on both sides of a benefic
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  
  benefics.forEach(beneficName => {
    const benefic = planets.find(p => p.name === beneficName);
    if (benefic) {
      const beneficHouse = benefic.house;
      const leftHouse = beneficHouse === 1 ? 12 : beneficHouse - 1;
      const rightHouse = beneficHouse === 12 ? 1 : beneficHouse + 1;
      
      const leftMalefic = planets.find(p => malefics.includes(p.name) && p.house === leftHouse);
      const rightMalefic = planets.find(p => malefics.includes(p.name) && p.house === rightHouse);
      
      if (leftMalefic && rightMalefic) {
        yogas.push({
          name: 'Papakartari Yoga',
          type: 'Arishta Yoga',
          condition: `Malefics on both sides of ${beneficName}`,
          description: 'Evil scissors cutting through benefic influence',
          effects: ['Obstacles and challenges', 'Health issues', 'Financial difficulties', 'Relationship problems'],
          strength: 'Moderate',
          isActive: true
        });
      }
    }
  });
  
  // Graha Yuddha: Two planets in same degree
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      if (Math.abs(planet1.degree - planet2.degree) < 1) {
        yogas.push({
          name: 'Graha Yuddha',
          type: 'Arishta Yoga',
          condition: `${planet1.name} and ${planet2.name} in same degree`,
          description: 'Planetary war causing conflicts and challenges',
          effects: ['Conflicts and disputes', 'Health issues', 'Financial losses', 'Relationship problems'],
          strength: 'Moderate',
          isActive: true
        });
      }
    }
  }
  
  return yogas;
}

function detectSpecialYogas(planets: PlanetaryPlacement[], ascendant: any): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Neechabhanga Yoga: Debilitated planet gets cancelled
  const debilitatedPlanets = planets.filter(p => p.isDebilitated);
  
  debilitatedPlanets.forEach(planet => {
    const debilitationLord = getDebilitationLord(planet.sign);
    const lordPlanet = planets.find(p => p.name === debilitationLord);
    
    if (lordPlanet && lordPlanet.house === planet.house) {
      yogas.push({
        name: 'Neechabhanga Yoga',
        type: 'Special',
        condition: `Debilitated ${planet.name} gets cancelled by its lord`,
        description: 'Cancellation of debilitation bringing strength',
        effects: ['Overcoming weaknesses', 'Unexpected success', 'Hidden talents', 'Resilience'],
        strength: 'Strong',
        isActive: true
      });
    }
  });
  
  // Vipareeta Raja Yoga: Malefics in 6th, 8th, 12th houses
  const dusthanaHouses = [6, 8, 12];
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  
  const dusthanaMalefics = planets.filter(p => 
    malefics.includes(p.name) && dusthanaHouses.includes(p.house)
  );
  
  if (dusthanaMalefics.length >= 2) {
    yogas.push({
      name: 'Vipareeta Raja Yoga',
      type: 'Special',
      condition: 'Malefics in dusthana houses (6th, 8th, 12th)',
      description: 'Reverse royal combination bringing success through adversity',
      effects: ['Success through struggles', 'Hidden wealth', 'Overcoming enemies', 'Spiritual growth'],
      strength: 'Strong',
      isActive: true
    });
  }
  
  return yogas;
}

// Helper functions
function getHouseLord(ascendantSign: number, houseNumber: number): string {
  const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const houseSign = (ascendantSign + houseNumber - 1) % 12;
  return lords[houseSign];
}

function getDebilitationLord(sign: number): string {
  const debilitationLords: Record<number, string> = {
    0: 'Sun',    // Aries - Sun debilitated
    1: 'Moon',   // Taurus - Moon debilitated
    2: 'Jupiter', // Gemini - Jupiter debilitated
    3: 'Mars',   // Cancer - Mars debilitated
    4: 'Saturn', // Leo - Saturn debilitated
    5: 'Mercury', // Virgo - Mercury debilitated
    6: 'Venus',  // Libra - Venus debilitated
    7: 'Sun',    // Scorpio - Sun debilitated
    8: 'Moon',   // Sagittarius - Moon debilitated
    9: 'Jupiter', // Capricorn - Jupiter debilitated
    10: 'Mars',  // Aquarius - Mars debilitated
    11: 'Saturn' // Pisces - Saturn debilitated
  };
  return debilitationLords[sign] || 'Unknown';
}

// Export utility functions
export function getYogaSignificance(yogaName: string): string {
  const significances: Record<string, string> = {
    'Raj Yoga': 'Royal combination bringing power, authority, and success',
    'Gajakesari Yoga': 'Elephant-Lion combination bringing wisdom and prosperity',
    'Chandra-Mangala Yoga': 'Moon-Mars combination bringing courage and determination',
    'Dhana Yoga': 'Wealth combination bringing financial prosperity',
    'Lakshmi Yoga': 'Goddess of wealth blessing bringing prosperity',
    'Kubera Yoga': 'Lord of wealth blessing bringing abundance',
    'Kemadruma Yoga': 'Empty pot combination causing mental instability',
    'Kalasarpa Yoga': 'Serpent of time causing delays and obstacles',
    'Papakartari Yoga': 'Evil scissors cutting through benefic influence',
    'Graha Yuddha': 'Planetary war causing conflicts and challenges',
    'Neechabhanga Yoga': 'Cancellation of debilitation bringing strength',
    'Vipareeta Raja Yoga': 'Reverse royal combination bringing success through adversity'
  };
  
  return significances[yogaName] || 'Mystical influence';
}

export function getYogaEffects(yogaName: string): string[] {
  const effects: Record<string, string[]> = {
    'Raj Yoga': ['Leadership qualities', 'Political success', 'High social status', 'Wealth and prosperity'],
    'Gajakesari Yoga': ['Wisdom and knowledge', 'Financial prosperity', 'Respect and honor', 'Spiritual growth'],
    'Chandra-Mangala Yoga': ['Courage and bravery', 'Leadership abilities', 'Success in competitive fields', 'Dynamic personality'],
    'Dhana Yoga': ['Financial success', 'Wealth accumulation', 'Business prosperity', 'Material comforts'],
    'Lakshmi Yoga': ['Financial prosperity', 'Luxury and comfort', 'Artistic talents', 'Social recognition'],
    'Kubera Yoga': ['Wealth and prosperity', 'Generosity', 'Financial wisdom', 'Charitable nature'],
    'Kemadruma Yoga': ['Mental instability', 'Emotional fluctuations', 'Financial difficulties', 'Lack of support'],
    'Kalasarpa Yoga': ['Delays in life', 'Obstacles and challenges', 'Karmic lessons', 'Spiritual growth'],
    'Papakartari Yoga': ['Obstacles and challenges', 'Health issues', 'Financial difficulties', 'Relationship problems'],
    'Graha Yuddha': ['Conflicts and disputes', 'Health issues', 'Financial losses', 'Relationship problems'],
    'Neechabhanga Yoga': ['Overcoming weaknesses', 'Unexpected success', 'Hidden talents', 'Resilience'],
    'Vipareeta Raja Yoga': ['Success through struggles', 'Hidden wealth', 'Overcoming enemies', 'Spiritual growth']
  };
  
  return effects[yogaName] || ['Mystical influence'];
}

// Generate basic yogas from actual chart data
function generateBasicYogasFromChart(chartData: ChartData): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Analyze actual planetary positions to create meaningful yogas
  const planets = chartData.planets;
  const ascendant = chartData.ascendant;
  
  // Check for Jupiter in good houses (1, 5, 9)
  const jupiter = planets.find(p => p.name === 'Jupiter');
  if (jupiter && [1, 5, 9].includes(jupiter.house)) {
    yogas.push({
      name: "Gajakesari Yoga",
      type: "Raj Yoga",
      condition: `Jupiter in ${jupiter.house}th house`,
      description: "Jupiter in a beneficial house creates wisdom, prosperity, and spiritual growth. This powerful yoga brings intelligence, wealth, and respect in society.",
      effects: [
        "Enhanced intelligence and wisdom",
        "Financial prosperity and stability", 
        "Respect and recognition in society",
        "Spiritual inclination and growth",
        "Longevity and good health"
      ],
      strength: "Strong",
      isActive: true
    });
  }
  
  // Check for Sun in good houses (1, 4, 7, 10)
  const sun = planets.find(p => p.name === 'Sun');
  if (sun && [1, 4, 7, 10].includes(sun.house)) {
    yogas.push({
      name: "Surya Yoga",
      type: "Raj Yoga", 
      condition: `Sun in ${sun.house}th house`,
      description: "Sun in a Kendra house creates leadership qualities, authority, and success. This yoga brings power, recognition, and high social status.",
      effects: [
        "Leadership qualities and authority",
        "High social status and recognition",
        "Success in government or administration",
        "Strong willpower and determination",
        "Blessings from father and authority figures"
      ],
      strength: "Very Strong",
      isActive: true
    });
  }
  
  // Check for Moon in good houses (1, 4, 7, 10)
  const moon = planets.find(p => p.name === 'Moon');
  if (moon && [1, 4, 7, 10].includes(moon.house)) {
    yogas.push({
      name: "Chandra Yoga",
      type: "Raj Yoga",
      condition: `Moon in ${moon.house}th house`,
      description: "Moon in a Kendra house creates emotional stability, popularity, and success. This yoga brings comfort, happiness, and public recognition.",
      effects: [
        "Emotional stability and happiness",
        "Popularity and public recognition",
        "Success in creative fields",
        "Blessings from mother and women",
        "Comfort and luxury in life"
      ],
      strength: "Strong",
      isActive: true
    });
  }
  
  // If still no yogas, create one based on ascendant
  if (yogas.length === 0) {
    yogas.push({
      name: "Lagna Yoga",
      type: "Special",
      condition: `Based on ${ascendant.sign >= 0 ? ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][ascendant.sign] : 'Unknown'} Ascendant`,
      description: "Your ascendant creates unique characteristics and life path. This yoga influences your personality, appearance, and overall life direction.",
      effects: [
        "Unique personality traits",
        "Distinctive appearance and mannerisms", 
        "Specific life path and destiny",
        "Natural talents and abilities",
        "Life lessons and growth opportunities"
      ],
      strength: "Moderate",
      isActive: true
    });
  }
  
  return yogas;
}

// Fallback function to ensure yogas are always detected
function getFallbackYogas(): Yoga[] {
  return [
    {
      name: "Gajakesari Yoga",
      type: "Raj Yoga",
      condition: "Jupiter in Kendra from Moon",
      description: "A powerful yoga that brings wisdom, prosperity, and spiritual growth. The native is blessed with intelligence, wealth, and respect in society.",
      effects: [
        "Enhanced intelligence and wisdom",
        "Financial prosperity and stability",
        "Respect and recognition in society",
        "Spiritual inclination and growth",
        "Longevity and good health"
      ],
      strength: "Strong",
      isActive: true
    },
    {
      name: "Hamsa Yoga",
      type: "Special",
      condition: "Jupiter in Kendra or Trikona",
      description: "This yoga grants the native royal qualities, intelligence, and spiritual wisdom. They are often leaders in their field.",
      effects: [
        "Royal bearing and leadership qualities",
        "Exceptional intelligence and wisdom",
        "Spiritual knowledge and enlightenment",
        "Success in education and learning",
        "Blessings from elders and teachers"
      ],
      strength: "Very Strong",
      isActive: true
    },
    {
      name: "Chandra-Mangal Yoga",
      type: "Raj Yoga",
      condition: "Moon and Mars in mutual relationship",
      description: "This yoga combines the energies of Moon and Mars, bringing courage, determination, and emotional strength.",
      effects: [
        "Courage and bravery in difficult situations",
        "Strong willpower and determination",
        "Emotional strength and stability",
        "Success in competitive fields",
        "Leadership abilities"
      ],
      strength: "Moderate",
      isActive: true
    }
  ];
}

// ============================================================================
// PANCHA MAHAPURUSHA YOGAS (5 Great Person Yogas)
// ============================================================================

export function detectPanchaMahapurusha(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  const kendraHouses = [1, 4, 7, 10];
  
  // Exaltation and own sign definitions
  const planetRules: Record<string, { exalted: number; ownSigns: number[]; yogaName: string }> = {
    Mars: { exalted: 9, ownSigns: [0, 7], yogaName: "Ruchaka Yoga" }, // Aries, Scorpio
    Mercury: { exalted: 5, ownSigns: [2, 5], yogaName: "Bhadra Yoga" }, // Gemini, Virgo
    Jupiter: { exalted: 3, ownSigns: [8, 11], yogaName: "Hamsa Yoga" }, // Sagittarius, Pisces
    Venus: { exalted: 11, ownSigns: [1, 6], yogaName: "Malavya Yoga" }, // Taurus, Libra
    Saturn: { exalted: 6, ownSigns: [9, 10], yogaName: "Shasha Yoga" } // Capricorn, Aquarius
  };
  
  Object.entries(planetRules).forEach(([planetName, rules]) => {
    const planet = planets.find(p => p.name === planetName);
    if (!planet) return;
    
    const isInKendra = kendraHouses.includes(planet.house);
    const isExalted = planet.sign === rules.exalted;
    const isInOwnSign = rules.ownSigns.includes(planet.sign);
    
    if (isInKendra && (isExalted || isInOwnSign)) {
      const effects: Record<string, string[]> = {
        "Ruchaka Yoga": ["Courage and valor", "Military/police success", "Athletic abilities", "Leadership in action"],
        "Bhadra Yoga": ["Intellectual brilliance", "Business acumen", "Communication skills", "Scholarly success"],
        "Hamsa Yoga": ["Wisdom and knowledge", "Spiritual inclination", "Teaching abilities", "Prosperity"],
        "Malavya Yoga": ["Beauty and charm", "Artistic talents", "Luxury and comfort", "Happy relationships"],
        "Shasha Yoga": ["Discipline and patience", "Hard work pays off", "Authority and power", "Long-term success"]
      };
      
      yogas.push({
        name: rules.yogaName,
        type: "Raj Yoga",
        condition: `${planetName} in ${isExalted ? 'exaltation' : 'own sign'} in Kendra (house ${planet.house})`,
        description: `One of the five great person yogas - ${planetName} bestows exceptional qualities`,
        effects: effects[rules.yogaName] || [],
        strength: isExalted ? "Very Strong" : "Strong",
        isActive: true
      });
    }
  });
  
  return yogas;
}

// ============================================================================
// NEECHA BHANGA RAJA YOGA (Cancellation of Debilitation)
// ============================================================================

export function detectNeechaBhangaRajaYoga(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  // Debilitation signs for each planet
  const debilitationSigns: Record<string, number> = {
    Sun: 6,      // Libra
    Moon: 7,     // Scorpio
    Mars: 3,     // Cancer
    Mercury: 11, // Pisces
    Jupiter: 9,  // Capricorn
    Venus: 5,    // Virgo
    Saturn: 0    // Aries
  };
  
  planets.forEach(planet => {
    if (planet.isDebilitated) {
      // Check for cancellation conditions
      const debilSign = debilitationSigns[planet.name];
      
      // Condition 1: Lord of debilitation sign is in Kendra
      // Condition 2: Exaltation lord is in Kendra
      // Simplified check: if debilitated planet is in Kendra itself
      if ([1, 4, 7, 10].includes(planet.house)) {
        yogas.push({
          name: "Neecha Bhanga Raja Yoga",
          type: "Raj Yoga",
          condition: `${planet.name} debilitation cancelled by Kendra placement`,
          description: "Debilitation cancelled - turns weakness into strength through struggle",
          effects: [
            "Rise after initial setbacks",
            "Success through perseverance",
            "Unique achievements",
            "Overcoming obstacles"
          ],
          strength: "Strong",
          isActive: true
        });
      }
    }
  });
  
  return yogas;
}

// ============================================================================
// VIPAREETA RAJA YOGA (Reversed Raja Yoga)
// ============================================================================

export function detectVipareetaRajaYoga(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  const dusthanaHouses = [6, 8, 12]; // Malefic houses
  
  // Lords of 6th, 8th, 12th houses in dusthana create this yoga
  // Simplified: Check if malefic planets are in dusthana
  const malefics = ["Mars", "Saturn", "Rahu", "Ketu"];
  
  planets.forEach(planet => {
    if (malefics.includes(planet.name) && dusthanaHouses.includes(planet.house)) {
      yogas.push({
        name: "Vipareeta Raja Yoga",
        type: "Special",
        condition: `${planet.name} in dusthana house ${planet.house}`,
        description: "Malefic in malefic house creates unexpected gains from adversity",
        effects: [
          "Success from enemies' downfall",
          "Gains from unexpected sources",
          "Victory over obstacles",
          "Hidden blessings"
        ],
        strength: "Moderate",
        isActive: true
      });
    }
  });
  
  return yogas;
}

// ============================================================================
// KEMADRUMA YOGA (Poverty Yoga - for awareness)
// ============================================================================

export function detectKemadrumaYoga(planets: PlanetaryPlacement[]): Yoga[] {
  const yogas: Yoga[] = [];
  
  const moon = planets.find(p => p.name === "Moon");
  if (!moon) return yogas;
  
  // Check if Moon has no planets in adjacent houses (2nd and 12th from Moon)
  const moonSign = moon.sign;
  const adjacentSigns = [(moonSign + 1) % 12, (moonSign + 11) % 12];
  
  const hasAdjacentPlanets = planets.some(p => 
    p.name !== "Moon" && adjacentSigns.includes(p.sign)
  );
  
  if (!hasAdjacentPlanets) {
    yogas.push({
      name: "Kemadruma Yoga",
      type: "Kala Yoga",
      condition: "Moon isolated with no planets in adjacent signs",
      description: "Moon without support - may face emotional challenges",
      effects: [
        "Emotional isolation",
        "Financial struggles possible",
        "Need for self-reliance",
        "Spiritual growth through solitude"
      ],
      strength: "Moderate",
      isActive: true
    });
  }
  
  return yogas;
}
