// Vedic Numerology Calculations with Planetary Connections
// Based on Navagraha (9 planets) system

export interface VedicNumerologyProfile {
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  nameNumber: number;
  birthDayNumber: number;
  rulingPlanet: string;
  planetaryInfluences: {
    [key: string]: {
      planet: string;
      number: number;
      significance: string;
      gemstone?: string;
      mantra?: string;
      sanskrit?: string;
      element?: string;
    };
  };
  karmicLessons: string[];
  dashaConnections: {
    planet: string;
    number: number;
    significance: string;
  }[];
}

export interface PlanetaryData {
  planet: string;
  sanskrit: string;
  element: string;
  gemstone: string;
  mantra: string;
  meaning: string;
}

// Vedic Planetary Number Associations (Navagraha)
const VEDIC_PLANETARY_NUMBERS: { 
  [key: number]: PlanetaryData
} = {
  1: { 
    planet: 'Sun', 
    sanskrit: 'Surya', 
    element: 'Fire', 
    gemstone: 'Ruby', 
    mantra: 'Om Suryaya Namaha',
    meaning: 'Soul (Atma), individualistic, power-seeking, regal dignity'
  },
  2: { 
    planet: 'Moon', 
    sanskrit: 'Chandra', 
    element: 'Water', 
    gemstone: 'Pearl', 
    mantra: 'Om Chandraya Namaha',
    meaning: 'Mind, emotions, intuition, nurturing nature'
  },
  3: { 
    planet: 'Jupiter', 
    sanskrit: 'Guru', 
    element: 'Ether', 
    gemstone: 'Yellow Sapphire', 
    mantra: 'Om Gurave Namaha',
    meaning: 'Wisdom, expansion, spirituality, teachers'
  },
  4: { 
    planet: 'Rahu', 
    sanskrit: 'Rahu', 
    element: 'Air', 
    gemstone: 'Hessonite', 
    mantra: 'Om Rahave Namaha',
    meaning: 'Material desires, ambitions, worldly achievements'
  },
  5: { 
    planet: 'Mercury', 
    sanskrit: 'Budha', 
    element: 'Earth', 
    gemstone: 'Emerald', 
    mantra: 'Om Budhaya Namaha',
    meaning: 'Intellect, communication, adaptability, learning'
  },
  6: { 
    planet: 'Venus', 
    sanskrit: 'Shukra', 
    element: 'Water', 
    gemstone: 'Diamond', 
    mantra: 'Om Shukraya Namaha',
    meaning: 'Love, beauty, relationships, material comforts'
  },
  7: { 
    planet: 'Ketu', 
    sanskrit: 'Ketu', 
    element: 'Fire', 
    gemstone: 'Cat\'s Eye', 
    mantra: 'Om Ketave Namaha',
    meaning: 'Spirituality, detachment, past karma, moksha'
  },
  8: { 
    planet: 'Saturn', 
    sanskrit: 'Shani', 
    element: 'Air', 
    gemstone: 'Blue Sapphire', 
    mantra: 'Om Shanaye Namaha',
    meaning: 'Karma, discipline, patience, life lessons'
  },
  9: { 
    planet: 'Mars', 
    sanskrit: 'Mangal', 
    element: 'Fire', 
    gemstone: 'Red Coral', 
    mantra: 'Om Mangalaya Namaha',
    meaning: 'Energy, courage, action, initiative'
  }
};

// Reduce to single digit (1-9)
function reduceToSingleDigit(num: number): number {
  if (num === 0) return 0;
  if (num < 10) return num;
  const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return reduceToSingleDigit(sum);
}

// Get letter value (Pythagorean system used in Vedic numerology)
function getLetterValue(letter: string): number {
  const values: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };
  return values[letter] || 0;
}

// Calculate Life Path Number from birth date
export function calculateVedicLifePathNumber(birthDate: string): number {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const daySum = reduceToSingleDigit(day);
  const monthSum = reduceToSingleDigit(month);
  const yearSum = reduceToSingleDigit(year);
  
  const total = daySum + monthSum + yearSum;
  return reduceToSingleDigit(total);
}

// Calculate Destiny Number (Name Number) from full name
function calculateDestinyNumber(fullName: string): number {
  const nameArray = fullName.toUpperCase().replace(/\s+/g, '').split('');
  const sum = nameArray.reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  return reduceToSingleDigit(sum);
}

// Calculate Soul Number from vowels in name
function calculateSoulNumber(fullName: string): number {
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const nameUpper = fullName.toUpperCase().replace(/\s/g, '');
  const vowelLetters = nameUpper.split('').filter(letter => vowels.includes(letter));
  
  const sum = vowelLetters.reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  
  return reduceToSingleDigit(sum);
}

// Calculate Personality Number from consonants in name
function calculatePersonalityNumber(fullName: string): number {
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const nameUpper = fullName.toUpperCase().replace(/\s/g, '');
  const consonantLetters = nameUpper.split('').filter(letter => 
    !vowels.includes(letter) && /[A-Z]/.test(letter)
  );
  
  const sum = consonantLetters.reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  
  return reduceToSingleDigit(sum);
}

// Get ruling planet for a number
export function getRulingPlanet(number: number): PlanetaryData {
  const planetData = VEDIC_PLANETARY_NUMBERS[number];
  if (!planetData) {
    // Default to Sun if number out of range
    return VEDIC_PLANETARY_NUMBERS[1];
  }
  return planetData;
}

// Calculate all Vedic numerology numbers and create comprehensive profile
export function calculateVedicNumerologyProfile(
  fullName: string, 
  birthDate: string
): VedicNumerologyProfile {
  const lifePathNumber = calculateVedicLifePathNumber(birthDate);
  const destinyNumber = calculateDestinyNumber(fullName);
  const soulNumber = calculateSoulNumber(fullName);
  const personalityNumber = calculatePersonalityNumber(fullName);
  const birthDayNumber = reduceToSingleDigit(new Date(birthDate).getDate());
  
  const rulingPlanet = getRulingPlanet(lifePathNumber);
  
  // Build planetary influences map
  const planetaryInfluences: VedicNumerologyProfile['planetaryInfluences'] = {};
  
  // Life Path Number
  const lifePathPlanet = getRulingPlanet(lifePathNumber);
  planetaryInfluences['Life Path'] = {
    planet: lifePathPlanet.planet,
    number: lifePathNumber,
    significance: `Life Path ${lifePathNumber} is ruled by ${lifePathPlanet.planet} (${lifePathPlanet.sanskrit}) - ${lifePathPlanet.meaning}`,
    gemstone: lifePathPlanet.gemstone,
    mantra: lifePathPlanet.mantra,
    sanskrit: lifePathPlanet.sanskrit,
    element: lifePathPlanet.element
  };
  
  // Destiny Number
  const destinyPlanet = getRulingPlanet(destinyNumber);
  planetaryInfluences['Destiny'] = {
    planet: destinyPlanet.planet,
    number: destinyNumber,
    significance: `Destiny Number ${destinyNumber} is ruled by ${destinyPlanet.planet} (${destinyPlanet.sanskrit}) - represents your natural talents and life purpose`,
    gemstone: destinyPlanet.gemstone,
    mantra: destinyPlanet.mantra,
    sanskrit: destinyPlanet.sanskrit,
    element: destinyPlanet.element
  };
  
  // Soul Number
  const soulPlanet = getRulingPlanet(soulNumber);
  planetaryInfluences['Soul'] = {
    planet: soulPlanet.planet,
    number: soulNumber,
    significance: `Soul Number ${soulNumber} is ruled by ${soulPlanet.planet} (${soulPlanet.sanskrit}) - represents your inner desires and true self`,
    gemstone: soulPlanet.gemstone,
    mantra: soulPlanet.mantra,
    sanskrit: soulPlanet.sanskrit,
    element: soulPlanet.element
  };
  
  // Personality Number
  const personalityPlanet = getRulingPlanet(personalityNumber);
  planetaryInfluences['Personality'] = {
    planet: personalityPlanet.planet,
    number: personalityNumber,
    significance: `Personality Number ${personalityNumber} is ruled by ${personalityPlanet.planet} (${personalityPlanet.sanskrit}) - represents how others perceive you`,
    gemstone: personalityPlanet.gemstone,
    mantra: personalityPlanet.mantra,
    sanskrit: personalityPlanet.sanskrit,
    element: personalityPlanet.element
  };
  
  // Birth Day Number
  const birthDayPlanet = getRulingPlanet(birthDayNumber);
  planetaryInfluences['Birth Day'] = {
    planet: birthDayPlanet.planet,
    number: birthDayNumber,
    significance: `Birth Day Number ${birthDayNumber} is ruled by ${birthDayPlanet.planet} (${birthDayPlanet.sanskrit}) - represents your basic personality traits`,
    gemstone: birthDayPlanet.gemstone,
    mantra: birthDayPlanet.mantra,
    sanskrit: birthDayPlanet.sanskrit,
    element: birthDayPlanet.element
  };
  
  // Karmic lessons (numbers that appear multiple times or are challenging)
  const karmicLessons: string[] = [];
  const numbers = [lifePathNumber, destinyNumber, soulNumber, personalityNumber, birthDayNumber];
  const numberCounts: { [key: number]: number } = {};
  
  numbers.forEach(num => {
    numberCounts[num] = (numberCounts[num] || 0) + 1;
  });
  
  // Check for karmic debt numbers (if any calculation results in 13, 14, 16, 19)
  const karmicDebtNumbers = [13, 14, 16, 19];
  [lifePathNumber + destinyNumber, soulNumber + personalityNumber].forEach(sum => {
    if (karmicDebtNumbers.includes(sum)) {
      karmicLessons.push(`Karmic lesson indicated by combination ${sum} - requires attention to balance`);
    }
  });
  
  // Add lessons based on repeating numbers
  Object.entries(numberCounts).forEach(([num, count]) => {
    if (count >= 2) {
      const planet = getRulingPlanet(parseInt(num));
      karmicLessons.push(`Number ${num} (${planet.planet}) appears ${count} times - significant planetary influence requiring integration`);
    }
  });
  
  // Dasha connections
  const dashaConnections = [
    {
      planet: rulingPlanet.planet,
      number: lifePathNumber,
      significance: `Your Life Path Number connects to ${rulingPlanet.planet} Dasha periods - these will be particularly significant in your life`
    },
    {
      planet: destinyPlanet.planet,
      number: destinyNumber,
      significance: `${destinyPlanet.planet} Dasha periods will align with your destiny and natural talents`
    }
  ];
  
  return {
    lifePathNumber,
    destinyNumber,
    soulNumber,
    nameNumber: destinyNumber,
    birthDayNumber,
    rulingPlanet: rulingPlanet.planet,
    planetaryInfluences,
    karmicLessons,
    dashaConnections
  };
}

