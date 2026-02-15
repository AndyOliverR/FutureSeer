/**
 * Human Design Calculator
 * Calculates Human Design chart from birth data
 */

import { devLog } from '@/lib/devLogger';
import { 
  GATES, 
  CENTERS, 
  CHANNELS, 
  TYPES, 
  AUTHORITIES, 
  PROFILES,
  MOTOR_CENTERS,
  getGateFromPlanetPosition,
  getLineFromPlanetPosition
} from './humanDesignData';

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export interface PlanetGate {
  planet: string;
  gate: number;
  line: number;
  longitude: number;
  center: string;
}

export interface HumanDesignChart {
  type: {
    id: string;
    name: string;
    strategy: string;
    description: string;
    notSelfTheme: string;
  };
  strategy: string;
  authority: {
    id: string;
    name: string;
    description: string;
  };
  profile: {
    id: string;
    name: string;
    description: string;
    role: string;
  };
  centers: {
    defined: string[];
    undefined: string[];
    details: Record<string, {
      name: string;
      description: string;
      isDefined: boolean;
      gates: number[];
    }>;
  };
  gates: PlanetGate[];
  channels: Array<{
    id: string;
    name: string;
    gates: [number, number];
    centers: [string, string];
    description: string;
  }>;
  incarnationCross: {
    sunGate: number;
    earthGate: number;
    name: string;
    description: string;
  };
  definition: {
    type: 'single' | 'split' | 'triple_split' | 'quadruple_split';
    description: string;
  };
}

/**
 * Main function to calculate Human Design chart
 */
export async function calculateHumanDesignChart(birthData: BirthData): Promise<HumanDesignChart> {
  // Get astrological chart data
  const astroChart = await getAstrologicalChart(birthData);
  
  // Map planets to gates
  const planetGates = mapPlanetsToGates(astroChart.planets);
  
  // Calculate which centers are defined
  const centers = calculateCenters(planetGates);
  
  // Determine type
  const type = determineType(centers.defined, planetGates);
  
  // Calculate strategy
  const strategy = calculateStrategy(type.id);
  
  // Determine authority
  const authority = identifyAuthority(centers.defined, type.id);
  
  // Calculate profile
  const profile = calculateProfile(planetGates);
  
  // Identify channels
  const channels = identifyChannels(planetGates);
  
  // Calculate incarnation cross
  const incarnationCross = calculateIncarnationCross(planetGates);
  
  // Calculate definition
  const definition = calculateDefinition(centers.defined, channels);
  
  return {
    type,
    strategy,
    authority,
    profile: {
      id: profile.name ?? 'profile',
      name: profile.name,
      description: profile.description,
      role: profile.role
    },
    centers,
    gates: planetGates,
    channels,
    incarnationCross,
    definition
  };
}

/**
 * Get astrological chart data using direct calculation
 */
async function getAstrologicalChart(birthData: BirthData): Promise<{
  planets: Array<{ name: string; longitude: number }>;
  ascendant: { longitude: number };
}> {
  try {
    // Import calculation functions directly
    const { calculateTropicalPlanets, calculateTropicalHouses } = await import('@/lib/western/tropicalCalculator');
    
    // Parse birth date and time
    const [year, month, day] = birthData.birthDate.split('-').map(Number);
    const [hour, minute] = birthData.birthTime.split(':').map(Number);
    const birthDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute || 0));
    
    // Calculate tropical planets (Human Design uses tropical zodiac)
    const planetsData = calculateTropicalPlanets(birthDateTime);
    
    // Calculate houses to get ascendant
    const houses = calculateTropicalHouses(birthDateTime, birthData.latitude, birthData.longitude);
    
    // Extract planets and their longitudes
    const planets = [
      { name: 'Sun', longitude: planetsData.sun.longitude },
      { name: 'Earth', longitude: (planetsData.sun.longitude + 180) % 360 }, // Earth is opposite Sun
      { name: 'Moon', longitude: planetsData.moon.longitude },
      { name: 'Mercury', longitude: planetsData.mercury.longitude },
      { name: 'Venus', longitude: planetsData.venus.longitude },
      { name: 'Mars', longitude: planetsData.mars.longitude },
      { name: 'Jupiter', longitude: planetsData.jupiter.longitude },
      { name: 'Saturn', longitude: planetsData.saturn.longitude },
      { name: 'Uranus', longitude: planetsData.uranus.longitude },
      { name: 'Neptune', longitude: planetsData.neptune.longitude },
      { name: 'Pluto', longitude: planetsData.pluto.longitude },
      { name: 'NorthNode', longitude: planetsData.northNode.longitude },
      { name: 'SouthNode', longitude: planetsData.southNode.longitude }
    ];

    // Get ascendant from first house cusp
    const ascendant = {
      longitude: houses[0]?.longitude || 0
    };

    return { planets, ascendant };
  } catch (error) {
    devLog.error('Error calculating astrological chart:', error, 'humanDesignCalculator');
    // Fallback: calculate basic positions if calculation fails
    return calculateBasicPlanetaryPositions(birthData);
  }
}

/**
 * Fallback: Calculate basic planetary positions
 */
function calculateBasicPlanetaryPositions(birthData: BirthData): {
  planets: Array<{ name: string; longitude: number }>;
  ascendant: { longitude: number };
} {
  // This is a simplified fallback - in production, use proper ephemeris
  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hour, minute] = birthData.birthTime.split(':').map(Number);
  
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
  
  // Simplified planetary positions (approximate)
  const planets = [
    { name: 'Sun', longitude: (280 + daysSinceEpoch * 0.9856) % 360 },
    { name: 'Moon', longitude: (280 + daysSinceEpoch * 13.1764) % 360 },
    { name: 'Mercury', longitude: (280 + daysSinceEpoch * 4.0923) % 360 },
    { name: 'Venus', longitude: (280 + daysSinceEpoch * 1.6021) % 360 },
    { name: 'Mars', longitude: (280 + daysSinceEpoch * 0.5240) % 360 },
    { name: 'Jupiter', longitude: (280 + daysSinceEpoch * 0.0831) % 360 },
    { name: 'Saturn', longitude: (280 + daysSinceEpoch * 0.0335) % 360 },
    { name: 'Uranus', longitude: (280 + daysSinceEpoch * 0.0118) % 360 },
    { name: 'Neptune', longitude: (280 + daysSinceEpoch * 0.0060) % 360 },
    { name: 'Pluto', longitude: (280 + daysSinceEpoch * 0.0040) % 360 },
    { name: 'NorthNode', longitude: (280 + daysSinceEpoch * 0.0529) % 360 },
    { name: 'SouthNode', longitude: ((280 + daysSinceEpoch * 0.0529) + 180) % 360 }
  ];

  // Calculate ascendant (simplified)
  const siderealTime = calculateSiderealTime(year, month, day, hour, minute, birthData.longitude);
  const ascendantLongitude = (siderealTime * 15 + birthData.latitude) % 360;

  return {
    planets,
    ascendant: { longitude: ascendantLongitude }
  };
}

/**
 * Calculate sidereal time (simplified)
 */
function calculateSiderealTime(year: number, month: number, day: number, hour: number, minute: number, longitude: number): number {
  const jd = calculateJulianDay(year, month, day, hour, minute);
  const t = (jd - 2451545.0) / 36525.0;
  const theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + t * t * (0.000387933 - t / 38710000.0);
  return (theta + longitude) % 360 / 15;
}

/**
 * Calculate Julian Day
 */
function calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn + (hour - 12) / 24 + minute / 1440;
}

/**
 * Map planets to I Ching gates
 */
function mapPlanetsToGates(planets: Array<{ name: string; longitude: number }>): PlanetGate[] {
  return planets.map(planet => {
    const gate = getGateFromPlanetPosition(planet.longitude);
    const line = getLineFromPlanetPosition(planet.longitude);
    const gateData = GATES[gate];
    
    return {
      planet: planet.name,
      gate,
      line,
      longitude: planet.longitude,
      center: gateData?.center || 'unknown'
    };
  });
}

/**
 * Calculate which centers are defined
 */
function calculateCenters(planetGates: PlanetGate[]): {
  defined: string[];
  undefined: string[];
  details: Record<string, {
    name: string;
    description: string;
    isDefined: boolean;
    gates: number[];
  }>;
} {
  const centerGates: Record<string, number[]> = {};
  
  // Count gates in each center
  planetGates.forEach(({ gate, center }) => {
    if (!centerGates[center]) {
      centerGates[center] = [];
    }
    centerGates[center].push(gate);
  });
  
  // Check channels to see if centers are connected
  const connectedCenters = new Set<string>();
  planetGates.forEach(({ gate }) => {
    Object.values(CHANNELS).forEach(channel => {
      if (channel.gates.includes(gate as any)) {
        connectedCenters.add(channel.center1);
        connectedCenters.add(channel.center2);
      }
    });
  });
  
  const defined: string[] = [];
  const undefined: string[] = [];
  const details: Record<string, any> = {};
  
  Object.entries(CENTERS).forEach(([key, center]) => {
    const hasGates = (centerGates[center.id]?.length || 0) > 0;
    const isConnected = connectedCenters.has(center.id);
    const isDefined = hasGates || isConnected;
    
    if (isDefined) {
      defined.push(center.id);
    } else {
      undefined.push(center.id);
    }
    
    details[center.id] = {
      name: center.name,
      description: center.description,
      isDefined,
      gates: centerGates[center.id] || []
    };
  });
  
  return { defined, undefined, details };
}

/**
 * Determine Human Design Type
 */
function determineType(definedCenters: string[], planetGates: PlanetGate[]): typeof TYPES[keyof typeof TYPES] {
  const hasSacral = definedCenters.includes('sacral');
  const hasThroat = definedCenters.includes('throat');
  const hasMotor = MOTOR_CENTERS.some(motor => definedCenters.includes(motor));
  const hasThroatToMotor = hasThroat && hasMotor && isThroatConnectedToMotor(definedCenters, planetGates);
  
  // Reflector: No centers defined
  if (definedCenters.length === 0) {
    return TYPES.REFLECTOR;
  }
  
  // Manifestor: Throat connected to motor center
  if (hasThroatToMotor) {
    return TYPES.MANIFESTOR;
  }
  
  // Generator: Sacral defined
  if (hasSacral) {
    return TYPES.GENERATOR;
  }
  
  // Projector: Has defined centers but no motor
  return TYPES.PROJECTOR;
}

/**
 * Check if throat is connected to a motor center
 */
function isThroatConnectedToMotor(definedCenters: string[], planetGates: PlanetGate[]): boolean {
  const motorCenters = ['root', 'sacral', 'solar_plexus', 'heart'];
  const hasThroat = definedCenters.includes('throat');
  
  if (!hasThroat) return false;
  
  // Check if any channel connects throat to a motor center
  return Object.values(CHANNELS).some(channel => {
    if (!channel || !channel.center1 || !channel.center2) {
      return false;
    }
    const connectsThroat = channel.center1 === 'throat' || channel.center2 === 'throat';
    const connectsMotor = motorCenters.some(motor => channel.center1 === motor || channel.center2 === motor);
    return connectsThroat && connectsMotor;
  });
}

/**
 * Calculate Strategy based on Type
 */
function calculateStrategy(typeId: string): string {
  const type = Object.values(TYPES).find(t => t.id === typeId);
  return type?.strategy || 'Wait to Respond';
}

/**
 * Identify Authority
 */
function identifyAuthority(definedCenters: string[], typeId: string): typeof AUTHORITIES[keyof typeof AUTHORITIES] {
  // Reflector: Lunar Authority
  if (typeId === 'reflector') {
    return AUTHORITIES.LUNAR;
  }
  
  // Emotional Authority: Solar Plexus defined
  if (definedCenters.includes('solar_plexus')) {
    return AUTHORITIES.EMOTIONAL;
  }
  
  // Sacral Authority: Sacral defined
  if (definedCenters.includes('sacral')) {
    return AUTHORITIES.SACRAL;
  }
  
  // Splenic Authority: Spleen defined
  if (definedCenters.includes('spleen')) {
    return AUTHORITIES.SPLENIC;
  }
  
  // Self-Projected Authority: G and Throat defined
  if (definedCenters.includes('g') && definedCenters.includes('throat')) {
    return AUTHORITIES.SELF_PROJECTED;
  }
  
  // Ego Authority: Heart defined
  if (definedCenters.includes('heart')) {
    return AUTHORITIES.EGO;
  }
  
  // Environmental Authority: Default for Projectors
  return AUTHORITIES.ENVIRONMENTAL;
}

/**
 * Calculate Profile from Sun and Earth gates
 */
function calculateProfile(planetGates: PlanetGate[]): typeof PROFILES[keyof typeof PROFILES] {
  const sunGate = planetGates.find(p => p.planet === 'Sun');
  const earthGate = planetGates.find(p => p.planet === 'Earth') || 
                    planetGates.find(p => p.planet === 'Sun'); // Earth is opposite Sun
  
  const sunLine = sunGate?.line || 1;
  const earthLine = earthGate?.line || 1;
  
  // Profile is combination of Sun line and Earth line
  const profileKey = `${sunLine}/${earthLine}` as keyof typeof PROFILES;
  const profile = PROFILES[profileKey];
  
  if (profile) {
    return profile;
  }
  
  // Fallback to 1/3 if profile not found
  return PROFILES['1/3'];
}

/**
 * Identify active channels
 */
function identifyChannels(planetGates: PlanetGate[]): Array<{
  id: string;
  name: string;
  gates: [number, number];
  centers: [string, string];
  description: string;
}> {
  const activeGates = new Set(planetGates.map(p => p.gate));
  const channels: Array<{
    id: string;
    name: string;
    gates: [number, number];
    centers: [string, string];
    description: string;
  }> = [];
  
  Object.entries(CHANNELS).forEach(([channelId, channel]) => {
    const [gate1, gate2] = channel.gates;
    if (activeGates.has(gate1) && activeGates.has(gate2)) {
      channels.push({
        id: channelId,
        name: channel.name,
        gates: channel.gates,
        centers: [channel.center1, channel.center2],
        description: channel.description
      });
    }
  });
  
  return channels;
}

/**
 * Calculate Incarnation Cross
 */
function calculateIncarnationCross(planetGates: PlanetGate[]): {
  sunGate: number;
  earthGate: number;
  name: string;
  description: string;
} {
  const sunGate = planetGates.find(p => p.planet === 'Sun');
  const earthGate = planetGates.find(p => p.planet === 'Earth');
  
  // Earth is opposite Sun (180 degrees)
  const sunGateNum = sunGate?.gate || 1;
  const earthGateNum = earthGate?.gate || ((sunGateNum + 32 - 1) % 64) + 1;
  
  return {
    sunGate: sunGateNum,
    earthGate: earthGateNum,
    name: `Cross of ${GATES[sunGateNum]?.name || 'Unknown'}`,
    description: `Your life purpose is expressed through the energy of Gate ${sunGateNum} (${GATES[sunGateNum]?.name || 'Unknown'}) and Gate ${earthGateNum} (${GATES[earthGateNum]?.name || 'Unknown'})`
  };
}

/**
 * Calculate Definition (how centers connect)
 */
function calculateDefinition(definedCenters: string[], channels: any[]): {
  type: 'single' | 'split' | 'triple_split' | 'quadruple_split';
  description: string;
} {
  // Simplified: count how many separate groups of connected centers there are
  const connectedGroups = findConnectedGroups(definedCenters, channels);
  
  if (connectedGroups.length === 1) {
    return {
      type: 'single',
      description: 'All your defined centers are connected in one group, giving you a consistent, unified energy.'
    };
  } else if (connectedGroups.length === 2) {
    return {
      type: 'split',
      description: 'Your defined centers form two separate groups, creating a split definition that seeks completion through others.'
    };
  } else if (connectedGroups.length === 3) {
    return {
      type: 'triple_split',
      description: 'Your defined centers form three separate groups, creating a triple split definition that seeks multiple connections.'
    };
  } else {
    return {
      type: 'quadruple_split',
      description: 'Your defined centers form four or more separate groups, creating a complex definition that seeks many connections.'
    };
  }
}

/**
 * Find connected groups of centers
 */
function findConnectedGroups(definedCenters: string[], channels: any[]): string[][] {
  const groups: string[][] = [];
  const visited = new Set<string>();
  
  definedCenters.forEach(center => {
    if (visited.has(center)) return;
    
    const group: string[] = [];
    const queue = [center];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      group.push(current);
      
      // Find all centers connected to current via channels
      channels.forEach(channel => {
        const [c1, c2] = channel.centers;
        if (c1 === current && definedCenters.includes(c2) && !visited.has(c2)) {
          queue.push(c2);
        }
        if (c2 === current && definedCenters.includes(c1) && !visited.has(c1)) {
          queue.push(c1);
        }
      });
    }
    
    if (group.length > 0) {
      groups.push(group);
    }
  });
  
  return groups;
}

