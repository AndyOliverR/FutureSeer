// Yoga Timing Calculation System
// Calculates when yogas activate based on Dasha periods, transits, and planetary movements

export interface YogaTiming {
  isActiveNow: boolean;
  activationScore: number; // 0-100%
  currentPeriod?: string;
  activationPeriods: ActivationPeriod[];
  peakWindows: PeakWindow[];
  nextActivation?: Date;
  currentStatus: string;
  upcomingActivations: UpcomingActivation[];
}

export interface ActivationPeriod {
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha';
  planet: string;
  startDate: string;
  endDate: string;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  description: string;
}

export interface PeakWindow {
  startDate: string;
  endDate: string;
  reason: string;
  strength: number; // 0-100%
}

export interface UpcomingActivation {
  date: string;
  type: 'transit' | 'dasha_change' | 'planetary_return';
  description: string;
  strength: number;
}

export interface DashaData {
  currentDasha?: {
    planet: string;
    startDate: string;
    endDate: string;
    progress: number;
  };
  currentAntardasha?: {
    planet: string;
    startDate: string;
    endDate: string;
    progress: number;
  };
  fullSequence?: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    type: 'mahadasha' | 'antardasha';
  }>;
}

export interface TransitData {
  currentTransits?: Array<{
    planet: string;
    sign: string;
    house: number;
    isRetrograde: boolean;
  }>;
  upcomingTransits?: Array<{
    planet: string;
    sign: string;
    house: number;
    date: string;
    type: string;
  }>;
}

export interface Yoga {
  name: string;
  type: string;
  condition: string;
  description: string;
  effects: string[];
  strength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  isActive: boolean;
  planets?: string[]; // Planets involved in this yoga
  houses?: number[]; // Houses involved in this yoga
}

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

// Main function to calculate yoga timing
export function calculateYogaTiming(
  yoga: Yoga,
  dashaData: DashaData,
  transitData: TransitData,
  birthData: BirthData
): YogaTiming {
  const activationPeriods = getYogaActivationPeriods(yoga, dashaData);
  const peakWindows = calculatePeakWindows(yoga, dashaData, birthData);
  const isActiveNow = isYogaActiveNow(yoga, dashaData, transitData);
  const activationScore = calculateActivationScore(yoga, dashaData, transitData);
  const currentPeriod = getCurrentActivationPeriod(yoga, dashaData);
  const nextActivation = getNextActivation(yoga, dashaData, transitData);
  const currentStatus = getCurrentStatus(yoga, dashaData, transitData, activationScore);
  const upcomingActivations = getUpcomingActivations(yoga, dashaData, transitData);

  return {
    isActiveNow,
    activationScore,
    currentPeriod,
    activationPeriods,
    peakWindows,
    nextActivation,
    currentStatus,
    upcomingActivations
  };
}

// Get activation periods based on dasha sequence
function getYogaActivationPeriods(yoga: Yoga, dashaData: DashaData): ActivationPeriod[] {
  const periods: ActivationPeriod[] = [];
  
  if (!dashaData.fullSequence || !yoga.planets) {
    return periods;
  }

  // Find dasha periods where the dasha lord is one of the yoga-forming planets
  dashaData.fullSequence.forEach((dasha) => {
    // Normalize planet names for comparison
    const dashaPlanet = dasha.planet?.toLowerCase();
    const yogaPlanets = yoga.planets!.map(p => p.toLowerCase());
    
    if (yogaPlanets.includes(dashaPlanet)) {
      const strength = calculateDashaStrength(dasha.planet, yoga);
      
      periods.push({
        type: dasha.type || 'mahadasha',
        planet: dasha.planet,
        startDate: dasha.startDate,
        endDate: dasha.endDate,
        strength,
        description: `${dasha.planet} ${dasha.type || 'mahadasha'} activates ${yoga.name}`
      });
    }
  });

  return periods.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Calculate peak effect windows
function calculatePeakWindows(yoga: Yoga, dashaData: DashaData, birthData: BirthData): PeakWindow[] {
  const windows: PeakWindow[] = [];
  
  if (!dashaData.fullSequence || !yoga.planets) {
    return windows;
  }

  // Find periods where multiple yoga planets are active simultaneously
  const yogaPlanets = yoga.planets;
  
  dashaData.fullSequence.forEach(dasha => {
    if (yogaPlanets.includes(dasha.planet)) {
      // Calculate peak strength based on yoga type and planet
      const strength = calculatePeakStrength(dasha.planet, yoga);
      
      windows.push({
        startDate: dasha.startDate,
        endDate: dasha.endDate,
        reason: `${dasha.planet} ${dasha.type} - Peak activation of ${yoga.name}`,
        strength
      });
    }
  });

  return windows.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Check if yoga is currently active
function isYogaActiveNow(yoga: Yoga, dashaData: DashaData, transitData: TransitData): boolean {
  if (!yoga.planets) return false;

  // Check current dasha
  const currentDashaActive = dashaData.currentDasha && 
    yoga.planets.includes(dashaData.currentDasha.planet);
  
  const currentAntardashaActive = dashaData.currentAntardasha && 
    yoga.planets.includes(dashaData.currentAntardasha.planet);

  // Check current transits
  const transitActive = transitData.currentTransits?.some(transit => 
    yoga.planets!.includes(transit.planet)
  );

  return currentDashaActive || currentAntardashaActive || transitActive || false;
}

// Calculate current activation score (0-100%)
function calculateActivationScore(yoga: Yoga, dashaData: DashaData, transitData: TransitData): number {
  let score = 0;

  // Base score from yoga strength (30%)
  const yogaStrengthScore = getYogaStrengthScore(yoga.strength);
  score += yogaStrengthScore * 0.3;

  // Dasha activation (40%)
  let dashaScore = 0;
  if (dashaData.currentDasha && yoga.planets?.includes(dashaData.currentDasha.planet)) {
    dashaScore += 40; // Full mahadasha activation
  }
  if (dashaData.currentAntardasha && yoga.planets?.includes(dashaData.currentAntardasha.planet)) {
    dashaScore += 20; // Additional antardasha boost
  }
  score += dashaScore * 0.4;

  // Transit activation (30%)
  let transitScore = 0;
  if (transitData.currentTransits) {
    const activeTransits = transitData.currentTransits.filter(transit => 
      yoga.planets?.includes(transit.planet)
    );
    transitScore = Math.min(activeTransits.length * 15, 30); // Max 30 points
  }
  score += transitScore * 0.3;

  return Math.round(Math.min(score, 100));
}

// Get current activation period description
function getCurrentActivationPeriod(yoga: Yoga, dashaData: DashaData): string | undefined {
  if (!yoga.planets) return undefined;

  const currentDasha = dashaData.currentDasha;
  const currentAntardasha = dashaData.currentAntardasha;

  if (currentDasha && yoga.planets.includes(currentDasha.planet)) {
    if (currentAntardasha && yoga.planets.includes(currentAntardasha.planet)) {
      return `${currentDasha.planet} Mahadasha - ${currentAntardasha.planet} Antardasha`;
    }
    return `${currentDasha.planet} Mahadasha`;
  }

  if (currentAntardasha && yoga.planets.includes(currentAntardasha.planet)) {
    return `${currentAntardasha.planet} Antardasha`;
  }

  return undefined;
}

// Get next activation date
function getNextActivation(yoga: Yoga, dashaData: DashaData, transitData: TransitData): Date | undefined {
  if (!yoga.planets) return undefined;

  const now = new Date();
  const tenYearsFromNow = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
  let nextDate: Date | undefined;

  // Check upcoming dasha changes (within 10 years only)
  if (dashaData.fullSequence) {
    for (const dasha of dashaData.fullSequence) {
      const dashaStart = new Date(dasha.startDate);
      if (dashaStart > now && dashaStart <= tenYearsFromNow && yoga.planets.includes(dasha.planet)) {
        if (!nextDate || dashaStart < nextDate) {
          nextDate = dashaStart;
        }
      }
    }
  }

  // Check upcoming transits (within 10 years only)
  if (transitData.upcomingTransits) {
    for (const transit of transitData.upcomingTransits) {
      const transitDate = new Date(transit.date);
      if (transitDate > now && transitDate <= tenYearsFromNow && yoga.planets.includes(transit.planet)) {
        if (!nextDate || transitDate < nextDate) {
          nextDate = transitDate;
        }
      }
    }
  }

  return nextDate;
}

// Get current status description
function getCurrentStatus(
  yoga: Yoga, 
  dashaData: DashaData, 
  transitData: TransitData, 
  activationScore: number
): string {
  if (activationScore >= 80) {
    return "Highly Active - Peak manifestation period";
  } else if (activationScore >= 60) {
    return "Moderately Active - Good manifestation period";
  } else if (activationScore >= 40) {
    return "Mildly Active - Gradual activation";
  } else if (activationScore >= 20) {
    return "Dormant - Minimal activation";
  } else {
    return "Inactive - Awaiting activation";
  }
}

// Get upcoming activations
function getUpcomingActivations(yoga: Yoga, dashaData: DashaData, transitData: TransitData): UpcomingActivation[] {
  const activations: UpcomingActivation[] = [];
  
  if (!yoga.planets) return activations;

  // Add upcoming dasha activations
  if (dashaData.fullSequence) {
    dashaData.fullSequence.forEach(dasha => {
      const dashaDate = new Date(dasha.startDate);
      if (dashaDate > new Date() && yoga.planets!.includes(dasha.planet)) {
        activations.push({
          date: dasha.startDate,
          type: 'dasha_change',
          description: `${dasha.planet} ${dasha.type} begins - ${yoga.name} activation`,
          strength: calculateDashaStrength(dasha.planet, yoga) === 'very_strong' ? 90 : 70
        });
      }
    });
  }

  // Add upcoming transit activations
  if (transitData.upcomingTransits) {
    transitData.upcomingTransits.forEach(transit => {
      const transitDate = new Date(transit.date);
      if (transitDate > new Date() && yoga.planets!.includes(transit.planet)) {
        activations.push({
          date: transit.date,
          type: 'transit',
          description: `${transit.planet} transit - ${yoga.name} trigger`,
          strength: 60
        });
      }
    });
  }

  return activations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper functions
function getYogaStrengthScore(strength: string): number {
  switch (strength) {
    case 'Very Strong': return 100;
    case 'Strong': return 80;
    case 'Moderate': return 60;
    case 'Weak': return 40;
    default: return 50;
  }
}

function calculateDashaStrength(planet: string, yoga: Yoga): 'weak' | 'moderate' | 'strong' | 'very_strong' {
  // Raj Yogas are stronger with benefic planets
  if (yoga.type === 'Raj Yoga' && ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet)) {
    return 'very_strong';
  }
  
  // Dhana Yogas are stronger with wealth planets
  if (yoga.type === 'Dhana Yoga' && ['Jupiter', 'Venus', 'Mercury'].includes(planet)) {
    return 'very_strong';
  }
  
  // General strength based on yoga strength
  switch (yoga.strength) {
    case 'Very Strong': return 'very_strong';
    case 'Strong': return 'strong';
    case 'Moderate': return 'moderate';
    default: return 'weak';
  }
}

function calculatePeakStrength(planet: string, yoga: Yoga): number {
  const baseStrength = getYogaStrengthScore(yoga.strength);
  
  // Enhance based on planet-yoga compatibility
  if (yoga.type === 'Raj Yoga' && ['Jupiter', 'Sun', 'Mars'].includes(planet)) {
    return Math.min(baseStrength + 20, 100);
  }
  
  if (yoga.type === 'Dhana Yoga' && ['Jupiter', 'Venus', 'Mercury'].includes(planet)) {
    return Math.min(baseStrength + 15, 100);
  }
  
  return baseStrength;
}

// Utility function to format dates
export function formatActivationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility function to get activation status color
export function getActivationStatusColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

// Utility function to get activation status badge
export function getActivationStatusBadge(score: number, isActive: boolean): string {
  if (!isActive) return 'Inactive';
  if (score >= 80) return 'Highly Active';
  if (score >= 60) return 'Active';
  if (score >= 40) return 'Mildly Active';
  return 'Dormant';
}
