// Ashtakavarga System - Point-based Predictive System
// Shows planetary strength in each house (0-8 Bindus/points)

export interface AshtakavargaResult {
  houses: number[]; // 12 houses with bindu counts (0-8 each)
  sarvashtakavarga: number[]; // Combined all planets
  planetaryAshtakavarga: Record<string, number[]>; // Individual planet contributions
  totalBindus: number;
  strongHouses: number[]; // Houses with 4+ bindus
  weakHouses: number[]; // Houses with <4 bindus
}

// Simplified Ashtakavarga rules (from Parashara)
// Each planet contributes bindus to certain houses based on its position
const ASHTAKAVARGA_RULES: Record<string, number[]> = {
  Sun: [1, 2, 4, 7, 8, 9, 10, 11], // Houses where Sun contributes (from its own position)
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [1, 2, 4, 7, 8, 10, 11],
  Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
  Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 5, 6, 11]
};

/**
 * Calculate Ashtakavarga for all planets
 * 
 * @param planets - Object with planet data (must include sign/house info)
 * @returns Ashtakavarga result with bindu counts per house
 */
export function calculateAshtakavarga(planets: Record<string, any>): AshtakavargaResult {
  // Initialize 12 houses with 0 bindus
  const sarvashtakavarga = Array(12).fill(0);
  const planetaryAshtakavarga: Record<string, number[]> = {};
  
  // Calculate for each planet
  Object.entries(planets).forEach(([planetName, planetData]) => {
    // Skip Rahu and Ketu for traditional Ashtakavarga
    if (planetName === 'rahu' || planetName === 'ketu') return;
    
    const capitalizedName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
    const rules = ASHTAKAVARGA_RULES[capitalizedName];
    
    if (!rules) return;
    
    // Initialize this planet's contribution
    const planetBindus = Array(12).fill(0);
    
    // Get planet's sign (0-11)
    const planetSign = planetData.sign;
    
    // Apply rules: add bindus to favorable houses
    rules.forEach(offset => {
      const targetHouse = (planetSign + offset - 1) % 12;
      planetBindus[targetHouse]++;
      sarvashtakavarga[targetHouse]++;
    });
    
    planetaryAshtakavarga[planetName] = planetBindus;
  });
  
  // Calculate total bindus
  const totalBindus = sarvashtakavarga.reduce((sum, count) => sum + count, 0);
  
  // Identify strong and weak houses
  const strongHouses: number[] = [];
  const weakHouses: number[] = [];
  
  sarvashtakavarga.forEach((bindus, index) => {
    if (bindus >= 4) {
      strongHouses.push(index + 1); // 1-based house numbering
    } else {
      weakHouses.push(index + 1);
    }
  });
  
  return {
    houses: sarvashtakavarga,
    sarvashtakavarga,
    planetaryAshtakavarga,
    totalBindus,
    strongHouses,
    weakHouses
  };
}

/**
 * Get interpretation for Ashtakavarga results
 * 
 * @param ashtakavarga - Result from calculateAshtakavarga
 * @returns Human-readable interpretation
 */
export function interpretAshtakavarga(ashtakavarga: AshtakavargaResult): string[] {
  const interpretations: string[] = [];
  
  // Overall strength
  if (ashtakavarga.totalBindus > 300) {
    interpretations.push("Overall chart strength is excellent (300+ bindus)");
  } else if (ashtakavarga.totalBindus > 250) {
    interpretations.push("Overall chart strength is good (250+ bindus)");
  } else {
    interpretations.push("Chart shows moderate strength - focus on strengthening weak houses");
  }
  
  // Strong houses
  if (ashtakavarga.strongHouses.length > 0) {
    interpretations.push(`Strong houses (4+ bindus): ${ashtakavarga.strongHouses.join(', ')}`);
    interpretations.push("These houses will give positive results and support your goals");
  }
  
  // Weak houses
  if (ashtakavarga.weakHouses.length > 0) {
    interpretations.push(`Weak houses (<4 bindus): ${ashtakavarga.weakHouses.join(', ')}`);
    interpretations.push("These houses may require extra effort and remedies");
  }
  
  // Specific house interpretations
  ashtakavarga.houses.forEach((bindus, index) => {
    const house = index + 1;
    if (bindus >= 6) {
      interpretations.push(`House ${house}: Exceptionally strong (${bindus} bindus) - excellent results expected`);
    } else if (bindus <= 2) {
      interpretations.push(`House ${house}: Very weak (${bindus} bindus) - challenges likely, remedies recommended`);
    }
  });
  
  return interpretations;
}

/**
 * Calculate transit effects using Ashtakavarga
 * 
 * @param natalAshtakavarga - Natal chart Ashtakavarga
 * @param transitPlanet - Current position of transiting planet
 * @returns Transit strength and effects
 */
export function calculateTransitStrength(
  natalAshtakavarga: AshtakavargaResult,
  transitPlanet: { name: string; sign: number }
): { strength: number; effect: string } {
  const bindus = natalAshtakavarga.houses[transitPlanet.sign];
  
  let effect = "";
  if (bindus >= 5) {
    effect = "Very favorable - excellent time for activities related to this house";
  } else if (bindus >= 4) {
    effect = "Favorable - good results expected";
  } else if (bindus >= 3) {
    effect = "Moderate - mixed results";
  } else {
    effect = "Challenging - be cautious, consider remedies";
  }
  
  return { strength: bindus, effect };
}

