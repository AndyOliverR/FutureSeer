/**
 * Western Astrology Interpretation Engine
 * Combines planet-sign interpretations with chart analysis
 */

import { getPlanetSignInterpretation, PlanetSignInterpretation } from './interpretations/planetSigns';

export interface ChartInterpretation {
  sunSign: PlanetSignInterpretation | null;
  moonSign: PlanetSignInterpretation | null;
  risingSign: PlanetSignInterpretation | null;
  personalPlanets: {
    mercury: PlanetSignInterpretation | null;
    venus: PlanetSignInterpretation | null;
    mars: PlanetSignInterpretation | null;
  };
  socialPlanets: {
    jupiter: PlanetSignInterpretation | null;
    saturn: PlanetSignInterpretation | null;
  };
  outerPlanets: {
    uranus: PlanetSignInterpretation | null;
    neptune: PlanetSignInterpretation | null;
    pluto: PlanetSignInterpretation | null;
  };
}

export interface PersonalizedInsights {
  coreIdentity: {
    sunSign: string;
    interpretation: PlanetSignInterpretation | null;
    keyTraits: string[];
  };
  emotionalNature: {
    moonSign: string;
    interpretation: PlanetSignInterpretation | null;
    emotionalNeeds: string[];
  };
  publicPersona: {
    risingSign: string;
    interpretation: PlanetSignInterpretation | null;
    firstImpression: string[];
  };
  communicationStyle: {
    mercurySign: string;
    interpretation: PlanetSignInterpretation | null;
    communicationTraits: string[];
  };
  loveStyle: {
    venusSign: string;
    interpretation: PlanetSignInterpretation | null;
    relationshipTraits: string[];
  };
  actionStyle: {
    marsSign: string;
    interpretation: PlanetSignInterpretation | null;
    actionTraits: string[];
  };
}

/**
 * Generate comprehensive chart interpretation
 */
export function generateChartInterpretation(chartData: any): ChartInterpretation {
  const planets = chartData.planets || [];
  
  // Find planet positions
  const planetPositions: Record<string, any> = {};
  planets.forEach((planet: any) => {
    planetPositions[planet.name.toLowerCase()] = planet;
  });

  // Get zodiac signs for each planet
  const getZodiacSign = (longitude: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  };

  // Get rising sign (assuming first house cusp)
  const houses = chartData.houses || [];
  const risingSign = houses.length > 0 ? getZodiacSign(houses[0].longitude) : 'Unknown';

  return {
    sunSign: planetPositions.sun ? getPlanetSignInterpretation('Sun', getZodiacSign(planetPositions.sun.longitude)) : null,
    moonSign: planetPositions.moon ? getPlanetSignInterpretation('Moon', getZodiacSign(planetPositions.moon.longitude)) : null,
    risingSign: getPlanetSignInterpretation('Sun', risingSign), // Using Sun interpretation for rising sign
    personalPlanets: {
      mercury: planetPositions.mercury ? getPlanetSignInterpretation('Mercury', getZodiacSign(planetPositions.mercury.longitude)) : null,
      venus: planetPositions.venus ? getPlanetSignInterpretation('Venus', getZodiacSign(planetPositions.venus.longitude)) : null,
      mars: planetPositions.mars ? getPlanetSignInterpretation('Mars', getZodiacSign(planetPositions.mars.longitude)) : null,
    },
    socialPlanets: {
      jupiter: planetPositions.jupiter ? getPlanetSignInterpretation('Jupiter', getZodiacSign(planetPositions.jupiter.longitude)) : null,
      saturn: planetPositions.saturn ? getPlanetSignInterpretation('Saturn', getZodiacSign(planetPositions.saturn.longitude)) : null,
    },
    outerPlanets: {
      uranus: planetPositions.uranus ? getPlanetSignInterpretation('Uranus', getZodiacSign(planetPositions.uranus.longitude)) : null,
      neptune: planetPositions.neptune ? getPlanetSignInterpretation('Neptune', getZodiacSign(planetPositions.neptune.longitude)) : null,
      pluto: planetPositions.pluto ? getPlanetSignInterpretation('Pluto', getZodiacSign(planetPositions.pluto.longitude)) : null,
    }
  };
}

/**
 * Generate personalized insights for UI display
 */
export function generatePersonalizedInsights(chartData: any): PersonalizedInsights {
  let planets = chartData.planets || [];
  
  // Handle both object and array formats
  if (!Array.isArray(planets) && typeof planets === 'object') {
    planets = Object.entries(planets).map(([name, data]: [string, any]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ...data
    }));
  }
  
  // Find planet positions
  const planetPositions: Record<string, any> = {};
  planets.forEach((planet: any) => {
    planetPositions[planet.name.toLowerCase()] = planet;
  });

  // Get zodiac signs for each planet
  const getZodiacSign = (longitude: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(longitude / 30);
    return signs[signIndex];
  };

  // Get rising sign (assuming first house cusp)
  const houses = chartData.houses || [];
  const risingSign = houses.length > 0 ? getZodiacSign(houses[0].longitude) : 'Unknown';

  const sunSign = planetPositions.sun ? getZodiacSign(planetPositions.sun.longitude) : 'Unknown';
  const moonSign = planetPositions.moon ? getZodiacSign(planetPositions.moon.longitude) : 'Unknown';
  const mercurySign = planetPositions.mercury ? getZodiacSign(planetPositions.mercury.longitude) : 'Unknown';
  const venusSign = planetPositions.venus ? getZodiacSign(planetPositions.venus.longitude) : 'Unknown';
  const marsSign = planetPositions.mars ? getZodiacSign(planetPositions.mars.longitude) : 'Unknown';

  return {
    coreIdentity: {
      sunSign,
      interpretation: getPlanetSignInterpretation('Sun', sunSign),
      keyTraits: getPlanetSignInterpretation('Sun', sunSign)?.keywords || []
    },
    emotionalNature: {
      moonSign,
      interpretation: getPlanetSignInterpretation('Moon', moonSign),
      emotionalNeeds: getPlanetSignInterpretation('Moon', moonSign)?.keywords || []
    },
    publicPersona: {
      risingSign,
      interpretation: getPlanetSignInterpretation('Sun', risingSign), // Using Sun interpretation for rising
      firstImpression: getPlanetSignInterpretation('Sun', risingSign)?.keywords || []
    },
    communicationStyle: {
      mercurySign,
      interpretation: getPlanetSignInterpretation('Mercury', mercurySign),
      communicationTraits: getPlanetSignInterpretation('Mercury', mercurySign)?.keywords || []
    },
    loveStyle: {
      venusSign,
      interpretation: getPlanetSignInterpretation('Venus', venusSign),
      relationshipTraits: getPlanetSignInterpretation('Venus', venusSign)?.keywords || []
    },
    actionStyle: {
      marsSign,
      interpretation: getPlanetSignInterpretation('Mars', marsSign),
      actionTraits: getPlanetSignInterpretation('Mars', marsSign)?.keywords || []
    }
  };
}

/**
 * Generate career guidance based on chart
 */
export function generateCareerGuidance(chartData: any): {
  primaryCareerPaths: string[];
  secondaryCareerPaths: string[];
  workStyle: string[];
  leadershipPotential: string;
  entrepreneurialTendency: string;
} {
  const insights = generatePersonalizedInsights(chartData);
  
  // Collect career suggestions from all planets
  const allCareerSuggestions: string[] = [];
  
  if (insights.coreIdentity.interpretation?.careerSuggestions) {
    allCareerSuggestions.push(...insights.coreIdentity.interpretation.careerSuggestions);
  }
  if (insights.communicationStyle.interpretation?.careerSuggestions) {
    allCareerSuggestions.push(...insights.communicationStyle.interpretation.careerSuggestions);
  }
  if (insights.actionStyle.interpretation?.careerSuggestions) {
    allCareerSuggestions.push(...insights.actionStyle.interpretation.careerSuggestions);
  }

  // Remove duplicates and prioritize
  const uniqueCareers = [...new Set(allCareerSuggestions)];
  const primaryCareerPaths = uniqueCareers.slice(0, 3);
  const secondaryCareerPaths = uniqueCareers.slice(3, 6);

  // Determine work style based on signs
  const workStyle: string[] = [];
  if (insights.coreIdentity.sunSign === 'Virgo' || insights.coreIdentity.sunSign === 'Capricorn') {
    workStyle.push('Detail-oriented', 'Systematic', 'Reliable');
  } else if (insights.coreIdentity.sunSign === 'Aries' || insights.coreIdentity.sunSign === 'Leo') {
    workStyle.push('Leadership-focused', 'Dynamic', 'Inspiring');
  } else if (insights.coreIdentity.sunSign === 'Gemini' || insights.coreIdentity.sunSign === 'Aquarius') {
    workStyle.push('Innovative', 'Communicative', 'Adaptable');
  }

  // Determine leadership potential
  const leadershipSigns = ['Aries', 'Leo', 'Capricorn', 'Scorpio'];
  const leadershipPotential = leadershipSigns.includes(insights.coreIdentity.sunSign) ? 'High' : 'Moderate';

  // Determine entrepreneurial tendency
  const entrepreneurialSigns = ['Aries', 'Leo', 'Sagittarius', 'Aquarius'];
  const entrepreneurialTendency = entrepreneurialSigns.includes(insights.coreIdentity.sunSign) ? 'High' : 'Moderate';

  return {
    primaryCareerPaths,
    secondaryCareerPaths,
    workStyle,
    leadershipPotential,
    entrepreneurialTendency
  };
}

/**
 * Generate relationship insights
 */
export function generateRelationshipInsights(chartData: any): {
  loveStyle: string;
  communicationStyle: string;
  emotionalNeeds: string[];
  compatibilityFactors: string[];
  relationshipChallenges: string[];
} {
  const insights = generatePersonalizedInsights(chartData);
  
  const loveStyle = insights.loveStyle.interpretation?.relationshipStyle || 'Unknown';
  const communicationStyle = insights.communicationStyle.interpretation?.relationshipStyle || 'Unknown';
  const emotionalNeeds = insights.emotionalNature.emotionalNeeds;
  
  const compatibilityFactors: string[] = [];
  if (insights.loveStyle.venusSign === 'Libra' || insights.loveStyle.venusSign === 'Taurus') {
    compatibilityFactors.push('Values harmony and partnership');
  }
  if (insights.communicationStyle.mercurySign === 'Gemini' || insights.communicationStyle.mercurySign === 'Virgo') {
    compatibilityFactors.push('Excellent communication skills');
  }
  
  const relationshipChallenges: string[] = [];
  if (insights.actionStyle.marsSign === 'Aries' || insights.actionStyle.marsSign === 'Scorpio') {
    relationshipChallenges.push('May need to develop patience');
  }
  if (insights.emotionalNature.moonSign === 'Cancer' || insights.emotionalNature.moonSign === 'Pisces') {
    relationshipChallenges.push('May need to develop emotional boundaries');
  }

  return {
    loveStyle,
    communicationStyle,
    emotionalNeeds,
    compatibilityFactors,
    relationshipChallenges
  };
}
