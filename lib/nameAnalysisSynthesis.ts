// Cross-System Synthesis Utilities for Name Analysis
// Combines name analysis with numerology, Vedic astrology, and Western astrology

import { NameAnalysis } from './nameAnalysisIntelligence';

export interface SynthesisResult {
  nameAnalysis: NameAnalysis;
  numerologyData?: any;
  vedicData?: any;
  westernData?: any;
  combinedPersonality: {
    strengths: string[];
    challenges: string[];
    lifePurpose: string;
    careerGuidance: string;
    relationshipInsights: string;
    spiritualPath: string;
  };
  elementalComparison: {
    nameElements: { fire: number; earth: number; air: number; water: number; ether: number };
    vedicElements?: { fire: number; earth: number; air: number; water: number };
    westernElements?: { fire: number; earth: number; air: number; water: number };
    alignedElements: string[];
    missingElements: string[];
    dominantElement: string;
  };
  numberHarmony: {
    nameLifePath: number;
    numerologyLifePath?: number;
    nameDestiny: number;
    numerologyDestiny?: number;
    harmonyScore: number;
    resonanceNotes: string[];
  };
  signNumberResonance: {
    nameNumbers: number[];
    astrologicalSigns: string[];
    resonances: Array<{ number: number; sign: string; meaning: string }>;
  };
}

// Number to Zodiac Sign mapping
const NUMBER_SIGN_MAP: { [key: number]: { sign: string; element: string; planet: string; meaning: string } } = {
  1: { sign: 'Aries', element: 'fire', planet: 'Mars', meaning: 'Leadership, independence, pioneering spirit' },
  2: { sign: 'Taurus', element: 'earth', planet: 'Venus', meaning: 'Stability, partnership, sensuality' },
  3: { sign: 'Gemini', element: 'air', planet: 'Mercury', meaning: 'Communication, expression, versatility' },
  4: { sign: 'Cancer', element: 'water', planet: 'Moon', meaning: 'Emotional depth, nurturing, intuition' },
  5: { sign: 'Leo', element: 'fire', planet: 'Sun', meaning: 'Creativity, self-expression, leadership' },
  6: { sign: 'Virgo', element: 'earth', planet: 'Mercury', meaning: 'Service, analysis, perfectionism' },
  7: { sign: 'Libra', element: 'air', planet: 'Venus', meaning: 'Harmony, balance, relationships' },
  8: { sign: 'Scorpio', element: 'water', planet: 'Pluto', meaning: 'Transformation, power, intensity' },
  9: { sign: 'Sagittarius', element: 'fire', planet: 'Jupiter', meaning: 'Wisdom, expansion, philosophy' },
  11: { sign: 'Aquarius', element: 'air', planet: 'Uranus', meaning: 'Innovation, humanitarianism, individuality' },
  22: { sign: 'Pisces', element: 'water', planet: 'Neptune', meaning: 'Spirituality, compassion, intuition' },
  33: { sign: 'Capricorn', element: 'earth', planet: 'Saturn', meaning: 'Mastery, structure, achievement' }
};

// Combine Name Analysis with Numerology
export function combineNameAndNumerology(nameAnalysis: NameAnalysis, numerologyData: any): any {
  if (!numerologyData) return null;

  const harmonies: string[] = [];
  const conflicts: string[] = [];
  const enhancedStrengths: string[] = [];
  const enhancedChallenges: string[] = [];

  // Life Path Number Comparison
  const nameLifePath = nameAnalysis.lifePathNumber;
  const numerologyLifePath = numerologyData.life_path_number || numerologyData.life_path;
  
  if (nameLifePath === numerologyLifePath) {
    harmonies.push(`Your name and birth date both reveal Life Path ${nameLifePath}, indicating strong alignment between your identity and destiny.`);
  } else {
    harmonies.push(`Your name shows Life Path ${nameLifePath}, while your birth date reveals ${numerologyLifePath}. This suggests complementary energies in your personality.`);
  }

  // Destiny Number Comparison
  const nameDestiny = nameAnalysis.destinyNumber;
  const numerologyDestiny = numerologyData.destiny_number || numerologyData.expression_number;

  if (nameDestiny === numerologyDestiny) {
    harmonies.push(`Your name and birth destiny numbers align (${nameDestiny}), showing consistent expression energy.`);
  }

  // Soul Number Comparison
  const nameSoul = nameAnalysis.soulNumber;
  const numerologySoul = numerologyData.soul_number || numerologyData.soul_urge;

  if (nameSoul === numerologySoul) {
    harmonies.push(`Your name's soul vibration (${nameSoul}) matches your birth soul urge, indicating authentic inner desires.`);
  }

  // Combine strengths and challenges
  enhancedStrengths.push(...nameAnalysis.personality.strengths);
  enhancedChallenges.push(...nameAnalysis.personality.challenges);

  if (numerologyData.insights?.strengths) {
    enhancedStrengths.push(...numerologyData.insights.strengths);
  }
  if (numerologyData.insights?.challenges) {
    enhancedChallenges.push(...numerologyData.insights.challenges);
  }

  return {
    harmonies,
    conflicts,
    enhancedStrengths: [...new Set(enhancedStrengths)],
    enhancedChallenges: [...new Set(enhancedChallenges)],
    numberComparison: {
      nameLifePath,
      numerologyLifePath,
      nameDestiny,
      numerologyDestiny,
      nameSoul,
      numerologySoul
    }
  };
}

// Combine Name Analysis with Vedic Astrology
export function combineNameAndVedic(nameAnalysis: NameAnalysis, vedicData: any): any {
  if (!vedicData) return null;

  const insights: string[] = [];
  const enhancedGuidance: string[] = [];

  // Extract Vedic chart data
  const ascendant = vedicData.chartData?.ascendant?.signName || vedicData.ascendant || vedicData.chart?.ascendant?.signName;
  const moonSign = vedicData.chartData?.moon?.signName || vedicData.moonSign || vedicData.chart?.moon?.signName;
  
  // Elemental comparison
  const vedicElements = extractVedicElements(vedicData);
  
  // Number-Sign resonance
  const nameLifePath = nameAnalysis.lifePathNumber;
  const signMapping = NUMBER_SIGN_MAP[nameLifePath];
  
  if (signMapping && (ascendant === signMapping.sign || moonSign === signMapping.sign)) {
    insights.push(`Your name's Life Path ${nameLifePath} resonates with ${signMapping.sign}, which appears in your Vedic chart. This creates powerful alignment between your identity and cosmic blueprint.`);
  }

  // Dominant element alignment
  if (nameAnalysis.dominantElement && vedicElements) {
    const vedicDominant = getDominantElement(vedicElements);
    if (nameAnalysis.dominantElement === vedicDominant) {
      insights.push(`Your name's dominant ${nameAnalysis.dominantElement} element aligns with your Vedic chart's elemental emphasis, reinforcing your natural tendencies.`);
    } else {
      insights.push(`Your name emphasizes ${nameAnalysis.dominantElement} while your Vedic chart shows ${vedicDominant} dominance, creating a balanced elemental profile.`);
    }
  }

  return {
    insights,
    enhancedGuidance,
    vedicElements,
    ascendant,
    moonSign,
    elementalAlignment: compareElements(nameAnalysis.elements, vedicElements)
  };
}

// Combine Name Analysis with Western Astrology
export function combineNameAndWestern(nameAnalysis: NameAnalysis, westernData: any): any {
  if (!westernData) return null;

  const insights: string[] = [];
  const enhancedGuidance: string[] = [];

  // Extract Western chart data
  const sunSign = westernData.sun_sign || westernData.sunSign;
  const moonSign = westernData.moon_sign || westernData.moonSign;
  const risingSign = westernData.rising_sign || westernData.risingSign;
  
  // Elemental comparison
  const westernElements = westernData.elements || extractWesternElements(westernData);
  
  // Number-Sign resonance
  const nameLifePath = nameAnalysis.lifePathNumber;
  const signMapping = NUMBER_SIGN_MAP[nameLifePath];
  
  if (signMapping && (sunSign === signMapping.sign || moonSign === signMapping.sign || risingSign === signMapping.sign)) {
    insights.push(`Your name's Life Path ${nameLifePath} corresponds to ${signMapping.sign}, which is prominent in your Western chart. This creates harmonious resonance between your name and astrological nature.`);
  }

  // Elemental balance
  if (westernElements) {
    const westernDominant = getDominantElement(westernElements);
    if (nameAnalysis.dominantElement === westernDominant) {
      insights.push(`Your name's ${nameAnalysis.dominantElement} element aligns with your Western chart's elemental emphasis.`);
    }
  }

  return {
    insights,
    enhancedGuidance,
    westernElements,
    sunSign,
    moonSign,
    risingSign,
    elementalAlignment: compareElements(nameAnalysis.elements, westernElements)
  };
}

// Compare elements between name and astrology
export function compareElements(
  nameElements: { fire: number; earth: number; air: number; water: number; ether?: number },
  astroElements?: { fire: number; earth: number; air: number; water: number }
): {
  aligned: string[];
  different: string[];
  missing: string[];
} {
  if (!astroElements) return { aligned: [], different: [], missing: [] };

  const aligned: string[] = [];
  const different: string[] = [];
  const missing: string[] = [];

  const elements = ['fire', 'earth', 'air', 'water'] as const;

  elements.forEach(element => {
    const nameValue = nameElements[element] || 0;
    const astroValue = astroElements[element] || 0;

    if (nameValue > 0 && astroValue > 0) {
      aligned.push(element);
    } else if (nameValue > 0 && astroValue === 0) {
      different.push(`${element} (in name but not prominent in chart)`);
    } else if (nameValue === 0 && astroValue > 0) {
      missing.push(`${element} (in chart but missing in name)`);
    }
  });

  return { aligned, different, missing };
}

// Synthesize personality from all systems
export function synthesizePersonality(
  nameAnalysis: NameAnalysis,
  numerologyData?: any,
  vedicData?: any,
  westernData?: any
): SynthesisResult['combinedPersonality'] {
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Collect from all systems
  strengths.push(...nameAnalysis.personality.strengths);
  challenges.push(...nameAnalysis.personality.challenges);

  if (numerologyData?.insights?.strengths) {
    strengths.push(...numerologyData.insights.strengths);
  }
  if (numerologyData?.insights?.challenges) {
    challenges.push(...numerologyData.insights.challenges);
  }

  if (vedicData?.personality?.strengths) {
    strengths.push(...vedicData.personality.strengths);
  }
  if (vedicData?.personality?.challenges) {
    challenges.push(...vedicData.personality.challenges);
  }

  // Synthesize life purpose
  let lifePurpose = nameAnalysis.personality.lifePurpose;
  if (numerologyData?.insights?.life_purpose) {
    lifePurpose += ` Combined with your numerology, ${numerologyData.insights.life_purpose.toLowerCase()}.`;
  }
  if (vedicData?.personality_analysis?.life_purpose) {
    lifePurpose += ` Your Vedic chart suggests ${vedicData.personality_analysis.life_purpose.toLowerCase()}.`;
  }

  // Synthesize career guidance
  let careerGuidance = nameAnalysis.personality.careerGuidance;
  if (numerologyData?.insights?.careerPaths) {
    careerGuidance += ` Numerology indicates ${numerologyData.insights.careerPaths.join(', ')}.`;
  }

  // Synthesize relationship insights
  let relationshipInsights = nameAnalysis.personality.relationshipInsights;
  if (vedicData?.personality_analysis?.relationshipInsights) {
    relationshipInsights += ` Vedic analysis reveals ${vedicData.personality_analysis.relationshipInsights.toLowerCase()}.`;
  }

  // Synthesize spiritual path
  let spiritualPath = nameAnalysis.personality.spiritualPath;
  if (vedicData?.personality_analysis?.spiritual_path) {
    spiritualPath += ` Your Vedic chart emphasizes ${vedicData.personality_analysis.spiritual_path.toLowerCase()}.`;
  }

  return {
    strengths: [...new Set(strengths)].slice(0, 10), // Limit to top 10
    challenges: [...new Set(challenges)].slice(0, 10),
    lifePurpose,
    careerGuidance,
    relationshipInsights,
    spiritualPath
  };
}

// Find harmonies and conflicts between systems
export function findHarmoniesAndConflicts(
  nameAnalysis: NameAnalysis,
  numerologyData?: any,
  vedicData?: any,
  westernData?: any
): { harmonies: string[]; conflicts: string[]; recommendations: string[] } {
  const harmonies: string[] = [];
  const conflicts: string[] = [];
  const recommendations: string[] = [];

  // Number harmonies
  if (numerologyData) {
    const numerologyLifePath = numerologyData.life_path_number || numerologyData.life_path;
    if (nameAnalysis.lifePathNumber === numerologyLifePath) {
      harmonies.push(`Life Path alignment: Your name and birth date both show ${nameAnalysis.lifePathNumber}, indicating strong destiny alignment.`);
    }
  }

  // Elemental harmonies
  if (vedicData) {
    const vedicElements = extractVedicElements(vedicData);
    if (vedicElements) {
      const alignment = compareElements(nameAnalysis.elements, vedicElements);
      if (alignment.aligned.length > 0) {
        harmonies.push(`Elemental alignment: Your name and Vedic chart share ${alignment.aligned.join(', ')} elements.`);
      }
      if (alignment.missing.length > 0) {
        recommendations.push(`Consider balancing ${alignment.missing.join(', ')} elements in your name or lifestyle.`);
      }
    }
  }

  if (westernData?.elements) {
    const alignment = compareElements(nameAnalysis.elements, westernData.elements);
    if (alignment.aligned.length > 0) {
      harmonies.push(`Elemental alignment: Your name and Western chart share ${alignment.aligned.join(', ')} elements.`);
    }
  }

  return { harmonies, conflicts, recommendations };
}

// Extract Vedic elements from chart data
function extractVedicElements(vedicData: any): { fire: number; earth: number; air: number; water: number } | undefined {
  if (!vedicData) return undefined;

  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  
  // Try to extract from planetary positions
  const planets = vedicData.planetary_positions || vedicData.planets || vedicData.chartData?.planets || [];
  
  planets.forEach((planet: any) => {
    const sign = planet.sign || planet.signName || '';
    if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) elements.fire++;
    else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) elements.earth++;
    else if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) elements.air++;
    else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) elements.water++;
  });

  // If no planets found, try chart data
  if (elements.fire === 0 && elements.earth === 0 && elements.air === 0 && elements.water === 0) {
    const ascendant = vedicData.chartData?.ascendant?.signName || vedicData.ascendant;
    if (ascendant) {
      if (['Aries', 'Leo', 'Sagittarius'].includes(ascendant)) elements.fire++;
      else if (['Taurus', 'Virgo', 'Capricorn'].includes(ascendant)) elements.earth++;
      else if (['Gemini', 'Libra', 'Aquarius'].includes(ascendant)) elements.air++;
      else if (['Cancer', 'Scorpio', 'Pisces'].includes(ascendant)) elements.water++;
    }
  }

  return elements;
}

// Extract Western elements from chart data
function extractWesternElements(westernData: any): { fire: number; earth: number; air: number; water: number } | undefined {
  if (!westernData) return undefined;
  
  if (westernData?.elements) return westernData.elements;
  
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  
  const planets = westernData.planets || [];
  planets.forEach((planet: any) => {
    const sign = planet.sign || '';
    if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) elements.fire++;
    else if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) elements.earth++;
    else if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) elements.air++;
    else if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) elements.water++;
  });

  return elements;
}

// Get dominant element
function getDominantElement(elements: { fire: number; earth: number; air: number; water: number }): string {
  return Object.entries(elements).reduce((a, b) => elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b)[0];
}

// Create complete synthesis result
export function createSynthesis(
  nameAnalysis: NameAnalysis,
  numerologyData?: any,
  vedicData?: any,
  westernData?: any
): SynthesisResult {
  const combinedPersonality = synthesizePersonality(nameAnalysis, numerologyData, vedicData, westernData);
  const { harmonies, conflicts, recommendations } = findHarmoniesAndConflicts(nameAnalysis, numerologyData, vedicData, westernData);
  
  // Elemental comparison
  const vedicElements = extractVedicElements(vedicData);
  const westernElements = extractWesternElements(westernData);
  
  const allAligned: string[] = [];
  const allMissing: string[] = [];
  
  if (vedicElements) {
    const vedicAlignment = compareElements(nameAnalysis.elements, vedicElements);
    allAligned.push(...vedicAlignment.aligned);
    allMissing.push(...vedicAlignment.missing);
  }
  
  if (westernElements) {
    const westernAlignment = compareElements(nameAnalysis.elements, westernElements);
    allAligned.push(...westernAlignment.aligned);
    allMissing.push(...westernAlignment.missing);
  }

  const dominantElement = nameAnalysis.dominantElement;

  // Number harmony
  const numerologyLifePath = numerologyData?.life_path_number || numerologyData?.life_path;
  const numerologyDestiny = numerologyData?.destiny_number || numerologyData?.expression_number;
  
  const resonanceNotes: string[] = [];
  if (numerologyLifePath === nameAnalysis.lifePathNumber) {
    resonanceNotes.push(`Life Path ${nameAnalysis.lifePathNumber} appears in both name and birth date, showing strong destiny alignment.`);
  }
  if (numerologyDestiny === nameAnalysis.destinyNumber) {
    resonanceNotes.push(`Destiny number ${nameAnalysis.destinyNumber} is consistent across name and birth numerology.`);
  }

  const harmonyScore = calculateHarmonyScore(
    nameAnalysis,
    numerologyData,
    vedicData,
    westernData
  );

  // Sign-Number resonance
  const resonances = calculateSignResonances(nameAnalysis, vedicData, westernData);

  return {
    nameAnalysis,
    numerologyData,
    vedicData,
    westernData,
    combinedPersonality: {
      ...combinedPersonality,
      strengths: [...combinedPersonality.strengths, ...harmonies].slice(0, 12),
      challenges: [...combinedPersonality.challenges, ...conflicts].slice(0, 10)
    },
    elementalComparison: {
      nameElements: nameAnalysis.elements,
      vedicElements,
      westernElements,
      alignedElements: [...new Set(allAligned)],
      missingElements: [...new Set(allMissing)],
      dominantElement
    },
    numberHarmony: {
      nameLifePath: nameAnalysis.lifePathNumber,
      numerologyLifePath,
      nameDestiny: nameAnalysis.destinyNumber,
      numerologyDestiny,
      harmonyScore,
      resonanceNotes
    },
    signNumberResonance: {
      nameNumbers: [
        nameAnalysis.lifePathNumber,
        nameAnalysis.destinyNumber,
        nameAnalysis.soulNumber,
        nameAnalysis.personalityNumber
      ],
      astrologicalSigns: [
        vedicData?.chartData?.ascendant?.signName || vedicData?.ascendant,
        vedicData?.chartData?.moon?.signName || vedicData?.moonSign,
        westernData?.sun_sign || westernData?.sunSign,
        westernData?.moon_sign || westernData?.moonSign,
        westernData?.rising_sign || westernData?.risingSign
      ].filter(Boolean),
      resonances
    }
  };
}

// Calculate harmony score (0-100)
function calculateHarmonyScore(
  nameAnalysis: NameAnalysis,
  numerologyData?: any,
  vedicData?: any,
  westernData?: any
): number {
  let score = 50; // Base score

  // Number alignments
  if (numerologyData) {
    if (nameAnalysis.lifePathNumber === (numerologyData.life_path_number || numerologyData.life_path)) score += 15;
    if (nameAnalysis.destinyNumber === (numerologyData.destiny_number || numerologyData.expression_number)) score += 10;
    if (nameAnalysis.soulNumber === (numerologyData.soul_number || numerologyData.soul_urge)) score += 10;
  }

  // Elemental alignments
  const vedicElements = extractVedicElements(vedicData);
  if (vedicElements) {
    const alignment = compareElements(nameAnalysis.elements, vedicElements);
    score += alignment.aligned.length * 5;
  }

  const westernElements = extractWesternElements(westernData);
  if (westernElements) {
    const alignment = compareElements(nameAnalysis.elements, westernElements);
    score += alignment.aligned.length * 5;
  }

  return Math.min(100, score);
}

// Calculate sign-number resonances
function calculateSignResonances(
  nameAnalysis: NameAnalysis,
  vedicData?: any,
  westernData?: any
): Array<{ number: number; sign: string; meaning: string }> {
  const resonances: Array<{ number: number; sign: string; meaning: string }> = [];

  const nameNumbers = [
    nameAnalysis.lifePathNumber,
    nameAnalysis.destinyNumber,
    nameAnalysis.soulNumber,
    nameAnalysis.personalityNumber
  ];

  const signs: string[] = [];
  if (vedicData) {
    const asc = vedicData.chartData?.ascendant?.signName || vedicData.ascendant;
    const moon = vedicData.chartData?.moon?.signName || vedicData.moonSign;
    if (asc) signs.push(asc);
    if (moon) signs.push(moon);
  }
  if (westernData) {
    const sun = westernData.sun_sign || westernData.sunSign;
    const moon = westernData.moon_sign || westernData.moonSign;
    const rising = westernData.rising_sign || westernData.risingSign;
    if (sun) signs.push(sun);
    if (moon) signs.push(moon);
    if (rising) signs.push(rising);
  }

  nameNumbers.forEach(num => {
    const mapping = NUMBER_SIGN_MAP[num];
    if (mapping && signs.includes(mapping.sign)) {
      resonances.push({
        number: num,
        sign: mapping.sign,
        meaning: mapping.meaning
      });
    }
  });

  return resonances;
}
