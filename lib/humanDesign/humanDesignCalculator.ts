/**
 * Human Design Calculator
 * Calculates Human Design chart from birth data
 */

import { devLog } from '@/lib/devLogger';
import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';
import { calculateTropicalPlanets, calculateTropicalHouses } from '@/lib/western/tropicalCalculator';
import { 
  GATES, 
  CENTERS, 
  CHANNELS, 
  TYPES, 
  AUTHORITIES, 
  PROFILES,
  HUMAN_DESIGN_MANDALA_VERSION,
  definedCenterIdsForActiveGates,
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
  /** 2 = Rave Mandala wheel plus the 88° design chart. Older stored charts omit this. */
  mandalaVersion: typeof HUMAN_DESIGN_MANDALA_VERSION;
}

/**
 * Main function to calculate Human Design chart
 */
const DESIGN_SOLAR_ARC_DEGREES = 88;

export async function calculateHumanDesignChart(birthData: BirthData): Promise<HumanDesignChart> {
  const personalityDate = birthLocalToUTC(birthData.birthDate, birthData.birthTime, {
    latitude: birthData.latitude,
    longitude: birthData.longitude,
  });
  const designDate = findDesignInstant(personalityDate);
  const personalityChart = await getAstrologicalChart(personalityDate, birthData.latitude, birthData.longitude);
  const designChart = await getAstrologicalChart(designDate, birthData.latitude, birthData.longitude);

  const planetGates = [
    ...mapPlanetsToGates(personalityChart.planets),
    ...mapPlanetsToGates(designChart.planets.map((planet) => ({
      ...planet,
      name: `Design ${planet.name}`,
    }))),
  ];

  const centers = calculateCenters(planetGates);
  const channels = identifyChannels(planetGates);
  const type = determineType(centers.defined, channels);
  const strategy = calculateStrategy(type.id);
  const authority = identifyAuthority(centers.defined, type.id, channels);
  const profile = calculateProfile(planetGates);
  const incarnationCross = calculateIncarnationCross(planetGates);
  const definition = calculateDefinition(centers.defined, channels);

  return {
    type,
    strategy,
    authority,
    profile: {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      role: profile.role
    },
    centers,
    gates: planetGates,
    channels,
    incarnationCross,
    definition,
    mandalaVersion: HUMAN_DESIGN_MANDALA_VERSION,
  };
}

function forwardArcDegrees(fromLongitude: number, toLongitude: number): number {
  return (toLongitude - fromLongitude + 360) % 360;
}

/**
 * Design activations are the sky when the Sun was exactly 88° of solar arc before birth.
 * That instant is about 88–93 days earlier; it is not a fixed number of days.
 */
function findDesignInstant(personalityDate: Date): Date {
  const personalitySun = sunLongitudeAt(personalityDate);
  let lo = personalityDate.getTime() - 105 * 24 * 60 * 60 * 1000;
  let hi = personalityDate.getTime() - 75 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    const arc = forwardArcDegrees(sunLongitudeAt(new Date(mid)), personalitySun);
    if (arc > DESIGN_SOLAR_ARC_DEGREES) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

function sunLongitudeAt(date: Date): number {
  return calculateTropicalPlanets(date).sun.longitude;
}

/**
 * Get astrological chart data using direct calculation
 */
async function getAstrologicalChart(
  birthDateTime: Date,
  latitude: number,
  longitude: number,
): Promise<{
  planets: Array<{ name: string; longitude: number }>;
  ascendant: { longitude: number };
}> {
  try {
    // Calculate tropical planets (Human Design uses tropical zodiac)
    const planetsData = calculateTropicalPlanets(birthDateTime);
    
    // Calculate houses to get ascendant
    const houses = calculateTropicalHouses(birthDateTime, latitude, longitude);
    
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
    return calculateBasicPlanetaryPositions(birthDateTime, longitude);
  }
}

/**
 * Fallback: Calculate basic planetary positions
 */
function calculateBasicPlanetaryPositions(date: Date, longitude: number): {
  planets: Array<{ name: string; longitude: number }>;
  ascendant: { longitude: number };
} {
  // This is a simplified fallback - in production, use proper ephemeris
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

  // Calculate ascendant (simplified). `date` is already UTC.
  const siderealTime = calculateSiderealTime(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    longitude,
  );
  const ascendantLongitude = (siderealTime * 15) % 360;

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
type ActiveChannel = {
  id: string;
  name: string;
  gates: [number, number];
  centers: [string, string];
  description: string;
};

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
  planetGates.forEach(({ gate, center }) => {
    if (!centerGates[center]) {
      centerGates[center] = [];
    }
    if (!centerGates[center].includes(gate)) {
      centerGates[center].push(gate);
    }
  });

  const definedSet = new Set(definedCenterIdsForActiveGates(new Set(planetGates.map((planet) => planet.gate))));

  const defined: string[] = [];
  const undefinedCenters: string[] = [];
  const details: Record<string, {
    name: string;
    description: string;
    isDefined: boolean;
    gates: number[];
  }> = {};

  Object.values(CENTERS).forEach((center) => {
    const isDefined = definedSet.has(center.id);
    if (isDefined) {
      defined.push(center.id);
    } else {
      undefinedCenters.push(center.id);
    }
    details[center.id] = {
      name: center.name,
      description: center.description,
      isDefined,
      gates: centerGates[center.id] || []
    };
  });

  return { defined, undefined: undefinedCenters, details };
}

/**
 * Determine Human Design Type.
 * A defined Sacral is a Generator (including sacral charts whose throat reaches a motor).
 * A Manifestor has no Sacral, and a motor reaches the Throat through defined channels.
 */
function determineType(definedCenters: string[], channels: ActiveChannel[]): typeof TYPES[keyof typeof TYPES] {
  if (definedCenters.length === 0) {
    return TYPES.REFLECTOR;
  }
  if (definedCenters.includes('sacral')) {
    return TYPES.GENERATOR;
  }
  if (isThroatConnectedToMotor(channels)) {
    return TYPES.MANIFESTOR;
  }
  return TYPES.PROJECTOR;
}

const NON_SACRAL_MOTORS = ['root', 'solar_plexus', 'heart'] as const;

/**
 * True when an active channel path joins the Throat to the Root, Solar Plexus, or Heart.
 */
function isThroatConnectedToMotor(channels: ActiveChannel[]): boolean {
  const adjacent = new Map<string, string[]>();
  const link = (left: string, right: string) => {
    const leftNext = adjacent.get(left) ?? [];
    leftNext.push(right);
    adjacent.set(left, leftNext);
    const rightNext = adjacent.get(right) ?? [];
    rightNext.push(left);
    adjacent.set(right, rightNext);
  };
  channels.forEach((channel) => {
    link(channel.centers[0], channel.centers[1]);
  });
  if (!adjacent.has('throat')) return false;

  const seen = new Set<string>();
  const queue = ['throat'];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    if ((NON_SACRAL_MOTORS as readonly string[]).includes(current)) return true;
    (adjacent.get(current) ?? []).forEach((next) => {
      if (!seen.has(next)) queue.push(next);
    });
  }
  return false;
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
function channelJoins(channel: ActiveChannel, left: string, right: string): boolean {
  const centers = channel.centers;
  return (centers[0] === left && centers[1] === right) || (centers[0] === right && centers[1] === left);
}

function identifyAuthority(
  definedCenters: string[],
  typeId: string,
  channels: ActiveChannel[],
): typeof AUTHORITIES[keyof typeof AUTHORITIES] {
  if (typeId === 'reflector') {
    return AUTHORITIES.LUNAR;
  }
  if (definedCenters.includes('solar_plexus')) {
    return AUTHORITIES.EMOTIONAL;
  }
  if (definedCenters.includes('sacral')) {
    return AUTHORITIES.SACRAL;
  }
  if (definedCenters.includes('spleen')) {
    return AUTHORITIES.SPLENIC;
  }
  if (channels.some((channel) => channelJoins(channel, 'heart', 'throat') || channelJoins(channel, 'heart', 'g'))) {
    return AUTHORITIES.EGO;
  }
  if (channels.some((channel) => channelJoins(channel, 'g', 'throat'))) {
    return AUTHORITIES.SELF_PROJECTED;
  }
  return AUTHORITIES.ENVIRONMENTAL;
}

/**
 * Profile is the personality Sun line over the design Sun line (88° earlier), not Sun/Earth.
 */
function calculateProfile(planetGates: PlanetGate[]): {
  id: string;
  name: string;
  description: string;
  role: string;
} {
  const sunLine = planetGates.find((planet) => planet.planet === 'Sun')?.line || 1;
  const designSunLine = planetGates.find((planet) => planet.planet === 'Design Sun')?.line || 1;
  const profileKey = `${sunLine}/${designSunLine}` as keyof typeof PROFILES;
  const profile = PROFILES[profileKey];
  if (profile) {
    return {
      id: profileKey,
      name: `${profileKey} ${profile.name}`,
      description: profile.description,
      role: profile.role,
    };
  }
  return {
    id: profileKey,
    name: profileKey,
    description: `Profile ${profileKey}`,
    role: `Profile ${profileKey}`,
  };
}

/**
 * Identify active channels
 */
function identifyChannels(planetGates: PlanetGate[]): ActiveChannel[] {
  const activeGates = new Set(planetGates.map(p => p.gate));
  const channels: ActiveChannel[] = [];
  
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
function calculateDefinition(definedCenters: string[], channels: ActiveChannel[]): {
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
function findConnectedGroups(definedCenters: string[], channels: ActiveChannel[]): string[][] {
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

