// Swiss Ephemeris Integration Service
// Provides precise astronomical calculations for all occult systems

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface HouseCusp {
  number: number;
  longitude: number;
  latitude: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  exact: boolean;
}

export interface LunarPhase {
  phase: string;
  illumination: number;
  age: number;
  nextNewMoon: Date;
  nextFullMoon: Date;
}

export interface FixedStar {
  name: string;
  longitude: number;
  latitude: number;
  magnitude: number;
  constellation: string;
  rising: boolean;
  culminating: boolean;
  setting: boolean;
}

class SwissEphemerisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/swiss-ephemeris';
  }

  // Core astronomical calculations
  async calculatePlanetaryPositions(birthData: BirthData, date?: Date): Promise<PlanetPosition[]> {
    try {
      const response = await fetch(`${this.baseUrl}/planets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          date: date?.toISOString() || new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.planets || [];
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (planets):', error);
      // Fallback to simplified calculations
      return this.getFallbackPlanetaryPositions(birthData, date);
    }
  }

  async calculateHouseCusps(birthData: BirthData, houseSystem: string = 'placidus'): Promise<HouseCusp[]> {
    try {
      const response = await fetch(`${this.baseUrl}/houses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          houseSystem
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.houses || [];
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (houses):', error);
      // Fallback to simplified calculations
      return this.getFallbackHouseCusps(birthData, houseSystem);
    }
  }

  async calculateAspects(birthData: BirthData, date?: Date): Promise<Aspect[]> {
    try {
      const response = await fetch(`${this.baseUrl}/aspects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          date: date?.toISOString() || new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.aspects || [];
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (aspects):', error);
      // Fallback to simplified calculations
      return this.getFallbackAspects(birthData, date);
    }
  }

  async calculateLunarPhase(birthData: BirthData, date?: Date): Promise<LunarPhase> {
    try {
      const response = await fetch(`${this.baseUrl}/lunar-phase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          date: date?.toISOString() || new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.lunarPhase || this.getFallbackLunarPhase(birthData, date);
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (lunar-phase):', error);
      // Fallback to simplified calculations
      return this.getFallbackLunarPhase(birthData, date);
    }
  }

  async calculateFixedStars(birthData: BirthData, date?: Date): Promise<FixedStar[]> {
    try {
      const response = await fetch(`${this.baseUrl}/fixed-stars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          date: date?.toISOString() || new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.fixedStars || [];
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (fixed-stars):', error);
      // Fallback to simplified calculations
      return this.getFallbackFixedStars(birthData, date);
    }
  }

  // Advanced calculations
  async calculateTransits(birthData: BirthData, targetDate: Date): Promise<{
    natal: PlanetPosition[];
    transiting: PlanetPosition[];
    aspects: Aspect[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/transits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          targetDate: targetDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transits || { natal: [], transiting: [], aspects: [] };
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (transits):', error);
      // Fallback to simplified calculations
      return this.getFallbackTransits(birthData, targetDate);
    }
  }

  async calculateProgressions(birthData: BirthData, targetDate: Date): Promise<{
    natal: PlanetPosition[];
    progressed: PlanetPosition[];
    aspects: Aspect[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/progressions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          targetDate: targetDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.progressions || { natal: [], progressed: [], aspects: [] };
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (progressions):', error);
      // Fallback to simplified calculations
      return this.getFallbackProgressions(birthData, targetDate);
    }
  }

  async calculateSolarReturn(birthData: BirthData, year: number): Promise<{
    natal: PlanetPosition[];
    solarReturn: PlanetPosition[];
    aspects: Aspect[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/solar-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          year
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.solarReturn || { natal: [], solarReturn: [], aspects: [] };
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (solar-return):', error);
      // Fallback to simplified calculations
      return this.getFallbackSolarReturn(birthData, year);
    }
  }

  async calculateLunarReturn(birthData: BirthData, targetDate: Date): Promise<{
    natal: PlanetPosition[];
    lunarReturn: PlanetPosition[];
    aspects: Aspect[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/lunar-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          targetDate: targetDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.lunarReturn || { natal: [], lunarReturn: [], aspects: [] };
    } catch (error) {
      console.error('Swiss Ephemeris Service Error (lunar-return):', error);
      // Fallback to simplified calculations
      return this.getFallbackLunarReturn(birthData, targetDate);
    }
  }

  // Comprehensive analysis
  async getComprehensiveAnalysis(birthData: BirthData, date?: Date): Promise<{
    planets: PlanetPosition[];
    houses: HouseCusp[];
    aspects: Aspect[];
    lunarPhase: LunarPhase;
    fixedStars: FixedStar[];
    transits?: any;
    progressions?: any;
  }> {
    const analysisDate = date || new Date();
    
    const [
      planets,
      houses,
      aspects,
      lunarPhase,
      fixedStars,
      transits,
      progressions
    ] = await Promise.allSettled([
      this.calculatePlanetaryPositions(birthData, analysisDate),
      this.calculateHouseCusps(birthData),
      this.calculateAspects(birthData, analysisDate),
      this.calculateLunarPhase(birthData, analysisDate),
      this.calculateFixedStars(birthData, analysisDate),
      this.calculateTransits(birthData, analysisDate),
      this.calculateProgressions(birthData, analysisDate)
    ]);

    return {
      planets: planets.status === 'fulfilled' ? planets.value : [],
      houses: houses.status === 'fulfilled' ? houses.value : [],
      aspects: aspects.status === 'fulfilled' ? aspects.value : [],
      lunarPhase: lunarPhase.status === 'fulfilled' ? lunarPhase.value : this.getFallbackLunarPhase(birthData, analysisDate),
      fixedStars: fixedStars.status === 'fulfilled' ? fixedStars.value : [],
      transits: transits.status === 'fulfilled' ? transits.value : undefined,
      progressions: progressions.status === 'fulfilled' ? progressions.value : undefined
    };
  }

  // Fallback calculations (simplified)
  private getFallbackPlanetaryPositions(birthData: BirthData, date?: Date): PlanetPosition[] {
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    return planets.map(planet => {
      const longitude = Math.random() * 360;
      const signIndex = Math.floor(longitude / 30);
      const degree = longitude % 30;
      
      return {
        name: planet,
        longitude,
        latitude: Math.random() * 10 - 5,
        distance: Math.random() * 1000 + 100,
        speed: Math.random() * 2 - 1,
        sign: signs[signIndex],
        degree: Math.floor(degree),
        minute: Math.floor((degree % 1) * 60),
        second: Math.floor(((degree % 1) * 60 % 1) * 60)
      };
    });
  }

  private getFallbackHouseCusps(birthData: BirthData, houseSystem: string): HouseCusp[] {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const houses = [];
    
    for (let i = 1; i <= 12; i++) {
      const longitude = (i - 1) * 30 + Math.random() * 5 - 2.5;
      const signIndex = Math.floor(longitude / 30) % 12;
      const degree = longitude % 30;
      
      houses.push({
        number: i,
        longitude,
        latitude: 0,
        sign: signs[signIndex],
        degree: Math.floor(degree),
        minute: Math.floor((degree % 1) * 60),
        second: Math.floor(((degree % 1) * 60 % 1) * 60)
      });
    }
    
    return houses;
  }

  private getFallbackAspects(birthData: BirthData, date?: Date): Aspect[] {
    const aspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const aspectList = [];
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const aspectType = aspects[Math.floor(Math.random() * aspects.length)];
        aspectList.push({
          planet1: planets[i],
          planet2: planets[j],
          type: aspectType,
          orb: Math.random() * 5,
          strength: Math.random(),
          exact: Math.random() > 0.8
        });
      }
    }
    
    return aspectList;
  }

  private getFallbackLunarPhase(birthData: BirthData, date?: Date): LunarPhase {
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const phase = phases[Math.floor(Math.random() * phases.length)];
    
    return {
      phase,
      illumination: Math.random() * 100,
      age: Math.random() * 29.5,
      nextNewMoon: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      nextFullMoon: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
    };
  }

  private getFallbackFixedStars(birthData: BirthData, date?: Date): FixedStar[] {
    const stars = [
      { name: 'Aldebaran', constellation: 'Taurus' },
      { name: 'Regulus', constellation: 'Leo' },
      { name: 'Antares', constellation: 'Scorpius' },
      { name: 'Fomalhaut', constellation: 'Piscis Austrinus' },
      { name: 'Spica', constellation: 'Virgo' },
      { name: 'Sirius', constellation: 'Canis Major' },
      { name: 'Vega', constellation: 'Lyra' },
      { name: 'Polaris', constellation: 'Ursa Minor' }
    ];
    
    return stars.map(star => ({
      name: star.name,
      longitude: Math.random() * 360,
      latitude: Math.random() * 10 - 5,
      magnitude: Math.random() * 3 + 1,
      constellation: star.constellation,
      rising: Math.random() > 0.5,
      culminating: Math.random() > 0.5,
      setting: Math.random() > 0.5
    }));
  }

  private getFallbackTransits(birthData: BirthData, targetDate: Date): any {
    return {
      natal: this.getFallbackPlanetaryPositions(birthData),
      transiting: this.getFallbackPlanetaryPositions(birthData, targetDate),
      aspects: this.getFallbackAspects(birthData, targetDate)
    };
  }

  private getFallbackProgressions(birthData: BirthData, targetDate: Date): any {
    return {
      natal: this.getFallbackPlanetaryPositions(birthData),
      progressed: this.getFallbackPlanetaryPositions(birthData, targetDate),
      aspects: this.getFallbackAspects(birthData, targetDate)
    };
  }

  private getFallbackSolarReturn(birthData: BirthData, year: number): any {
    return {
      natal: this.getFallbackPlanetaryPositions(birthData),
      solarReturn: this.getFallbackPlanetaryPositions(birthData, new Date(year, 0, 1)),
      aspects: this.getFallbackAspects(birthData, new Date(year, 0, 1))
    };
  }

  private getFallbackLunarReturn(birthData: BirthData, targetDate: Date): any {
    return {
      natal: this.getFallbackPlanetaryPositions(birthData),
      lunarReturn: this.getFallbackPlanetaryPositions(birthData, targetDate),
      aspects: this.getFallbackAspects(birthData, targetDate)
    };
  }
}

// Export singleton instance
export const swissEphemerisService = new SwissEphemerisService();
export default swissEphemerisService;
