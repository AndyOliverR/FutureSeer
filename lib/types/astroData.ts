// Unified Astrological Data Types
// Supports both Vedic and Western systems with a common interface

export interface VedicAscendant {
  signName: string;
  sign: string | number;
  degreeInSign: number;
  lord: string;
  nakshatra?: string;
  nakshatraPada?: number;
}

export interface Planet {
  name: string;
  sign: string;
  signName?: string;
  degree: number;
  degreeInSign?: number;
  house: number;
  longitude: number;
  latitude?: number;
  speed?: number;
  isRetrograde: boolean;
  nakshatra?: string;
  nakshatraPada?: number;
  dignity?: {
    exalted?: boolean;
    debilitated?: boolean;
    ownSign?: boolean;
    moolatrikona?: boolean;
    strength?: string;
  };
}

export interface House {
  number: number;
  sign: string;
  signName?: string;
  degree: number;
  cusp?: number;
  lord?: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  angle: number;
  influence?: string;
}

export interface Dasha {
  planet?: string;
  name?: string;
  startDate: string;
  endDate: string;
  duration: number;
  dashaType?: string;
  isCurrent?: boolean;
  progress?: number;
  effects?: string[];
}

export interface DivisionalCharts {
  D9?: Record<string, any>;  // Navamsa
  D10?: Record<string, any>; // Dasamsa
  D12?: Record<string, any>; // Dwadasamsa
  D30?: Record<string, any>; // Trimsamsa
}

export interface NakshatraInfo {
  name: string;
  lord: string;
  pada: number;
  degree: number;
  symbol?: string;
  deity?: string;
  characteristics?: string[];
}

export interface Yoga {
  name: string;
  type: string;
  description: string;
  strength?: string;
  planets?: string[];
}

export interface LunarPhase {
  phase: string;
  illumination: number;
  age: number;
}

export interface Progression {
  planet: string;
  position: number;
  sign: string;
}

export interface Transit {
  planet: string;
  aspect: string;
  targetPlanet: string;
  orb: number;
  effect: string;
}

export interface UnifiedAstroData {
  // Common fields (required for both systems)
  userId: string;
  birthDate: string;
  birthTime?: string;
  birthPlace: string;
  lastFetched: number;
  
  // Core signs (extracted differently for Vedic vs Western)
  sunSign: string;
  moonSign: string;
  risingSign: string;
  
  // Planetary data (format varies by system)
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  
  // Elements and Modalities
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  
  // System-specific data (optional)
  vedic?: {
    ascendant: VedicAscendant;
    dasha: Dasha[];
    currentDasha: Dasha | null;
    divisionalCharts: DivisionalCharts;
    nakshatras: NakshatraInfo[];
    yogas: Yoga[];
  };
  
  western?: {
    lunarPhase: LunarPhase;
    progressions: Progression[];
    transits: Transit[];
  };
  
  // Insights
  personalityTraits?: string[];
  lifePath?: string;
  challenges?: string[];
  strengths?: string[];
  compatibility?: {
    bestMatches: string[];
    challengingMatches: string[];
  };
  
  // Metadata
  metadata: {
    system: 'vedic' | 'western' | 'hybrid';
    version: string;
    source: string;
    isVedicFormat?: boolean;
    confidence?: number;
  };
}

// Type guards
export function isVedicData(data: any): boolean {
  return data?.metadata?.isVedicFormat === true || 
         (data?.ascendant && typeof data.ascendant === 'object');
}

export function isWesternData(data: any): boolean {
  return data?.metadata?.system === 'western' ||
         (data?.sun_sign && typeof data?.sun_sign === 'string');
}

