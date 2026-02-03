// Nakshatra Calculation System
// Calculates nakshatra positions and analysis from planetary data

import { NAKSHATRAS, NakshatraData, getNakshatraFromLongitude } from './nakshatraData';

export interface PlanetaryNakshatra {
  planet: string;
  longitude: number;
  nakshatra: NakshatraData;
  pada: number;
  padaSign: string;
  nakshatraLord: string;
  isRetrograde: boolean;
  degreeInNakshatra: number;
  minuteInNakshatra: number;
}

export interface NakshatraAnalysis {
  planetaryNakshatras: PlanetaryNakshatra[];
  moonNakshatra: PlanetaryNakshatra;
  sunNakshatra: PlanetaryNakshatra;
  ascendantNakshatra: PlanetaryNakshatra;
  nakshatraSummary: {
    totalNakshatras: number;
    uniqueNakshatras: number;
    mostFrequentNakshatra: string;
    nakshatraDistribution: { [key: string]: number };
  };
  nakshatraInsights: {
    dominantElement: string;
    dominantQuality: string;
    dominantCaste: string;
    dominantNature: string;
  };
}

export class NakshatraCalculator {
  private ayanamsa: number = 23.85; // Default Lahiri ayanamsa

  constructor(ayanamsa?: number) {
    this.ayanamsa = ayanamsa || 23.85;
  }

  /**
   * Calculate nakshatra analysis from planetary positions
   */
  public calculateNakshatraAnalysis(planetaryPositions: any[]): NakshatraAnalysis {
    const list = Array.isArray(planetaryPositions) ? planetaryPositions : [];
    const planetaryNakshatras = this.calculatePlanetaryNakshatras(list);
    
    // Find key planetary nakshatras
    const moonNakshatra = planetaryNakshatras.find(p => p.planet === 'Moon') || planetaryNakshatras[0];
    const sunNakshatra = planetaryNakshatras.find(p => p.planet === 'Sun') || planetaryNakshatras[0];
    const ascendantNakshatra = planetaryNakshatras.find(p => p.planet === 'Ascendant') || planetaryNakshatras[0];

    // Calculate nakshatra summary
    const nakshatraSummary = this.calculateNakshatraSummary(planetaryNakshatras);
    
    // Calculate nakshatra insights
    const nakshatraInsights = this.calculateNakshatraInsights(planetaryNakshatras);

    return {
      planetaryNakshatras,
      moonNakshatra,
      sunNakshatra,
      ascendantNakshatra,
      nakshatraSummary,
      nakshatraInsights
    };
  }

  /**
   * Calculate nakshatra for each planet
   */
  private calculatePlanetaryNakshatras(planetaryPositions: any[]): PlanetaryNakshatra[] {
    const list = Array.isArray(planetaryPositions) ? planetaryPositions : [];
    return list
      .filter(planet => {
        // Filter out planets with invalid longitude
        if (planet.longitude === undefined || planet.longitude === null || isNaN(planet.longitude)) {
          console.warn(`⚠️ Skipping ${planet.planet} - invalid longitude:`, planet.longitude);
          return false;
        }
        return true;
      })
      .map(planet => {
        // The longitude is already sidereal, use it directly
        const siderealLongitude = planet.longitude;
        
        // Ensure positive longitude (0-360 range)
        const adjustedLongitude = siderealLongitude < 0 ? siderealLongitude + 360 : siderealLongitude;
        
        // Get nakshatra data
        const nakshatra = getNakshatraFromLongitude(adjustedLongitude);
        
        if (!nakshatra) {
          console.error(`❌ Failed to get nakshatra for ${planet.planet} at longitude ${adjustedLongitude}`);
          return null;
        }
        
        // Calculate pada (quarter of nakshatra)
        const degreeInNakshatra = adjustedLongitude % (360 / 27);
        const pada = Math.floor(degreeInNakshatra / (360 / 27 / 4)) + 1;
        const padaSign = nakshatra.pada[pada as keyof typeof nakshatra.pada];
        
        // Calculate exact degree and minute within nakshatra
        const degreeInNakshatraExact = degreeInNakshatra % (360 / 27);
        const minuteInNakshatra = Math.floor((degreeInNakshatraExact % 1) * 60);
        
        return {
          planet: planet.planet,
          longitude: adjustedLongitude,
          nakshatra,
          pada,
          padaSign,
          nakshatraLord: nakshatra.lord,
          isRetrograde: planet.speed < 0,
          degreeInNakshatra: Math.floor(degreeInNakshatraExact),
          minuteInNakshatra
        };
      })
      .filter(Boolean); // Remove any null results
  }

  /**
   * Calculate nakshatra summary statistics
   */
  private calculateNakshatraSummary(planetaryNakshatras: PlanetaryNakshatra[]): any {
    const nakshatraCounts: { [key: string]: number } = {};
    
    planetaryNakshatras.forEach(p => {
      const nakshatraName = p.nakshatra.englishName;
      nakshatraCounts[nakshatraName] = (nakshatraCounts[nakshatraName] || 0) + 1;
    });

    const uniqueNakshatras = Object.keys(nakshatraCounts).length;
    const mostFrequentNakshatra = uniqueNakshatras > 0 
      ? Object.keys(nakshatraCounts).reduce((a, b) => 
          nakshatraCounts[a] > nakshatraCounts[b] ? a : b
        )
      : 'None';

    return {
      totalNakshatras: planetaryNakshatras.length,
      uniqueNakshatras,
      mostFrequentNakshatra,
      nakshatraDistribution: nakshatraCounts
    };
  }

  /**
   * Calculate nakshatra insights
   */
  private calculateNakshatraInsights(planetaryNakshatras: PlanetaryNakshatra[]): any {
    const elementCounts: { [key: string]: number } = {};
    const qualityCounts: { [key: string]: number } = {};
    const casteCounts: { [key: string]: number } = {};
    const natureCounts: { [key: string]: number } = {};

    planetaryNakshatras.forEach(p => {
      const nakshatra = p.nakshatra;
      
      elementCounts[nakshatra.element] = (elementCounts[nakshatra.element] || 0) + 1;
      qualityCounts[nakshatra.quality] = (qualityCounts[nakshatra.quality] || 0) + 1;
      casteCounts[nakshatra.caste] = (casteCounts[nakshatra.caste] || 0) + 1;
      natureCounts[nakshatra.nature] = (natureCounts[nakshatra.nature] || 0) + 1;
    });

    const dominantElement = Object.keys(elementCounts).length > 0
      ? Object.keys(elementCounts).reduce((a, b) => 
          elementCounts[a] > elementCounts[b] ? a : b
        )
      : 'Unknown';
    const dominantQuality = Object.keys(qualityCounts).length > 0
      ? Object.keys(qualityCounts).reduce((a, b) => 
          qualityCounts[a] > qualityCounts[b] ? a : b
        )
      : 'Unknown';
    const dominantCaste = Object.keys(casteCounts).length > 0
      ? Object.keys(casteCounts).reduce((a, b) => 
          casteCounts[a] > casteCounts[b] ? a : b
        )
      : 'Unknown';
    const dominantNature = Object.keys(natureCounts).length > 0
      ? Object.keys(natureCounts).reduce((a, b) => 
          natureCounts[a] > natureCounts[b] ? a : b
        )
      : 'Unknown';

    return {
      dominantElement,
      dominantQuality,
      dominantCaste,
      dominantNature
    };
  }

  /**
   * Get nakshatra compatibility between two charts
   */
  public calculateNakshatraCompatibility(
    chart1Nakshatras: PlanetaryNakshatra[],
    chart2Nakshatras: PlanetaryNakshatra[]
  ): {
    compatibilityScore: number;
    compatibleNakshatras: string[];
    incompatibleNakshatras: string[];
    analysis: string;
  } {
    const moon1 = chart1Nakshatras.find(p => p.planet === 'Moon');
    const moon2 = chart2Nakshatras.find(p => p.planet === 'Moon');
    
    if (!moon1 || !moon2) {
      return {
        compatibilityScore: 0,
        compatibleNakshatras: [],
        incompatibleNakshatras: [],
        analysis: 'Moon nakshatra not found in one or both charts'
      };
    }

    // Calculate compatibility based on nakshatra lords
    const lord1 = moon1.nakshatraLord;
    const lord2 = moon2.nakshatraLord;
    
    let compatibilityScore = 0;
    const compatibleNakshatras: string[] = [];
    const incompatibleNakshatras: string[] = [];

    // Friendly lords (compatible)
    const friendlyLords: { [key: string]: string[] } = {
      'Sun': ['Moon', 'Mars', 'Jupiter'],
      'Moon': ['Sun', 'Mercury'],
      'Mars': ['Sun', 'Moon', 'Jupiter'],
      'Mercury': ['Sun', 'Venus'],
      'Jupiter': ['Sun', 'Moon', 'Mars'],
      'Venus': ['Mercury', 'Saturn'],
      'Saturn': ['Mercury', 'Venus'],
      'Rahu': ['Ketu'],
      'Ketu': ['Rahu']
    };

    if (friendlyLords[lord1]?.includes(lord2)) {
      compatibilityScore = 80;
      compatibleNakshatras.push(`${moon1.nakshatra.englishName} (${lord1}) & ${moon2.nakshatra.englishName} (${lord2})`);
    } else if (lord1 === lord2) {
      compatibilityScore = 60;
      compatibleNakshatras.push(`Same nakshatra lord: ${lord1}`);
    } else {
      compatibilityScore = 40;
      incompatibleNakshatras.push(`${moon1.nakshatra.englishName} (${lord1}) & ${moon2.nakshatra.englishName} (${lord2})`);
    }

    let analysis = '';
    if (compatibilityScore >= 70) {
      analysis = 'High compatibility - these nakshatras work well together';
    } else if (compatibilityScore >= 50) {
      analysis = 'Moderate compatibility - some challenges but workable';
    } else {
      analysis = 'Low compatibility - significant challenges in relationship';
    }

    return {
      compatibilityScore,
      compatibleNakshatras,
      incompatibleNakshatras,
      analysis
    };
  }

  /**
   * Get nakshatra predictions based on current transits
   */
  public getNakshatraPredictions(
    birthNakshatras: PlanetaryNakshatra[],
    currentTransits: PlanetaryNakshatra[]
  ): {
    currentInfluences: string[];
    upcomingChanges: string[];
    recommendations: string[];
  } {
    const moonNakshatra = birthNakshatras.find(p => p.planet === 'Moon');
    const sunNakshatra = birthNakshatras.find(p => p.planet === 'Sun');
    
    if (!moonNakshatra || !sunNakshatra) {
      return {
        currentInfluences: [],
        upcomingChanges: [],
        recommendations: []
      };
    }

    const currentInfluences: string[] = [];
    const upcomingChanges: string[] = [];
    const recommendations: string[] = [];

    // Analyze current transit influences
    currentTransits.forEach(transit => {
      const birthPlanet = birthNakshatras.find(p => p.planet === transit.planet);
      if (birthPlanet) {
        const influence = this.getNakshatraInfluence(birthPlanet.nakshatra, transit.nakshatra);
        currentInfluences.push(`${transit.planet} in ${transit.nakshatra.englishName}: ${influence}`);
      }
    });

    // Generate recommendations based on nakshatra characteristics
    recommendations.push(`Focus on ${moonNakshatra.nakshatra.characteristics.join(', ')}`);
    recommendations.push(`Worship ${moonNakshatra.nakshatra.deity} for blessings`);
    recommendations.push(`Consider careers in ${moonNakshatra.nakshatra.career.join(', ')}`);

    return {
      currentInfluences,
      upcomingChanges,
      recommendations
    };
  }

  /**
   * Get influence between two nakshatras
   */
  private getNakshatraInfluence(birthNakshatra: NakshatraData, transitNakshatra: NakshatraData): string {
    if (birthNakshatra.lord === transitNakshatra.lord) {
      return 'Strong influence - same nakshatra lord';
    } else if (birthNakshatra.element === transitNakshatra.element) {
      return 'Harmonious influence - same element';
    } else {
      return 'Neutral influence - different elements';
    }
  }
}

/**
 * Main function to calculate nakshatra analysis
 */
export function calculateNakshatraAnalysis(
  planetaryPositions: any[],
  ayanamsa: number = 23.85
): NakshatraAnalysis {
  const calculator = new NakshatraCalculator(ayanamsa);
  return calculator.calculateNakshatraAnalysis(planetaryPositions);
}
