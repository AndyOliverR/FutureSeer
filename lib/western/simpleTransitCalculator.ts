/**
 * Simplified Transit Calculator
 * Shows only the most important current transits - no information overload
 */

export interface SimpleTransit {
  planet: string;
  aspect: string;
  targetPlanet: string;
  orb: number;
  exact: boolean;
  influence: 'harmonious' | 'challenging' | 'neutral';
  message: string;
  timing: 'active' | 'coming' | 'recent';
  exactDate?: string;
}

export interface TransitAnalysis {
  activeNow: SimpleTransit[];
  comingSoon: SimpleTransit[];
  recent: SimpleTransit[];
}

/**
 * Calculate current sky positions for major planets
 */
export function getCurrentSkyPositions(): Record<string, number> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simplified calculation - in real astrology, this would use Swiss Ephemeris
  // For now, we'll use approximate positions based on current date
  const positions: Record<string, number> = {};
  
  // Approximate planetary positions (degrees in tropical zodiac)
  positions.jupiter = ((year - 2000) * 30 + month * 2.5 + day * 0.08) % 360;
  positions.saturn = ((year - 2000) * 12 + month * 1 + day * 0.03) % 360;
  positions.uranus = ((year - 2000) * 4.2 + month * 0.35 + day * 0.01) % 360;
  positions.neptune = ((year - 2000) * 2.1 + month * 0.18 + day * 0.006) % 360;
  positions.pluto = ((year - 2000) * 1.4 + month * 0.12 + day * 0.004) % 360;
  
  return positions;
}

/**
 * Calculate aspects between transiting planets and natal planets
 */
export function calculateTransitAspects(
  natalPlanets: Record<string, number>,
  transitingPlanets: Record<string, number>
): SimpleTransit[] {
  const aspects: SimpleTransit[] = [];
  
  // Only check major transiting planets (Jupiter-Pluto)
  const majorTransitingPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  // Only check hard aspects (conjunction, square, opposition)
  const hardAspects = [
    { name: 'conjunction', angle: 0, orb: 8 },
    { name: 'opposition', angle: 180, orb: 8 },
    { name: 'square', angle: 90, orb: 8 }
  ];
  
  for (const transitingPlanet of majorTransitingPlanets) {
    if (!transitingPlanets[transitingPlanet]) continue;
    
    for (const natalPlanet of Object.keys(natalPlanets)) {
      const natalLongitude = natalPlanets[natalPlanet];
      const transitingLongitude = transitingPlanets[transitingPlanet];
      
      const angle = Math.abs(transitingLongitude - natalLongitude);
      const normalizedAngle = Math.min(angle, 360 - angle);
      
      for (const aspectType of hardAspects) {
        const orbDifference = Math.abs(normalizedAngle - aspectType.angle);
        
        if (orbDifference <= aspectType.orb) {
          const transit: SimpleTransit = {
            planet: transitingPlanet,
            aspect: aspectType.name,
            targetPlanet: natalPlanet,
            orb: orbDifference,
            exact: orbDifference < 1,
            influence: getTransitInfluence(aspectType.name),
            message: getTransitMessage(transitingPlanet, aspectType.name, natalPlanet),
            timing: getTransitTiming(orbDifference),
            exactDate: orbDifference < 1 ? new Date().toISOString().split('T')[0] : undefined
          };
          
          aspects.push(transit);
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Get transit influence based on aspect type
 */
function getTransitInfluence(aspectType: string): 'harmonious' | 'challenging' | 'neutral' {
  switch (aspectType) {
    case 'conjunction':
      return 'neutral';
    case 'opposition':
    case 'square':
      return 'challenging';
    default:
      return 'neutral';
  }
}

/**
 * Get meaningful transit message
 */
function getTransitMessage(planet: string, aspect: string, targetPlanet: string): string {
  const messages: Record<string, Record<string, string>> = {
    jupiter: {
      conjunction: `Major opportunity for growth and expansion in ${targetPlanet} area`,
      opposition: `Time to balance expansion with moderation in ${targetPlanet} matters`,
      square: `Challenges that lead to growth in ${targetPlanet} area`
    },
    saturn: {
      conjunction: `Time for serious commitment and responsibility in ${targetPlanet} area`,
      opposition: `Need to balance structure with freedom in ${targetPlanet} matters`,
      square: `Important lessons and tests in ${targetPlanet} area`
    },
    uranus: {
      conjunction: `Sudden changes and breakthroughs in ${targetPlanet} area`,
      opposition: `Need to balance innovation with stability in ${targetPlanet} matters`,
      square: `Disruptive changes that lead to freedom in ${targetPlanet} area`
    },
    neptune: {
      conjunction: `Spiritual awakening and inspiration in ${targetPlanet} area`,
      opposition: `Need to balance dreams with reality in ${targetPlanet} matters`,
      square: `Confusion that leads to spiritual clarity in ${targetPlanet} area`
    },
    pluto: {
      conjunction: `Deep transformation and empowerment in ${targetPlanet} area`,
      opposition: `Power struggles that lead to transformation in ${targetPlanet} matters`,
      square: `Intense transformation and rebirth in ${targetPlanet} area`
    }
  };
  
  return messages[planet]?.[aspect] || `Significant influence in ${targetPlanet} area`;
}

/**
 * Get transit timing based on orb
 */
function getTransitTiming(orb: number): 'active' | 'coming' | 'recent' {
  if (orb <= 1) return 'active';
  if (orb <= 3) return 'coming';
  return 'recent';
}

/**
 * Filter and sort transits by importance
 */
export function filterImportantTransits(transits: SimpleTransit[]): TransitAnalysis {
  // Sort by exactness (tightest orbs first)
  const sortedTransits = transits.sort((a, b) => a.orb - b.orb);
  
  // Take only top 5 most important transits
  const topTransits = sortedTransits.slice(0, 5);
  
  // Categorize by timing
  const activeNow = topTransits.filter(t => t.timing === 'active');
  const comingSoon = topTransits.filter(t => t.timing === 'coming');
  const recent = topTransits.filter(t => t.timing === 'recent');
  
  return {
    activeNow,
    comingSoon,
    recent
  };
}

/**
 * Generate simplified transit analysis
 */
export function generateSimpleTransitAnalysis(natalPlanets: Record<string, number>): TransitAnalysis {
  const currentSkyPositions = getCurrentSkyPositions();
  const allTransits = calculateTransitAspects(natalPlanets, currentSkyPositions);
  return filterImportantTransits(allTransits);
}
