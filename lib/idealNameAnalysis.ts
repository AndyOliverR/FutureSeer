// Ideal Name Analysis System
// Generates optimal name suggestions based on numerology, astrology, and elemental alignment

import { NameAnalysis } from './nameAnalysisIntelligence';
import { getAllNameMeanings, getNameData } from './nameMeanings';

// Numerology letter values (Chaldean system) - matching nameAnalysisIntelligence
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5,
  'I': 1, 'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8,
  'Q': 1, 'R': 2, 'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5,
  'Y': 1, 'Z': 7
};

// Element associations
const ELEMENT_LETTERS = {
  fire: ['A', 'E', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'T'],
  earth: ['B', 'D', 'G', 'J', 'K', 'M', 'P', 'Q', 'V', 'W'],
  air: ['C', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'S', 'T'],
  water: ['A', 'E', 'I', 'O', 'U', 'Y'],
  ether: ['X', 'Z']
};

const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

export interface IdealNameAnalysis {
  currentNameAnalysis: {
    fullName: string;
    destinyNumber: number;
    lifePathNumber: number;
    soulNumber: number;
    personalityNumber: number;
    elements: string[];
    alignmentScore: number;
    currentChallenges: string[];
    missingElements: string[];
  };
  idealNameSuggestions: Array<{
    suggestedFirstName: string;
    fullSuggestedName: string;
    destinyNumber: number;
    soulNumber: number;
    personalityNumber: number;
    elements: string[];
    alignmentScore: number;
    whyIdeal: string[];
    numerologyBenefits: string[];
    astrologyAlignment: string[];
    elementalBalance: string[];
    improvementAreas: string[];
  }>;
  analysis: {
    lifePathAlignment: string;
    optimizationOpportunities: string[];
    recommendationSummary: string;
  };
}

// Calculate Life Path Number from birth date
function calculateLifePathNumber(birthDate: string): number {
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

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

// Calculate numerology numbers for a name
function calculateNameNumbers(name: string): {
  destiny: number;
  soul: number;
  personality: number;
} {
  const cleanName = name.replace(/[^A-Z]/gi, '').toUpperCase();
  let totalValue = 0;
  
  for (const letter of cleanName) {
    totalValue += LETTER_VALUES[letter] || 0;
  }
  
  const destiny = reduceToSingleDigit(totalValue);
  const soul = reduceToSingleDigit(cleanName.split('').filter(l => VOWELS.includes(l)).reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0));
  const personality = reduceToSingleDigit(cleanName.split('').filter(l => CONSONANTS.includes(l)).reduce((sum, l) => sum + (LETTER_VALUES[l] || 0), 0));
  
  return { destiny, soul, personality };
}

// Analyze elements in a name
function analyzeNameElements(name: string): string[] {
  const cleanName = name.replace(/[^A-Z]/gi, '').toUpperCase();
  const elementCounts: { [key: string]: number } = {
    fire: 0, earth: 0, air: 0, water: 0, ether: 0
  };
  
  for (const letter of cleanName) {
    for (const [element, letters] of Object.entries(ELEMENT_LETTERS)) {
      if (letters.includes(letter)) {
        elementCounts[element]++;
      }
    }
  }
  
  return Object.entries(elementCounts)
    .filter(([_, count]) => count > 0)
    .map(([element, _]) => element);
}

// Generate name variations based on current first name
function generateNameVariations(firstName: string): string[] {
  const variations: string[] = [];
  const nameUpper = firstName.toUpperCase().trim();
  
  // Common name variations patterns
  const variationPatterns: { [key: string]: string[] } = {
    'ANDY': ['ANDREW', 'ANDRÉ', 'ANDREAS', 'ANDRE', 'ANTHONY', 'ANTON', 'ANTONY', 'AARON'],
    'JOHN': ['JONATHAN', 'JON', 'JOHNNY', 'JONAH', 'JORDAN', 'JOSEPH'],
    'MIKE': ['MICHAEL', 'MICAH', 'MIKAEL', 'MICHEAL'],
    'BOB': ['ROBERT', 'ROBBY', 'BOBBY', 'ROB', 'ROBIN'],
    'BILL': ['WILLIAM', 'BILLY', 'WILL', 'WILEY'],
    'JIM': ['JAMES', 'JIMMY', 'JAMIE'],
    'TOM': ['THOMAS', 'TOMMY', 'THOM', 'THOMPSON'],
    'DAN': ['DANIEL', 'DANNY', 'DANE'],
    'CHRIS': ['CHRISTOPHER', 'CHRISTIAN', 'CHRIS', 'KRISTOPHER'],
    'ALEX': ['ALEXANDER', 'ALEXANDRA', 'ALEXIS', 'ALEXANDR'],
    'SAM': ['SAMUEL', 'SAMUEL', 'SAMSON', 'SAMI'],
    'DAVE': ['DAVID', 'DAVEY', 'DAVY'],
    'MATT': ['MATTHEW', 'MATTEO', 'MATEO'],
    'STEVE': ['STEVEN', 'STEPHEN', 'STEFAN'],
    'JOE': ['JOSEPH', 'JOEY', 'JOSE'],
    'PAT': ['PATRICK', 'PATRICIA', 'PATTON'],
    'TONY': ['ANTHONY', 'ANTONIO', 'ANTON'],
  };
  
  // Check exact match
  if (variationPatterns[nameUpper]) {
    variations.push(...variationPatterns[nameUpper]);
  }
  
  // Phonetic variations - names starting with same letter
  const firstLetter = nameUpper[0];
  if (firstLetter === 'A') {
    variations.push('ALEXANDER', 'ALEX', 'AARON', 'ADAM', 'ANDREW', 'ANTHONY', 'ANTON', 'AIDAN', 'ASHTON');
  } else if (firstLetter === 'J') {
    variations.push('JAMES', 'JOSEPH', 'JOSHUA', 'JASON', 'JUSTIN', 'JACOB', 'JONATHAN');
  } else if (firstLetter === 'M') {
    variations.push('MICHAEL', 'MATTHEW', 'MARK', 'MARCUS', 'MARTIN');
  } else if (firstLetter === 'D') {
    variations.push('DAVID', 'DANIEL', 'DEREK', 'DARREN', 'DAMIAN');
  } else if (firstLetter === 'C') {
    variations.push('CHRISTOPHER', 'CHRISTIAN', 'CHARLES', 'CALVIN', 'CAMERON');
  } else if (firstLetter === 'R') {
    variations.push('ROBERT', 'RICHARD', 'RYAN', 'RAYMOND', 'REED');
  } else if (firstLetter === 'T') {
    variations.push('THOMAS', 'TYLER', 'TAYLOR', 'TIMOTHY', 'TREVOR');
  } else if (firstLetter === 'B') {
    variations.push('BENJAMIN', 'BRANDON', 'BRIAN', 'BRADLEY', 'BRYAN');
  } else if (firstLetter === 'W') {
    variations.push('WILLIAM', 'WESLEY', 'WADE', 'WARREN', 'WYATT');
  } else if (firstLetter === 'K') {
    variations.push('KEVIN', 'KEITH', 'KYLE', 'KENNETH', 'KURT');
  }
  
  // DO NOT include current name itself - we want alternatives only
  
  return [...new Set(variations)]; // Remove duplicates
}

// Find optimal destiny number based on life path
function findOptimalDestinyNumber(lifePath: number, numerologyData: any): number {
  // Ideal: Destiny should match life path or be compatible
  // Compatibility: numbers that work well together
  const compatibleNumbers: { [key: number]: number[] } = {
    1: [1, 8, 5],
    2: [2, 4, 6, 9],
    3: [3, 6, 9],
    4: [4, 2, 8],
    5: [5, 1, 7],
    6: [6, 2, 3, 9],
    7: [7, 5],
    8: [8, 1, 4],
    9: [9, 3, 6]
  };
  
  // If numerology data has destiny number that's compatible, use that as target
  if (numerologyData?.destinyNumber) {
    const currentDestiny = numerologyData.destinyNumber;
    if (compatibleNumbers[lifePath]?.includes(currentDestiny)) {
      return lifePath; // Perfect alignment
    }
    return currentDestiny; // Work with current but optimize
  }
  
  // Default: aim for matching life path
  return lifePath;
}

// Calculate alignment score for a suggested name
function calculateAlignmentScore(
  suggestedFullName: string,
  currentFullName: string,
  lifePath: number,
  numerologyData: any,
  vedicData: any,
  westernData: any
): number {
  const nameNumbers = calculateNameNumbers(suggestedFullName);
  let score = 0;
  const maxScore = 100;
  
  // 1. Life Path Alignment (30 points)
  const destinyAlignment = nameNumbers.destiny === lifePath ? 30 : 
                           (nameNumbers.destiny === reduceToSingleDigit(lifePath + 1) || 
                            nameNumbers.destiny === reduceToSingleDigit(lifePath - 1)) ? 20 : 15;
  score += destinyAlignment;
  
  // 2. Numerology compatibility (20 points)
  if (numerologyData) {
    if (nameNumbers.destiny === numerologyData.destinyNumber) score += 10;
    if (nameNumbers.soul === numerologyData.soulNumber) score += 5;
    if (nameNumbers.personality === numerologyData.personalityNumber) score += 5;
  }
  
  // 3. Soul/Personality balance (20 points)
  const soulPersonalityDiff = Math.abs(nameNumbers.soul - nameNumbers.personality);
  if (soulPersonalityDiff <= 2) score += 20;
  else if (soulPersonalityDiff <= 4) score += 15;
  else score += 10;
  
  // 4. Elemental balance (20 points)
  const elements = analyzeNameElements(suggestedFullName);
  if (elements.length >= 3) score += 20;
  else if (elements.length >= 2) score += 15;
  else score += 10;
  
  // 5. Astrology alignment (10 points)
  if (vedicData || westernData) {
    // Simplified: if name starts with certain letters that align with planetary influences
    const firstLetter = suggestedFullName.trim().split(' ')[0][0].toUpperCase();
    const sunSign = vedicData?.planets?.sun?.sign || westernData?.sun?.sign;
    
    // Basic planetary letter associations (simplified)
    const planetaryLetters: { [key: string]: string[] } = {
      'Aries': ['A', 'E', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'T'],
      'Leo': ['A', 'E', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'T'],
      'Sagittarius': ['A', 'E', 'F', 'H', 'I', 'L', 'N', 'O', 'R', 'T'],
      'Taurus': ['B', 'D', 'G', 'J', 'K', 'M', 'P', 'Q', 'V', 'W'],
      'Virgo': ['B', 'D', 'G', 'J', 'K', 'M', 'P', 'Q', 'V', 'W'],
      'Capricorn': ['B', 'D', 'G', 'J', 'K', 'M', 'P', 'Q', 'V', 'W'],
    };
    
    if (sunSign && planetaryLetters[sunSign]?.includes(firstLetter)) {
      score += 10;
    } else {
      score += 5; // Partial alignment
    }
  }
  
  return Math.min(score, maxScore);
}

// Identify challenges in current name
function identifyChallenges(analysis: NameAnalysis, lifePath: number): string[] {
  const challenges: string[] = [];
  
  if (analysis.destinyNumber !== lifePath) {
    challenges.push(`Destiny number (${analysis.destinyNumber}) doesn't align with life path (${lifePath})`);
  }
  
  if (analysis.missingElements && analysis.missingElements.length > 0) {
    challenges.push(`Missing elements: ${analysis.missingElements.join(', ')}`);
  }
  
  const soulPersonalityDiff = Math.abs(analysis.soulNumber - analysis.personalityNumber);
  if (soulPersonalityDiff > 4) {
    challenges.push('Soul and personality numbers are significantly unbalanced');
  }
  
  if (analysis.nameBalance > 20) {
    challenges.push('Vowel and consonant values are imbalanced');
  }
  
  return challenges;
}

// Common first names database for searching (extracted from popular names)
const COMMON_FIRST_NAMES = [
  'ANDREW', 'ALEXANDER', 'ANTHONY', 'AARON', 'ADAM', 'AIDAN', 'ALEX', 'AUSTIN',
  'BENJAMIN', 'BRANDON', 'BRIAN', 'BRADLEY', 'BRYAN',
  'CHRISTOPHER', 'CHARLES', 'CALVIN', 'CAMERON', 'CODY', 'COLE',
  'DANIEL', 'DAVID', 'DYLAN', 'DEREK', 'DARREN', 'DAMIAN',
  'ETHAN', 'EVAN', 'ERIC', 'ELIJAH',
  'FRANK', 'FRANKLIN', 'FRANCIS',
  'GEORGE', 'GARY', 'GREGORY', 'GABRIEL',
  'HENRY', 'HARRISON', 'HUNTER', 'HAYDEN',
  'ISAAC', 'IAN', 'IVAN',
  'JAMES', 'JOSEPH', 'JOSHUA', 'JASON', 'JUSTIN', 'JACOB', 'JACKSON', 'JONATHAN', 'JOHN', 'JOSEPH',
  'KEVIN', 'KYLE', 'KENNETH', 'KEITH', 'KURT',
  'LUKE', 'LOGAN', 'LANDON', 'LIAM', 'LUIS',
  'MICHAEL', 'MATTHEW', 'MARK', 'MARCUS', 'MARTIN', 'MASON', 'MAX', 'MILES',
  'NICHOLAS', 'NATHAN', 'NOAH', 'NOLAN',
  'OLIVER', 'OWEN', 'OSCAR',
  'PATRICK', 'PAUL', 'PETER', 'PHILIP', 'PRESTON',
  'RYAN', 'ROBERT', 'RICHARD', 'RAYMOND', 'REED', 'RHYS',
  'SAMUEL', 'STEVEN', 'SEAN', 'SCOTT', 'SETH', 'SIMON',
  'THOMAS', 'TYLER', 'TAYLOR', 'TREVOR', 'TRISTAN',
  'WILLIAM', 'WESLEY', 'WADE', 'WARREN', 'WYATT',
  'XAVIER',
  'ZACHARY', 'ZANE'
];

// Generate name suggestions by searching database
function generateNameSuggestions(
  nameVariations: string[],
  targetDestiny: number,
  missingElements: string[],
  rulingPlanet: string | null,
  lastName: string,
  middleName: string | undefined,
  currentFirstName: string
): Array<{
  suggestedFirstName: string;
  fullSuggestedName: string;
  nameNumbers: { destiny: number; soul: number; personality: number };
  elements: string[];
}> {
  const suggestions: Array<{
    suggestedFirstName: string;
    fullSuggestedName: string;
    nameNumbers: { destiny: number; soul: number; personality: number };
    elements: string[];
  }> = [];
  
  // Combine variations with common names database
  const allCandidateNames = [...new Set([...nameVariations, ...COMMON_FIRST_NAMES])];
  
  // Calculate base values for middle + last name (for full name destiny calculation)
  const middleLastName = [middleName, lastName].filter(Boolean).join(' ');
  const middleLastNameValue = middleLastName 
    ? middleLastName.toUpperCase().replace(/[^A-Z]/gi, '').split('').reduce((sum, letter) => sum + (LETTER_VALUES[letter] || 0), 0)
    : 0;
  const middleLastNameLength = middleLastName.replace(/[^A-Z]/gi, '').length;
  
  for (const candidateName of allCandidateNames) {
    // Skip if too short, too long, or same as current first name
    if (candidateName.length < 2 || candidateName.length > 15) continue;
    if (candidateName.toUpperCase() === currentFirstName.toUpperCase()) continue;
    
    // Build full name
    const nameParts = [];
    nameParts.push(candidateName);
    if (middleName) nameParts.push(middleName);
    if (lastName) nameParts.push(lastName);
    const fullName = nameParts.join(' ');
    
    // Calculate numbers for FULL NAME (important for destiny number)
    const fullNameClean = fullName.replace(/[^A-Z]/gi, '').toUpperCase();
    let totalValue = 0;
    for (const letter of fullNameClean) {
      totalValue += LETTER_VALUES[letter] || 0;
    }
    
    // Destiny number = (totalValue + name length) reduced to single digit (matching nameAnalysisIntelligence.ts)
    const destinyNumber = reduceToSingleDigit(totalValue + fullNameClean.length);
    
    // Check if destiny number matches target (prioritize exact matches, then close ones)
    const destinyDiff = Math.abs(destinyNumber - targetDestiny);
    if (destinyDiff > 2) continue; // Too far from target (allow 1-2 difference for better coverage)
    
    // Calculate other numbers for the full name
    const nameNumbers = calculateNameNumbers(fullName);
    
    // Analyze elements
    const elements = analyzeNameElements(candidateName);
    
    // Prioritize names that match target exactly or address missing elements
    const isExactMatch = destinyNumber === targetDestiny;
    const addressesMissingElements = missingElements.length > 0 && missingElements.some(el => elements.includes(el));
    
    if (isExactMatch || destinyDiff <= 1 || addressesMissingElements) {
      suggestions.push({
        suggestedFirstName: candidateName,
        fullSuggestedName: fullName,
        nameNumbers: {
          destiny: destinyNumber, // Use calculated full name destiny
          soul: nameNumbers.soul,
          personality: nameNumbers.personality
        },
        elements
      });
    }
  }
  
  return suggestions;
}

// Generate why ideal reasons
function generateWhyIdeal(
  suggestion: any,
  lifePath: number,
  currentAnalysis: NameAnalysis,
  numerologyData: any,
  vedicData: any,
  westernData: any
): string[] {
  const reasons: string[] = [];
  
  if (suggestion.nameNumbers.destiny === lifePath) {
    reasons.push(`Perfect alignment: Destiny number ${suggestion.nameNumbers.destiny} matches your life path ${lifePath}`);
  } else if (Math.abs(suggestion.nameNumbers.destiny - lifePath) === 1) {
    reasons.push(`Strong alignment: Destiny number ${suggestion.nameNumbers.destiny} complements your life path ${lifePath}`);
  }
  
  if (suggestion.elements.length >= 3) {
    reasons.push(`Excellent elemental balance with ${suggestion.elements.length} elements`);
  }
  
  const soulPersonalityDiff = Math.abs(suggestion.nameNumbers.soul - suggestion.nameNumbers.personality);
  if (soulPersonalityDiff <= 2) {
    reasons.push(`Balanced soul (${suggestion.nameNumbers.soul}) and personality (${suggestion.nameNumbers.personality}) numbers`);
  }
  
  if (currentAnalysis.missingElements && suggestion.elements.some((el: string) => currentAnalysis.missingElements.includes(el))) {
    reasons.push(`Addresses missing elements from your current name`);
  }
  
  return reasons;
}

// Generate numerology benefits
function generateNumerologyBenefits(suggestion: any, currentAnalysis: NameAnalysis, lifePath: number): string[] {
  const benefits: string[] = [];
  
  if (suggestion.nameNumbers.destiny === lifePath) {
    benefits.push('Destiny perfectly aligned with life path');
  }
  
  if (suggestion.nameNumbers.destiny !== currentAnalysis.destinyNumber) {
    benefits.push(`Destiny number changes from ${currentAnalysis.destinyNumber} to ${suggestion.nameNumbers.destiny}`);
  }
  
  if (suggestion.nameNumbers.soul !== currentAnalysis.soulNumber) {
    benefits.push(`Soul number changes from ${currentAnalysis.soulNumber} to ${suggestion.nameNumbers.soul}`);
  }
  
  if (suggestion.nameNumbers.personality !== currentAnalysis.personalityNumber) {
    benefits.push(`Personality number changes from ${currentAnalysis.personalityNumber} to ${suggestion.nameNumbers.personality}`);
  }
  
  return benefits;
}

// Generate astrology alignment text
function generateAstrologyAlignment(suggestion: any, vedicData: any, westernData: any): string[] {
  const alignments: string[] = [];
  
  if (vedicData) {
    const sunSign = vedicData.planets?.sun?.sign;
    if (sunSign) {
      alignments.push(`Compatible with ${sunSign} Sun sign energy`);
    }
    
    const nakshatra = vedicData.nakshatra;
    if (nakshatra) {
      alignments.push(`Supports ${nakshatra} Nakshatra qualities`);
    }
  }
  
  if (westernData) {
    const sunSign = westernData.sun?.sign;
    if (sunSign) {
      alignments.push(`Aligns with ${sunSign} energy`);
    }
  }
  
  if (alignments.length === 0) {
    alignments.push('Astrological compatibility enhanced');
  }
  
  return alignments;
}

// Generate elemental balance text
function generateElementalBalance(suggestion: any, currentAnalysis: NameAnalysis): string[] {
  const balance: string[] = [];
  
  const currentElementCount = Object.values(currentAnalysis.elements).filter(v => v > 0).length;
  const newElementCount = suggestion.elements.length;
  
  if (newElementCount > currentElementCount) {
    balance.push(`Increases elemental diversity from ${currentElementCount} to ${newElementCount} elements`);
  }
  
  if (currentAnalysis.missingElements && suggestion.elements.some((el: string) => currentAnalysis.missingElements.includes(el))) {
    balance.push(`Adds missing ${suggestion.elements.filter((el: string) => currentAnalysis.missingElements.includes(el)).join(', ')} elements`);
  }
  
  if (balance.length === 0) {
    balance.push('Maintains good elemental balance');
  }
  
  return balance;
}

// Generate improvement areas
function generateImprovementAreas(suggestion: any, currentAnalysis: NameAnalysis, lifePath: number): string[] {
  const improvements: string[] = [];
  
  if (suggestion.nameNumbers.destiny === lifePath && currentAnalysis.destinyNumber !== lifePath) {
    improvements.push('Better life path alignment');
  }
  
  if (suggestion.elements.length > Object.values(currentAnalysis.elements).filter(v => v > 0).length) {
    improvements.push('Enhanced elemental balance');
  }
  
  const currentSoulPersonalityDiff = Math.abs(currentAnalysis.soulNumber - currentAnalysis.personalityNumber);
  const newSoulPersonalityDiff = Math.abs(suggestion.nameNumbers.soul - suggestion.nameNumbers.personality);
  if (newSoulPersonalityDiff < currentSoulPersonalityDiff) {
    improvements.push('Improved soul-personality harmony');
  }
  
  return improvements;
}

// Generate alignment description
function generateAlignmentDescription(lifePath: number, destinyNumber: number): string {
  if (lifePath === destinyNumber) {
    return `Your current name's destiny number (${destinyNumber}) perfectly matches your life path (${lifePath}), indicating strong alignment.`;
  } else if (Math.abs(lifePath - destinyNumber) === 1) {
    return `Your current name's destiny number (${destinyNumber}) is compatible with your life path (${lifePath}), showing good but not perfect alignment.`;
  } else {
    return `Your current name's destiny number (${destinyNumber}) differs from your life path (${lifePath}), suggesting opportunities for better alignment.`;
  }
}

// Generate optimization opportunities
function generateOptimizationOpportunities(analysis: NameAnalysis, lifePath: number): string[] {
  const opportunities: string[] = [];
  
  if (analysis.destinyNumber !== lifePath) {
    opportunities.push(`Align destiny number with life path ${lifePath}`);
  }
  
  if (analysis.missingElements && analysis.missingElements.length > 0) {
    opportunities.push(`Incorporate missing ${analysis.missingElements.join(', ')} elements`);
  }
  
  const soulPersonalityDiff = Math.abs(analysis.soulNumber - analysis.personalityNumber);
  if (soulPersonalityDiff > 3) {
    opportunities.push('Balance soul and personality numbers');
  }
  
  return opportunities;
}

// Generate recommendation summary
function generateRecommendationSummary(suggestions: any[], currentAlignment: number): string {
  if (suggestions.length === 0) {
    return 'Your current name is well-aligned. Consider the suggestions for minor optimizations.';
  }
  
  const topScore = suggestions[0]?.alignmentScore || 0;
  const improvement = topScore - currentAlignment;
  
  if (improvement > 15) {
    return `Top suggestions offer significant alignment improvements (${improvement}+ points). Consider adopting one for better life path harmony.`;
  } else if (improvement > 5) {
    return `Several suggestions provide moderate improvements (${improvement}+ points) that could enhance your name's vibrational alignment.`;
  } else {
    return `Your current name is already well-aligned. These suggestions offer subtle optimizations for specific goals.`;
  }
}

// Main function to calculate ideal names
export function calculateIdealNames(
  analysis: NameAnalysis,
  numerologyData: any,
  vedicData: any,
  westernData: any,
  birthDate: string,
  currentFullName: string
): IdealNameAnalysis {
  // Extract life path number
  const lifePath = numerologyData?.lifePathNumber || calculateLifePathNumber(birthDate);
  
  // Find target destiny number
  const targetDestiny = findOptimalDestinyNumber(lifePath, numerologyData);
  
  // Get current name breakdown
  const nameParts = currentFullName.trim().split(/\s+/);
  const currentFirstName = nameParts[0] || analysis.firstName || 'Unknown';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts[1] || analysis.middleName || '');
  const lastName = nameParts[nameParts.length - 1] || analysis.lastName || '';
  
  // Generate name variations
  const nameVariations = generateNameVariations(currentFirstName);
  
  // Get astrology influences
  const rulingPlanet = vedicData?.planets?.sun?.sign || westernData?.sun?.sign || null;
  
  // Get missing elements
  const missingElements = analysis.missingElements || [];
  
  // Generate suggestions (exclude current first name)
  const rawSuggestions = generateNameSuggestions(
    nameVariations,
    targetDestiny,
    missingElements,
    rulingPlanet,
    lastName,
    middleName,
    currentFirstName
  );
  
  // Score each suggestion and filter to only show better ones
  const currentAlignment = calculateAlignmentScore(
    currentFullName,
    currentFullName,
    lifePath,
    numerologyData,
    vedicData,
    westernData
  );
  
  const scoredSuggestions = rawSuggestions
    .map(suggestion => {
      const alignmentScore = calculateAlignmentScore(
        suggestion.fullSuggestedName,
        currentFullName,
        lifePath,
        numerologyData,
        vedicData,
        westernData
      );
      
      const whyIdeal = generateWhyIdeal(suggestion, lifePath, analysis, numerologyData, vedicData, westernData);
      const numerologyBenefits = generateNumerologyBenefits(suggestion, analysis, lifePath);
      const astrologyAlignment = generateAstrologyAlignment(suggestion, vedicData, westernData);
      const elementalBalance = generateElementalBalance(suggestion, analysis);
      const improvementAreas = generateImprovementAreas(suggestion, analysis, lifePath);
      
      return {
        suggestedFirstName: suggestion.suggestedFirstName,
        fullSuggestedName: suggestion.fullSuggestedName,
        destinyNumber: suggestion.nameNumbers.destiny,
        soulNumber: suggestion.nameNumbers.soul,
        personalityNumber: suggestion.nameNumbers.personality,
        elements: suggestion.elements,
        alignmentScore,
        whyIdeal,
        numerologyBenefits,
        astrologyAlignment,
        elementalBalance,
        improvementAreas
      };
    })
    .filter(suggestion => suggestion.alignmentScore > currentAlignment) // Only show suggestions better than current
    .sort((a, b) => b.alignmentScore - a.alignmentScore) // Sort by score descending
    .slice(0, 7); // Top 7
  
  // Identify current challenges (currentAlignment already calculated above)
  const currentChallenges = identifyChallenges(analysis, lifePath);
  
  return {
    currentNameAnalysis: {
      fullName: currentFullName,
      destinyNumber: analysis.destinyNumber,
      lifePathNumber: lifePath,
      soulNumber: analysis.soulNumber,
      personalityNumber: analysis.personalityNumber,
      elements: Object.keys(analysis.elements).filter(key => analysis.elements[key as keyof typeof analysis.elements] > 0),
      alignmentScore: currentAlignment,
      currentChallenges: currentChallenges,
      missingElements: missingElements
    },
    idealNameSuggestions: scoredSuggestions,
    analysis: {
      lifePathAlignment: generateAlignmentDescription(lifePath, analysis.destinyNumber),
      optimizationOpportunities: generateOptimizationOpportunities(analysis, lifePath),
      recommendationSummary: generateRecommendationSummary(scoredSuggestions, currentAlignment)
    }
  };
}

